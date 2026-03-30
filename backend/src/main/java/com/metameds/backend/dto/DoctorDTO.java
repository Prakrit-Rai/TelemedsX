package com.metameds.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DoctorDTO {
    private Long id;
    private String name;
    private String email;
    private String specialization;
    private String licenseNumber;
}