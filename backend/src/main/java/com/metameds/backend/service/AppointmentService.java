package com.metameds.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.metameds.backend.model.Appointment;
import com.metameds.backend.model.DoctorAvailability;
import com.metameds.backend.repository.AppointmentRepository;
import com.metameds.backend.repository.DoctorAvailabilityRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;

    public AppointmentService(
        AppointmentRepository appointmentRepository,
        DoctorAvailabilityRepository doctorAvailabilityRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
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

    // ------------------ FETCH ------------------
    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // ------------------ SLOT GENERATION (UPDATED) ------------------
    public List<LocalDateTime> getAvailableSlots(Long doctorId, LocalDate date) {

        // ✅ 1. Get BOTH types (Specific Date & Weekly Pattern)
        List<DoctorAvailability> dateSpecific =
                doctorAvailabilityRepository.findByDoctorIdAndDate(doctorId, date);

        List<DoctorAvailability> weekly =
                doctorAvailabilityRepository.findByDoctorIdAndDayOfWeek(
                        doctorId,
                        date.getDayOfWeek()
                );

        // Combine both into one list
        List<DoctorAvailability> availabilityList = new ArrayList<>();
        availabilityList.addAll(dateSpecific);
        availabilityList.addAll(weekly);

        // ✅ 2. Get booked appointments for that day
        List<Appointment> bookedAppointments =
                appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                        doctorId,
                        date.atStartOfDay(),
                        date.atTime(23, 59)
                );

        // ✅ FIX: Ignore CANCELLED appointments
        Set<LocalDateTime> bookedTimes = new HashSet<>();
        for (Appointment a : bookedAppointments) {
            if (!"CANCELLED".equals(a.getStatus())) {
                bookedTimes.add(a.getAppointmentTime());
            }
        }

        // ✅ 3. Generate slots with past-time guard
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

                // ✅ Only future + not booked
                if (!bookedTimes.contains(slot) && slot.isAfter(now)) {
                    availableSlots.add(slot);
                }

                current = current.plusMinutes(duration);
            }
        }

        // ✅ 4. Sort and return
        return availableSlots.stream()
                .sorted()
                .toList();
    }
}