package com.metameds.backend.dto;

public class AppointmentResponseDto {
    private Long id;
    private Long doctorId;
    private Long patientId;
    private String name;
    private String symptoms;
    private String appointmentTime;
    private String type;
    private String status;
    private String priority;
    private String waitTime;

    public AppointmentResponseDto(
            Long id, 
            Long doctorId, 
            Long patientId, 
            String name, 
            String symptoms, 
            String appointmentTime, 
            String type, 
            String status, 
            String priority, 
            String waitTime
    ) {
        this.id = id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.name = name;
        this.symptoms = symptoms;
        this.appointmentTime = appointmentTime;
        this.type = type;
        this.status = status;
        this.priority = priority;
        this.waitTime = waitTime;
    }

    // ✅ NEW: Backward compatibility
    public String getFullName() {
        return name;
    }

    // Getters
    public Long getId() { return id; }
    public Long getDoctorId() { return doctorId; }
    public Long getPatientId() { return patientId; }
    public String getName() { return name; }
    public String getSymptoms() { return symptoms; }
    public String getAppointmentTime() { return appointmentTime; }
    public String getType() { return type; }
    public String getStatus() { return status; }
    public String getPriority() { return priority; }
    public String getWaitTime() { return waitTime; }
}