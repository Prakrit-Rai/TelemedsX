package com.metameds.backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metameds.backend.model.DoctorProfile;
import com.metameds.backend.model.User;
import com.metameds.backend.repository.DoctorProfileRepository;
import com.metameds.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorController {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    @GetMapping
    public List<Map<String, Object>> getDoctors() {

        List<User> doctors = userRepository.findByRole("DOCTOR");
        List<Map<String, Object>> result = new ArrayList<>();

        for (User user : doctors) {

            Map<String, Object> doc = new HashMap<>();

            // Basic Info
            doc.put("id", user.getId());

            doc.put("name",
                user.getFullName() != null && !user.getFullName().isEmpty()
                    ? user.getFullName()
                    : "Unknown Doctor"
            );

            doc.put("email", user.getEmail());

            // Profile
            Optional<DoctorProfile> profileOpt =
                doctorProfileRepository.findByUser(user);

            if (profileOpt.isPresent()) {
                DoctorProfile profile = profileOpt.get();

                doc.put("specialization",
                    profile.getSpecialization() != null && !profile.getSpecialization().isEmpty()
                        ? profile.getSpecialization()
                        : "General"
                );

                doc.put("licenseNumber",
                    profile.getLicenseNumber() != null
                        ? profile.getLicenseNumber()
                        : "N/A"
                );

            } else {
                // fallback 
                doc.put("specialization", "General");
                doc.put("licenseNumber", "N/A");
            }

            result.add(doc);
        }

        return result;
    }
}