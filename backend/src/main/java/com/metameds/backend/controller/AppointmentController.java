package com.metameds.backend.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.metameds.backend.dto.ActivityDto;
import com.metameds.backend.dto.AppointmentResponseDto;
import com.metameds.backend.model.Appointment;
import com.metameds.backend.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return appointmentService.createAppointment(appointment);
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> getPatientAppointments(@PathVariable Long patientId) {
        return appointmentService.getPatientAppointments(patientId);
    }

@GetMapping("/doctor/{doctorId}")
public List<AppointmentResponseDto> getDoctorAppointments(@PathVariable Long doctorId) {
    return appointmentService.getDoctorAppointments(doctorId);
}

    @GetMapping("/slots")
    public List<LocalDateTime> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam String date
    ) {
        return appointmentService.getAvailableSlots(
                doctorId,
                LocalDate.parse(date)
        );
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok("Appointment cancelled");
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long id) {
        appointmentService.completeAppointment(id);
        return ResponseEntity.ok("Appointment marked as completed");
    }

    @GetMapping("/doctor/{doctorId}/activity")
    public List<ActivityDto> getRecentActivity(@PathVariable Long doctorId) {
        return appointmentService.getRecentActivity(doctorId);
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<?> startAppointment(@PathVariable Long id) {
        appointmentService.startAppointment(id);
        return ResponseEntity.ok("Appointment started");
    }
}