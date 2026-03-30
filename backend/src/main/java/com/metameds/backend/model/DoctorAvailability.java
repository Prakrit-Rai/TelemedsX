package com.metameds.backend.model;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "doctor_availability")
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long doctorId;
    private LocalDate date; 

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek; 

    private LocalTime startTime;
    private LocalTime endTime;
    
    // ✅ FIX 1: Add this field
    private Integer slotDuration = 30; // Defaulting to 30 for safety

    private Boolean isActive = true;

    public DoctorAvailability() {}

    // ✅ FIX 2: Add Getter + Setter
    public Integer getSlotDuration() { return slotDuration; }
    public void setSlotDuration(Integer slotDuration) { this.slotDuration = slotDuration; }

    // --- Getters ---
    public Long getId() { return id; }
    public Long getDoctorId() { return doctorId; }
    public LocalDate getDate() { return date; }
    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public Boolean getIsActive() { return isActive; }

    // --- Setters ---
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    // ✅ FIX 3: Add validation
    @PrePersist
    @PreUpdate
    private void validate() {
        if (date == null && dayOfWeek == null) {
            throw new RuntimeException("Either date or dayOfWeek must be set");
        }

        if (date != null && dayOfWeek != null) {
            throw new RuntimeException("Only one of date or dayOfWeek should be set");
        }

        if (startTime != null && endTime != null && !startTime.isBefore(endTime)) {
            throw new RuntimeException("Start time must be before end time");
        }
    }
}