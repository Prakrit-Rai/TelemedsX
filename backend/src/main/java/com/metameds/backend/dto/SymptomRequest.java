package com.metameds.backend.dto;

import java.util.List;

public class SymptomRequest {

    private String symptoms;
    private String duration;
    private String severity;
    private List<String> additionalSymptoms;

    public SymptomRequest() {}

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public List<String> getAdditionalSymptoms() {
        return additionalSymptoms;
    }

    public void setAdditionalSymptoms(List<String> additionalSymptoms) {
        this.additionalSymptoms = additionalSymptoms;
    }
}