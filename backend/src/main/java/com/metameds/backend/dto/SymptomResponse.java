package com.metameds.backend.dto;

import java.util.List;

public class SymptomResponse {

    private String severity;
    private List<Condition> conditions;
    private List<String> recommendations;
    private boolean doctorNeeded;

    public SymptomResponse() {}

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public List<Condition> getConditions() {
        return conditions;
    }

    public void setConditions(List<Condition> conditions) {
        this.conditions = conditions;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public boolean isDoctorNeeded() {
        return doctorNeeded;
    }

    public void setDoctorNeeded(boolean doctorNeeded) {
        this.doctorNeeded = doctorNeeded;
    }

    // Inner class
    public static class Condition {
        private String name;
        private int probability;
        private String reason;

        public Condition() {}

        public Condition(String name, int probability) {
            this.name = name;
            this.probability = probability;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getProbability() {
            return probability;
        }

        public void setProbability(int probability) {
            this.probability = probability;
        }
        public String getReason() { 
            return reason; 
        }
        public void setReason(String reason) { 
            this.reason = reason; 
        }
    }
}