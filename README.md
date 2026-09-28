# StressSense: IoT-Based Stress & Relaxation Monitoring

> **Real-Time Stress & Relaxation Monitoring Using ECG and Pulse Signals**  
> *A full-stack, hardware-independent biomedical telemetry platform for real-time physiological stress and relaxation monitoring.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-brightgreen?style=for-the-badge)](https://iot-stress-sense-frontend.onrender.com/)

---

## 🔗 Live Application

> 🌐 **Live Demo**: [https://iot-stress-sense-frontend.onrender.com/](https://iot-stress-sense-frontend.onrender.com/)  
> *(Real-time stress & relaxation monitoring dashboard with live biosignal waveforms and interactive controls)*


---

## 1. Project Overview

**StressSense** is a full-stack, hardware-independent biomedical telemetry platform designed to monitor and evaluate physiological stress and relaxation states in real-time. By synchronously acquiring and analyzing **Electrocardiogram (ECG)** Lead II signals and **Photoplethysmogram (PPG)** optical volumetric pulse waveforms, the system derives autonomic nervous system indicators such as **Heart Rate (BPM)** and **Heart Rate Variability (HRV / RMSSD)**.

### Hardware Independence Principle
The exact microcontroller (e.g., **Arduino**, **ESP32**, or **Raspberry Pi Pico W**) has not been restricted or hardcoded in the software architecture. The backend accepts serialized physiological readings from any network-capable IoT node via a standard, universal REST API endpoint (`POST /api/sensor/data`). 

In Phase 1, a realistic, mathematically modelled **Physiological Sensor Simulator** is embedded directly into the Spring Boot backend. It generates authentic synthetic waveforms (P-QRS-T complexes, systolic peaks, and dicrotic notches with respiratory sinus arrhythmia) at 250 SPS. When physical hardware is finalized, the firmware simply posts to the same endpoint without requiring any redesign of the backend or React frontend.

---

## 2. Key Features

- **Hardware-Agnostic Ingestion Bus**: Standard JSON payload format across simulators, Arduino, ESP32, or custom hardware nodes.
- **Continuous Biosignal Oscilloscopes**: High-performance canvas-rendered Lead II ECG and optical PPG charts with medical grid lines and sweep indicators at 60 FPS.
- **Modular Autonomic Analysis**: Algorithmic estimation of **Estimated Stress Index (0–100%)** and **Estimated Relaxation Index (0–100%)** using a multi-factor model (HRV RMSSD, Heart Rate divergence, and R-R rhythm consistency).
- **Radial Autonomic Gauges**: Visual dynamic arc gauges that transition between Optimal (Emerald), Moderate (Amber), and Elevated (Red) stress states.
- **Biometric Session Recording**: Live session management with start, pause, stop controls, and real-time timers.
- **Post-Session Diagnostic Reports**: Comprehensive summaries featuring min/max/average metrics, longitudinal trend charts (Recharts), algorithmically synthesized key observations, and print/PDF export.
- **4-4-6 Guided Respiration Pacing**: Interactive breathing circle mode with before-and-after physiological comparison metrics to demonstrate parasympathetic activation.
- **Device Management**: Registry tracking device health, data rates, connection states, and last seen timestamps, along with a built-in cURL hardware injection test harness.
- **Low-Latency WebSocket Streaming**: Sub-millisecond broadcast of 250 SPS samples over `ws://localhost:8080/ws/sensor` with automatic reconnection.
- **Dual Visual Theme**: Professional light and dark navy themes with persistent preference storage.

---

## 3. System Architecture

```
+-------------------------------------------------------------+
|              DATA ACQUISITION LAYER (Hardware)              |
|                                                             |
|   [AD8232 ECG Sensor]            [MAX30102 Pulse Sensor]    |
|   (Lead II Electrodes)          (IR / Red Photodiode)      |
|             \                             /                 |
|              +-------------+-------------+                  |
|                            |                                |
|                 [Generic IoT Controller]                    |
|             (Arduino / ESP32 / Simulator)                   |
+----------------------------+--------------------------------+
                             |  Wi-Fi / LAN (JSON over HTTP)
                             v
+-------------------------------------------------------------+
|               SPRING BOOT 3 BACKEND (Port 8080)             |
|                                                             |
|  POST /api/sensor/data  <--->  SensorDataController         |
|                                         |                   |
|                                         v                   |
|                              StressAnalysisService          |
|                                         |                   |
|             +---------------------------+-----------+       |
|             |                                       |       |
|             v                                       v       |
|     [PostgreSQL 17 DB]                    [WebSocket Broker]|
|   (SensorReadings, Sessions,              (/ws/sensor)      |
|    Device Registry)                                 |       |
+-----------------------------------------------------+-------+
                                                      |
                                     Real-Time Stream | (JSON WebSocket)
                                                      v
+-------------------------------------------------------------+
|               REACT 18 FRONTEND (Port 5173)                 |
|                                                             |
|   - Live ECG & PPG Oscilloscope Canvases                    |
|   - Radial Stress & Relaxation Gauges                       |
|   - Guided Respiration Pacer (4-4-6 RSA Mode)               |
|   - Session History & PDF-Ready Diagnostic Reports          |
|   - IoT Hardware Management & Ingestion Test Harness        |
+-------------------------------------------------------------+
```

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Tooling**: Vite 8
- **Styling**: Tailwind CSS 3.4 (with dark mode support)
- **Icons**: Lucide React
- **Charting**: High-performance HTML5 Canvas (Oscilloscopes) + Recharts (Longitudinal Trends)
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **Streaming**: Native HTML5 WebSocket API with automatic exponential backoff

### Backend
- **Language**: Java 17+ (Compiled with target release 17, tested on Java 17/21/25)
- **Framework**: Spring Boot 3.3.4
- **Web & Routing**: Spring Web MVC
- **Data Persistence**: Spring Data JPA / Hibernate 6
- **Real-Time Communication**: Spring WebSocket (`TextWebSocketHandler`)
- **Validation**: Jakarta Bean Validation
- **JSON Engine**: Jackson Databind with JavaTimeModule
- **Build System**: Apache Maven 3.9+

### Database
- **Engine**: PostgreSQL 17 (Natively installed or via Docker Compose)
- **Configuration**: Automatic schema migrations via Hibernate DDL

---

## 5. Folder Structure

```
stresssense/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/stresssense/
│   │   │   │   ├── config/              # WebSocket & Web MVC CORS config
│   │   │   │   ├── controller/          # REST Controllers (Sensor, Session, Device, etc.)
│   │   │   │   ├── dto/                 # Request & Response Data Transfer Objects
│   │   │   │   ├── entity/              # JPA Entities (Device, Session, SensorReading)
│   │   │   │   ├── exception/           # Global Exception Handler & Custom Exceptions
│   │   │   │   ├── repository/          # Spring Data JPA Repositories
│   │   │   │   ├── service/             # Business Logic & StressAnalysisService
│   │   │   │   ├── simulator/           # Physiological Biosignal Waveform Simulator
│   │   │   │   ├── util/                # DoubleListConverter (JSON sample serialization)
│   │   │   │   └── websocket/           # WebSocket Handler & Broadcast Engine
│   │   │   └── resources/
│   │   │       └── application.properties # Spring Boot configuration
│   └── pom.xml                          # Maven build dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/                  # ECGChart and PulseChart canvas components
│   │   │   ├── gauges/                  # Radial StressGauge and RelaxationGauge
│   │   │   ├── layout/                  # AppLayout, Sidebar, and Topbar
│   │   │   └── monitoring/              # MetricCard, SessionControls, WellnessStatus
│   │   ├── context/                     # ThemeContext & MonitoringContext
│   │   ├── pages/                       # Login, Dashboard, Live, Breathing, Sessions, Report, Devices, Settings, About
│   │   ├── services/                    # Axios API client & SensorWebSocketService
│   │   ├── types/                       # TypeScript interfaces
│   │   ├── App.tsx                      # Root Router configuration
│   │   ├── index.css                    # Tailwind & medical grid styling
│   │   └── main.tsx                     # React application entrypoint
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docker-compose.yml                   # PostgreSQL container service definition
├── .gitignore
└── README.md                            # Comprehensive technical documentation
```

---

## 6. PostgreSQL Setup

### Option A: Local Native PostgreSQL (Default)
If PostgreSQL is installed locally:
```bash
# Connect to PostgreSQL as admin and run:
CREATE USER stresssense WITH PASSWORD 'stresssense';
CREATE DATABASE stresssense OWNER stresssense;
GRANT ALL PRIVILEGES ON DATABASE stresssense TO stresssense;
```

### Option B: Docker Compose
If you prefer running PostgreSQL via Docker:
```bash
# From the project root:
docker-compose up -d
```
The database will be exposed on `localhost:5432` with username `stresssense`, password `stresssense`, and database `stresssense`.

---

## 7. Backend Setup & Execution

### Prerequisites
- JDK 17 or higher
- Apache Maven 3.8+

### Build & Run
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
The backend initializes in approximately 1.5 seconds:
- **REST API Base**: `http://localhost:8080/api`
- **WebSocket URL**: `ws://localhost:8080/ws/sensor`
- **Embedded Simulator**: Automatically begins streaming synthetic signals for device `SIMULATOR_001`.

---

## 8. Frontend Setup & Execution

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm 9+

### Install Dependencies & Start Dev Server
```bash
cd frontend
npm install
npm run dev
```
The web dashboard opens at:
**`http://localhost:5173/`**

---

## 9. Sensor Simulator Configuration

The built-in simulator synthesizes authentic physiological waveforms:
- **ECG Model**: Sum of Gaussian envelopes generating realistic **P wave**, **QRS complex**, and **T wave** morphology with baseline wander.
- **PPG Model**: Optical absorption wave modeling the **systolic upstroke**, **dicrotic notch**, and **diastolic runoff**.
- **Autonomic Modulation**: Modulates Heart Rate (72–85 BPM) with a 0.2 Hz sinusoidal respiration cycle to simulate real Respiratory Sinus Arrhythmia (RSA).

### Properties (`application.properties`)
```properties
simulation.enabled=true
simulation.interval-ms=500
simulation.device-id=SIMULATOR_001
simulation.device-type=SIMULATOR
```

### Simulator Runtime APIs
- `POST /api/simulator/start` - Start background generation
- `POST /api/simulator/stop` - Pause background generation
- `GET /api/simulator/status` - Query simulator running state and packet count

---

## 10. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sensor/data` | Ingest raw sensor payload from simulator, Arduino, or ESP32 |
| `GET` | `/api/sensor/latest/{deviceId}` | Retrieve the most recent reading for a device |
| `GET` | `/api/sensor/history/{deviceId}?limit=50` | Retrieve chronological reading history for trend charts |
| `POST` | `/api/session/start` | Start a new biometric recording session (`{"deviceId": "..."}`) |
| `POST` | `/api/session/{sessionId}/stop` | Stop and finalize session; computes aggregate statistics |
| `GET` | `/api/session/{sessionId}` | Get session details |
| `GET` | `/api/session/{sessionId}/report` | Get full diagnostic report with trends and observations |
| `GET` | `/api/session` | List all historical monitoring sessions |
| `GET` | `/api/devices` | List all registered IoT devices and simulators |
| `GET` | `/api/devices/{deviceId}` | Get single device status |
| `POST` | `/api/simulator/start` | Start the synthetic physiological signal simulator |
| `POST` | `/api/simulator/stop` | Stop the synthetic physiological signal simulator |
| `GET` | `/api/simulator/status` | Query simulator runtime state |
| `GET` | `/api/health` | Health and readiness check |

---

## 11. WebSocket Documentation

- **Endpoint**: `ws://localhost:8080/ws/sensor`
- **Protocol**: Standard WebSocket (Text/JSON frames)
- **Broadcast Frequency**: 2 Hz (Every 500 ms)
- **CORS**: Configured with permissive origin mapping (`*`)

### Outgoing WebSocket Message Structure
```json
{
  "id": 1042,
  "deviceId": "SIMULATOR_001",
  "deviceType": "SIMULATOR",
  "sessionId": 12,
  "timestamp": "2026-09-25T08:50:35.393224",
  "bpm": 78.5,
  "rrInterval": 764.3,
  "hrv": 52.5,
  "stressIndex": 39.0,
  "relaxationIndex": 63.5,
  "wellnessState": "MODERATE STRESS",
  "wellnessDescription": "Estimated stress is currently moderate based on the available physiological signal features.",
  "signalQuality": 98.5,
  "ecgSamples": [503.5, 507.7, 504.0, 507.3, 506.5, ...],
  "pulseSamples": [320.4, 328.1, 345.0, 390.2, 435.6, ...]
}
```

---

## 12. Future Real Hardware Integration

When physical hardware is selected (e.g. Arduino UNO R4, ESP32, STM32), **no backend or frontend code changes are required**.

### Recommended Hardware Components
1. **ECG Sensor**: AD8232 Single-Lead Heart Rate Monitor with 3-electrode cable (RA, LA, RL).
2. **Pulse Sensor**: MAX30102 Pulse Oximeter & Heart Rate Sensor Module (I2C interface).
3. **Microcontroller**: Any IoT board with Wi-Fi (e.g., ESP32 NodeMCU, Arduino R4 WiFi).

### IoT Firmware Transmission Logic
The microcontroller samples the sensors at 250 Hz, buffers 100–250 samples, and performs a standard HTTP POST request every 500ms to the backend:

```http
POST /api/sensor/data HTTP/1.1
Host: <BACKEND_IP>:8080
Content-Type: application/json

{
  "deviceId": "DEVICE_001",
  "deviceType": "ESP32",
  "timestamp": "2026-09-25T10:15:30",
  "bpm": 74.0,
  "rrInterval": 810.0,
  "hrv": 48.5,
  "ecgSamples": [512, 518, 524, 610, 750, 480, 510, ...],
  "pulseSamples": [320, 335, 360, 410, 440, 390, 350, ...]
}
```

The device will immediately register in the Devices page, and all live oscilloscopes, radial gauges, and session reports will display data from the physical controller.

---

## 13. Testing Procedure

### Verification of Complete Pipeline
1. **Check Backend Health**:
   ```bash
   curl http://localhost:8080/api/health
   ```
2. **Verify Active Simulator**:
   ```bash
   curl http://localhost:8080/api/simulator/status
   ```
3. **Verify Live Telemetry Ingestion**:
   ```bash
   curl http://localhost:8080/api/sensor/latest/SIMULATOR_001
   ```
4. **Test Real-Time WebSocket Delivery**:
   ```bash
   node --no-warnings -e '
   const ws = new WebSocket("ws://localhost:8080/ws/sensor");
   ws.onmessage = (e) => {
     const d = JSON.parse(e.data);
     console.log("Telemetry Received: HR=" + d.bpm + " BPM, Stress=" + d.stressIndex + "%");
     ws.close();
   };'
   ```
5. **Simulate External Hardware Injection**:
   ```bash
   curl -X POST http://localhost:8080/api/sensor/data \
     -H "Content-Type: application/json" \
     -d '{
       "deviceId": "DEVICE_001",
       "deviceType": "ARDUINO_WIFI",
       "bpm": 72.0,
       "rrInterval": 833.0,
       "hrv": 54.0,
       "ecgSamples": [512, 520, 540, 710, 470, 512],
       "pulseSamples": [320, 340, 380, 430, 380, 330]
     }'
   ```
6. **Open Web Application**:
   Navigate to `http://localhost:5173/` and verify:
   - Dashboard loads with live metric cards and moving ECG preview.
   - Live Monitoring (`/live`) updates ECG and PPG waveforms continuously.
   - Clicking **Start Session** begins active recording.
   - Clicking **Stop & Save Report** finalizes the session and displays trend analytics and key observations.
   - Guided Breathing mode executes the 4-4-6 respiration cycle with before/after metric tracking.

---

## 14. Medical Disclaimer

> **DISCLAIMER**: Stress and relaxation indices are estimated from physiological signal features (Heart Rate, Heart Rate Variability, and RR interval patterns) and are **not intended for medical diagnosis, treatment, or clinical patient monitoring**.
