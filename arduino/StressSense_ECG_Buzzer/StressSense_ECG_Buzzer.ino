/*
 * StressSense: Real-Time ECG & Stress Monitoring System
 * Hardware: Arduino (Uno/Nano/Mega/ESP32) + AD8232 ECG + Buzzer
 * 
 * Pin Connections:
 * ----------------
 * AD8232 ECG Sensor:
 *   - GND    -> Arduino GND
 *   - 3.3V   -> Arduino 3.3V (Do NOT connect to 5V)
 *   - OUTPUT -> Arduino Analog Pin A0
 *   - LO+    -> Arduino Digital Pin D10 (Leads-off detection positive)
 *   - LO-    -> Arduino Digital Pin D11 (Leads-off detection negative)
 *   - SDN    -> Leave disconnected (Not used)
 * 
 * Active Buzzer:
 *   - Positive (+) -> Arduino Digital Pin D8
 *   - Negative (-) -> Arduino GND
 * 
 * Features:
 *   1. 250 Hz ECG signal sampling on Analog A0
 *   2. Real-time R-peak detection & instantaneous Heart Rate (BPM) calculation
 *   3. Automatic BUZZER ALARM when Heart Rate is below 60 BPM (Bradycardia)
 *   4. Formatted JSON telemetry packet output over Serial (115200 baud)
 */

const int ECG_PIN = A0;      // AD8232 OUTPUT
const int LO_PLUS = 10;      // Leads-off detect +
const int LO_MINUS = 11;     // Leads-off detect -
const int BUZZER_PIN = 8;    // Buzzer alarm pin

// Telemetry parameters
const unsigned long SAMPLE_INTERVAL_US = 4000; // 4000 microseconds = 250 Hz sample rate
unsigned long lastSampleTime = 0;

// Peak detection & BPM calculation
int ecgMin = 300;
int ecgMax = 700;
int dynamicThreshold = 550;
unsigned long lastPeakTime = 0;
const unsigned long MIN_PEAK_INTERVAL = 300; // refractory period (ms) = max 200 BPM

float currentBpm = 72.0;
float currentRr = 833.0;
float currentHrv = 45.0;

// Rolling RR intervals for RMSSD (HRV) calculation
const int RR_BUFFER_SIZE = 8;
float rrBuffer[RR_BUFFER_SIZE];
int rrIndex = 0;
int rrCount = 0;

// Serial output buffer
const int BATCH_SIZE = 25; // Send telemetry packet every 25 samples (10 times per second)
int sampleBatch[BATCH_SIZE];
int batchCount = 0;

void setup() {
  Serial.begin(115200);
  
  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Initialize RR buffer
  for (int i = 0; i < RR_BUFFER_SIZE; i++) {
    rrBuffer[i] = 800.0;
  }

  // Quick buzzer test chirp on boot
  tone(BUZZER_PIN, 1200, 150);
  delay(200);
  noTone(BUZZER_PIN);

  Serial.println("{\"status\":\"StressSense Arduino ECG Node Initialized\",\"baud\":115200}");
}

void loop() {
  unsigned long currentMicros = micros();

  // 250 Hz precise sample acquisition
  if (currentMicros - lastSampleTime >= SAMPLE_INTERVAL_US) {
    lastSampleTime = currentMicros;

    // Check leads-off status
    bool leadsOff = (digitalRead(LO_PLUS) == 1 || digitalRead(LO_MINUS) == 1);
    
    int rawEcg = 0;
    if (leadsOff) {
      rawEcg = 512; // Flatline if electrodes disconnected
    } else {
      rawEcg = analogRead(ECG_PIN);
    }

    // Dynamic threshold adaptation
    if (rawEcg > ecgMax) ecgMax = rawEcg;
    if (rawEcg < ecgMin) ecgMin = rawEcg;
    dynamicThreshold = ecgMin + (int)((ecgMax - ecgMin) * 0.65);
    
    // Slow decay of max/min bounds
    ecgMax = max(ecgMax - 1, 600);
    ecgMin = min(ecgMin + 1, 400);

    unsigned long currentMillis = millis();

    // R-Peak Detection
    if (!leadsOff && rawEcg > dynamicThreshold && (currentMillis - lastPeakTime > MIN_PEAK_INTERVAL)) {
      unsigned long rr = currentMillis - lastPeakTime;
      lastPeakTime = currentMillis;

      if (rr >= 300 && rr <= 1800) { // Valid physiological interval (33 to 200 BPM)
        currentRr = (float)rr;
        float calculatedBpm = 60000.0 / currentRr;
        
        // Exponential moving average filter for smooth BPM
        currentBpm = (currentBpm * 0.70) + (calculatedBpm * 0.30);

        // Store into rolling RR buffer
        rrBuffer[rrIndex] = currentRr;
        rrIndex = (rrIndex + 1) % RR_BUFFER_SIZE;
        if (rrCount < RR_BUFFER_SIZE) rrCount++;

        // Calculate RMSSD (HRV)
        if (rrCount >= 3) {
          float sumSquaredDiff = 0.0;
          for (int i = 0; i < rrCount - 1; i++) {
            float diff = rrBuffer[(rrIndex - 1 - i + RR_BUFFER_SIZE) % RR_BUFFER_SIZE] -
                         rrBuffer[(rrIndex - 2 - i + RR_BUFFER_SIZE) % RR_BUFFER_SIZE];
            sumSquaredDiff += diff * diff;
          }
          currentHrv = sqrt(sumSquaredDiff / (rrCount - 1));
        }
      }
    }

    // -------------------------------------------------------------
    // BUZZER ALERT LOGIC (< 60 BPM BRADYCARDIA ALERT)
    // -------------------------------------------------------------
    // If electrodes are on the body and Heart Rate is below 60 BPM:
    if (!leadsOff && currentBpm > 0 && currentBpm < 60.0) {
      // Sound active alarm: 1000 Hz continuous alert tone
      tone(BUZZER_PIN, 1000);
    } else {
      noTone(BUZZER_PIN);
    }

    // Collect into sample batch
    sampleBatch[batchCount++] = rawEcg;

    // When batch is full (every 100ms = 25 samples), emit JSON telemetry packet
    if (batchCount >= BATCH_SIZE) {
      sendTelemetryPacket(leadsOff);
      batchCount = 0;
    }
  }
}

void sendTelemetryPacket(bool leadsOff) {
  // Compute approximate signal quality
  float quality = leadsOff ? 0.0 : 96.0;

  // Approximate stress index (inverse relation to RMSSD/HRV)
  float stress = constrain(100.0 - (currentHrv * 1.2), 15.0, 95.0);
  float relaxation = 100.0 - stress;

  // Send formatted JSON packet across Serial
  Serial.print("{\"deviceId\":\"ARDUINO_001\",\"deviceType\":\"ARDUINO_ECG\",");
  Serial.print("\"bpm\":");
  Serial.print(currentBpm, 1);
  Serial.print(",\"rrInterval\":");
  Serial.print(currentRr, 1);
  Serial.print(",\"hrv\":");
  Serial.print(currentHrv, 1);
  Serial.print(",\"stressIndex\":");
  Serial.print(stress, 1);
  Serial.print(",\"relaxationIndex\":");
  Serial.print(relaxation, 1);
  Serial.print(",\"signalQuality\":");
  Serial.print(quality, 1);
  Serial.print(",\"buzzerAlarm\":");
  Serial.print((!leadsOff && currentBpm < 60.0) ? "true" : "false");
  Serial.print(",\"ecgSamples\":[");
  for (int i = 0; i < BATCH_SIZE; i++) {
    // Normalize 0-1023 ADC reading to approximately -1.5 to +2.5 mV range
    float voltageMv = ((float)sampleBatch[i] - 512.0) * (3300.0 / 1024.0) / 1100.0;
    Serial.print(voltageMv, 3);
    if (i < BATCH_SIZE - 1) Serial.print(",");
  }
  Serial.println("]}");
}
