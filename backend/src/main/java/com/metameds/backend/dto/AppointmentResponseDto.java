package com.metameds.backend.dto;

import java.time.LocalDateTime;

public class AppointmentResponseDto {

    private Long id;
    private Long doctorId;
    private Long patientId;
    private String patientName;
    private LocalDateTime appointmentTime;
    private String status;

    public AppointmentResponseDto(
            Long id,
            Long doctorId,
            Long patientId,
            String patientName,
            LocalDateTime appointmentTime,
            String status
    ) {
        this.id = id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.appointmentTime = appointmentTime;
        this.status = status;
    }

    // getters only (no setters needed)
    public Long getId() { return id; }
    public Long getDoctorId() { return doctorId; }
    public Long getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
    public LocalDateTime getAppointmentTime() { return appointmentTime; }
    public String getStatus() { return status; }
}