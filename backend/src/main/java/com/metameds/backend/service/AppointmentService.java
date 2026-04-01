package com.metameds.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.metameds.backend.dto.ActivityDto;
import com.metameds.backend.dto.AppointmentResponseDto;
import com.metameds.backend.model.Appointment;
import com.metameds.backend.model.DoctorAvailability;
import com.metameds.backend.model.User;
import com.metameds.backend.repository.AppointmentRepository;
import com.metameds.backend.repository.DoctorAvailabilityRepository;
import com.metameds.backend.repository.UserRepository;

@Service
public class AppointmentService {

    // ✅ All fields grouped at the top
    private final AppointmentRepository appointmentRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final UserRepository userRepository;
    
    private String mapStatus(String status) {
    switch (status) {
        case "BOOKED":
            return "waiting";
        case "COMPLETED":
            return "completed";
        default:
            return "in-progress";
    }
}
    // ✅ Single, consolidated constructor for Dependency Injection
    public AppointmentService(
        AppointmentRepository appointmentRepository,
        DoctorAvailabilityRepository doctorAvailabilityRepository,
        UserRepository userRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
        this.userRepository = userRepository;
    }

    // ------------------ CREATE APPOINTMENT ------------------
    public Appointment createAppointment(Appointment appointment) {
        boolean exists = appointmentRepository.existsByDoctorIdAndAppointmentTime(
                appointment.getDoctorId(),
                appointment.getAppointmentTime()
        );

        if (exists) {
            throw new RuntimeException("This time slot is already booked");
        }

        appointment.setStatus("BOOKED");
        return appointmentRepository.save(appointment);
    }

    // ------------------ CANCEL APPOINTMENT ------------------
    public void cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);
    }

    public void completeAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setStatus("COMPLETED");
        appointmentRepository.save(appt);
    }

    // ------------------ FETCH ------------------
    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }
    public void startAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setStatus("IN_PROGRESS"); // ✅ IMPORTANT
        appointmentRepository.save(appt);
    }

    public List<AppointmentResponseDto> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
            .stream()
            .map(a -> {
                // --- YOUR NEW FINAL FIX LOGIC ---
                String patientName = userRepository.findById(a.getPatientId())
                    .map(u -> (u.getFullName() != null && !u.getFullName().isEmpty())
                        ? u.getFullName()
                        : "Patient #" + u.getId()
                    )
                    .orElse("Patient #" + a.getPatientId());

                // --- STATUS MAPPING ---
                String statusMapped;
                switch (a.getStatus()) {
                    case "BOOKED": statusMapped = "waiting"; break;
                    case "COMPLETED": statusMapped = "completed"; break;
                    case "IN_PROGRESS": statusMapped = "in-progress"; break;
                    default: statusMapped = "waiting";
                }

                // --- MATCH 10-PARAM CONSTRUCTOR ---
                return new AppointmentResponseDto(
                    a.getId(),            // 1
                    a.getDoctorId(),      // 2
                    a.getPatientId(),     // 3
                    patientName,          // 4 (Using your final fix)
                    a.getNotes() != null ? a.getNotes() : "General consultation", // 5
                    a.getAppointmentTime().toString(), // 6
                    "Voice Call",         // 7
                    statusMapped,         // 8
                    "medium",             // 9
                    "0 min"               // 10
                );
            })
            .toList();
    }

    public List<ActivityDto> getRecentActivity(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
            .stream()
            .sorted((a, b) -> b.getAppointmentTime().compareTo(a.getAppointmentTime()))
            .limit(5)
            .map(a -> {

                String patientName = userRepository.findById(a.getPatientId())
                        .map(User::getFullName)
                        .orElse("Unknown");

                String action;
                String type;

                switch (a.getStatus()) {
                    case "COMPLETED":
                        action = "Consultation completed";
                        type = "completed";
                        break;
                    case "CANCELLED":
                        action = "Appointment cancelled";
                        type = "cancelled";
                        break;
                    default:
                        action = "Appointment scheduled";
                        type = "scheduled";
                }

                return new ActivityDto(
                    a.getId(),
                    patientName,
                    action,
                    a.getAppointmentTime(),
                    type
                );
            })
            .toList();
    }

    // ------------------ SLOT GENERATION ------------------
    public List<LocalDateTime> getAvailableSlots(Long doctorId, LocalDate date) {

        // 1. Get BOTH types (Specific Date & Weekly Pattern)
        List<DoctorAvailability> dateSpecific =
                doctorAvailabilityRepository.findByDoctorIdAndDate(doctorId, date);

        List<DoctorAvailability> weekly =
                doctorAvailabilityRepository.findByDoctorIdAndDayOfWeek(
                        doctorId,
                        date.getDayOfWeek()
                );

        List<DoctorAvailability> availabilityList = new ArrayList<>();
        availabilityList.addAll(dateSpecific);
        availabilityList.addAll(weekly);

        // 2. Get booked appointments for that day
        List<Appointment> bookedAppointments =
                appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                        doctorId,
                        date.atStartOfDay(),
                        date.atTime(23, 59)
                );

        // Ignore CANCELLED appointments when calculating free slots
        Set<LocalDateTime> bookedTimes = new HashSet<>();
        for (Appointment a : bookedAppointments) {
            if (!"CANCELLED".equals(a.getStatus())) {
                bookedTimes.add(a.getAppointmentTime());
            }
        }

        // 3. Generate slots with past-time guard
        Set<LocalDateTime> availableSlots = new HashSet<>();
        LocalDateTime now = LocalDateTime.now();

        for (DoctorAvailability availability : availabilityList) {
            if (availability.getIsActive() != null && !availability.getIsActive()) continue;

            LocalTime start = availability.getStartTime();
            LocalTime end = availability.getEndTime();

            int duration = availability.getSlotDuration() != null
                    ? availability.getSlotDuration()
                    : 30;

            LocalTime current = start;

            while (!current.plusMinutes(duration).isAfter(end)) {
                LocalDateTime slot = LocalDateTime.of(date, current);

                // Only show future slots that aren't already booked
                if (!bookedTimes.contains(slot) && slot.isAfter(now)) {
                    availableSlots.add(slot);
                }
                current = current.plusMinutes(duration);
            }
        }

        // 4. Sort and return
        return availableSlots.stream()
                .sorted()
                .toList();
    }
}