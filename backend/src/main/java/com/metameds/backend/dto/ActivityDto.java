package com.metameds.backend.dto;

import java.time.LocalDateTime;

public class ActivityDto {

    private Long id;
    private String patientName;
    private String action;
    private LocalDateTime time;
    private String type;

    public ActivityDto(Long id, String patientName, String action,
                       LocalDateTime time, String type) {
        this.id = id;
        this.patientName = patientName;
        this.action = action;
        this.time = time;
        this.type = type;
    }

    public Long getId() { return id; }
    public String getPatientName() { return patientName; }
    public String getAction() { return action; }
    public LocalDateTime getTime() { return time; }
    public String getType() { return type; }
}