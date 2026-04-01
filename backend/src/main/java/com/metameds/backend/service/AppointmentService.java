package com.metameds.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
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

    private final AppointmentRepository appointmentRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final UserRepository userRepository;

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
        System.out.println("🔍 Creating appointment: " + appointment);

        boolean exists = appointmentRepository.existsByDoctorIdAndAppointmentTime(
                appointment.getDoctorId(),
                appointment.getAppointmentTime()
        );

        System.out.println("🔍 Slot exists? " + exists);

        if (exists) {
            throw new RuntimeException("This time slot is already booked");
        }

        appointment.setStatus("BOOKED");
        Appointment saved = appointmentRepository.save(appointment);

        System.out.println("✅ Appointment saved: " + saved.getId());
        return saved;
    }

    // ------------------ CANCEL ------------------
    public void cancelAppointment(Long appointmentId) {
        System.out.println("🔍 Cancelling appointment ID: " + appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);

        System.out.println("✅ Appointment cancelled");
    }

    public void completeAppointment(Long id) {
        System.out.println("🔍 Completing appointment ID: " + id);

        Appointment appt = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setStatus("COMPLETED");
        appointmentRepository.save(appt);

        System.out.println("✅ Appointment completed");
    }

    public void startAppointment(Long id) {
        System.out.println("🔍 Starting appointment ID: " + id);

        Appointment appt = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setStatus("IN_PROGRESS");
        appointmentRepository.save(appt);

        System.out.println("✅ Appointment started");
    }

    // ------------------ PATIENT ------------------
    public List<Appointment> getPatientAppointments(Long patientId) {
        System.out.println("🔍 Fetching patient appointments for ID: " + patientId);

        List<Appointment> list = appointmentRepository.findByPatientId(patientId);

        System.out.println("📦 Found appointments: " + list.size());
        return list;
    }

    // ------------------ DOCTOR QUEUE ------------------
    public List<AppointmentResponseDto> getDoctorAppointments(Long doctorId) {

        System.out.println("🔍 Fetching doctor appointments for ID: " + doctorId);

        LocalDate today = LocalDate.now();

        List<Appointment> appointments =
            appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                doctorId,
                today.atStartOfDay(),
                today.atTime(23, 59)
            );

        System.out.println("📦 Appointments found: " + appointments.size());

        return appointments.stream()
            .map(a -> {

                System.out.println("➡️ Processing appointment ID: " + a.getId());
                System.out.println("   Patient ID: " + a.getPatientId());

                Optional<User> userOpt = userRepository.findById(a.getPatientId());

                if (userOpt.isPresent()) {
                    System.out.println("   ✅ User found: " + userOpt.get().getFullName());
                } else {
                    System.out.println("   ❌ User NOT FOUND for ID: " + a.getPatientId());
                }

                String patientName = userOpt
                    .map(u -> (u.getFullName() != null && !u.getFullName().isEmpty())
                        ? u.getFullName()
                        : "Patient #" + u.getId()
                    )
                    .orElse("Patient #" + a.getPatientId());

                System.out.println("   👉 Final Name: " + patientName);

                String statusMapped;
                switch (a.getStatus()) {
                    case "BOOKED": statusMapped = "waiting"; break;
                    case "COMPLETED": statusMapped = "completed"; break;
                    case "IN_PROGRESS": statusMapped = "in-progress"; break;
                    default: statusMapped = "waiting";
                }

                return new AppointmentResponseDto(
                    a.getId(),
                    a.getDoctorId(),
                    a.getPatientId(),
                    patientName,
                    a.getNotes() != null ? a.getNotes() : "General consultation",
                    a.getAppointmentTime().toString(),
                    "Voice Call",
                    statusMapped,
                    "medium",
                    "0 min"
                );
            })
            .toList();
    }

    // ------------------ RECENT ACTIVITY ------------------
    public List<ActivityDto> getRecentActivity(Long doctorId) {

        System.out.println("🔍 Fetching recent activity for doctor: " + doctorId);

        return appointmentRepository.findByDoctorId(doctorId)
            .stream()
            .sorted((a, b) -> b.getAppointmentTime().compareTo(a.getAppointmentTime()))
            .limit(5)
            .map(a -> {

                System.out.println("➡️ Activity for appointment: " + a.getId());

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

        System.out.println("🔍 Fetching slots for doctor: " + doctorId + " on " + date);

        List<DoctorAvailability> dateSpecific =
                doctorAvailabilityRepository.findByDoctorIdAndDate(doctorId, date);

        List<DoctorAvailability> weekly =
                doctorAvailabilityRepository.findByDoctorIdAndDayOfWeek(
                        doctorId,
                        date.getDayOfWeek()
                );

        System.out.println("📅 Date-specific availability: " + dateSpecific.size());
        System.out.println("📅 Weekly availability: " + weekly.size());

        List<DoctorAvailability> availabilityList = new ArrayList<>();
        availabilityList.addAll(dateSpecific);
        availabilityList.addAll(weekly);

        List<Appointment> bookedAppointments =
                appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                        doctorId,
                        date.atStartOfDay(),
                        date.atTime(23, 59)
                );

        System.out.println("📦 Booked appointments: " + bookedAppointments.size());

        Set<LocalDateTime> bookedTimes = new HashSet<>();
        for (Appointment a : bookedAppointments) {
            if (!"CANCELLED".equals(a.getStatus())) {
                bookedTimes.add(a.getAppointmentTime());
            }
        }

        Set<LocalDateTime> availableSlots = new HashSet<>();
        LocalDateTime now = LocalDateTime.now();

        for (DoctorAvailability availability : availabilityList) {

            System.out.println("➡️ Checking availability block: " + availability.getId());

            if (availability.getIsActive() != null && !availability.getIsActive()) {
                System.out.println("   ❌ Skipped (inactive)");
                continue;
            }

            LocalTime start = availability.getStartTime();
            LocalTime end = availability.getEndTime();
            int duration = availability.getSlotDuration() != null
                    ? availability.getSlotDuration()
                    : 30;

            System.out.println("   🕒 Start: " + start + " End: " + end);

            LocalTime current = start;

            // 🚨 SAFETY VALIDATION (ADD THIS BEFORE LOOP)
            if (start == null || end == null) {
                System.out.println("🚨 Start or End time is NULL");
                return List.of();
            }

            if (!start.isBefore(end)) {
                System.out.println("🚨 Invalid time range: start >= end");
                return List.of();
            }

            if (duration <= 0) {
                System.out.println("🚨 Invalid slot duration: " + duration);
                return List.of();
            }

            // 🔍 DEBUG
            System.out.println("START: " + start);
            System.out.println("END: " + end);
            System.out.println("DURATION: " + duration);

            // ✅ SAFE LOOP
            while (true) {

                if (current.isAfter(end) || current.equals(end)) {
                    break;
                }

                LocalDateTime slot = LocalDateTime.of(date, current);

                if (!bookedTimes.contains(slot) && slot.isAfter(now)) {
                    System.out.println("✅ Available slot: " + slot);
                    availableSlots.add(slot);
                } else {
                    System.out.println("❌ Skipped slot: " + slot);
                }

                LocalTime next = current.plusMinutes(duration);

                // 🚨 EXTRA PROTECTION
                if (next.equals(current)) {
                    System.out.println("🚨 Duration not progressing!");
                    break;
                }

                current = next;
            }
        }

        System.out.println("🎯 Final available slots: " + availableSlots.size());

        return availableSlots.stream().sorted().toList();
    }
}