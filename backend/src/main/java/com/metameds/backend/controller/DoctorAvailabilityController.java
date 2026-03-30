package com.metameds.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metameds.backend.model.DoctorAvailability;
import com.metameds.backend.repository.DoctorAvailabilityRepository;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityRepository repository;

    public DoctorAvailabilityController(DoctorAvailabilityRepository repository) {
        this.repository = repository;
    }

    // ✅ CREATE
    @PostMapping
    public DoctorAvailability addAvailability(@RequestBody DoctorAvailability availability) {
        return repository.save(availability);
    }

    // ✅ READ
    @GetMapping("/{doctorId}")
    public List<DoctorAvailability> getAvailability(@PathVariable Long doctorId) {
        return repository.findAll()
                .stream()
                .filter(a -> a.getDoctorId().equals(doctorId))
                .toList();
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public void deleteAvailability(@PathVariable Long id) {
        repository.deleteById(id);
    }

    // 🔥 ADD THIS HERE (TOGGLE)
    @PutMapping("/{id}/toggle")
    public DoctorAvailability toggleAvailability(@PathVariable Long id) {
        DoctorAvailability availability = repository.findById(id).orElseThrow();

        availability.setIsActive(!availability.getIsActive());

        return repository.save(availability);
    }
}