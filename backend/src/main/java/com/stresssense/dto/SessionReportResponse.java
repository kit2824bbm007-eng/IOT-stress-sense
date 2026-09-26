package com.stresssense.dto;

import java.util.ArrayList;
import java.util.List;

public class SessionReportResponse {

    private SessionResponse session;
    private List<SensorDataResponse> readings = new ArrayList<>();
    private List<String> keyObservations = new ArrayList<>();
    private String disclaimer = "This system is an educational wellness-monitoring prototype. Stress and relaxation values are estimated from physiological signal features and are not intended for medical diagnosis.";

    public SessionReportResponse() {
    }

    public SessionReportResponse(SessionResponse session, List<SensorDataResponse> readings, List<String> keyObservations) {
        this.session = session;
        this.readings = readings != null ? readings : new ArrayList<>();
        this.keyObservations = keyObservations != null ? keyObservations : new ArrayList<>();
    }

    public SessionResponse getSession() {
        return session;
    }

    public void setSession(SessionResponse session) {
        this.session = session;
    }

    public List<SensorDataResponse> getReadings() {
        return readings;
    }

    public void setReadings(List<SensorDataResponse> readings) {
        this.readings = readings != null ? readings : new ArrayList<>();
    }

    public List<String> getKeyObservations() {
        return keyObservations;
    }

    public void setKeyObservations(List<String> keyObservations) {
        this.keyObservations = keyObservations != null ? keyObservations : new ArrayList<>();
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
