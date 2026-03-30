package com.metameds.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "doctor_profiles")
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String licenseNumber;

    private String specialization;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    public DoctorProfile(){}

    public Long getId() { return id; }
    public String getLicenseNumber() { return licenseNumber; }
    public String getSpecialization() { return specialization; }
    public User getUser() { return user; }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public void setUser(User user) {
        this.user = user;
    }
}