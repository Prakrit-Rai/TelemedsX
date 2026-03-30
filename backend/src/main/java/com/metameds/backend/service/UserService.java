package com.metameds.backend.service;

import org.springframework.stereotype.Service;

import com.metameds.backend.model.DoctorProfile;
import com.metameds.backend.model.User;
import com.metameds.backend.repository.DoctorProfileRepository;
import com.metameds.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    // =========================
    // REGISTER USER
    // =========================
    public User register(User user) {

        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser != null) {
            throw new RuntimeException("Email already registered");
        }

        // Save user
        User savedUser = userRepository.save(user);

        // If DOCTOR → create doctor profile
        if ("DOCTOR".equalsIgnoreCase(savedUser.getRole())) {

            DoctorProfile profile = new DoctorProfile();

            profile.setUser(savedUser);

            // ✅ GET FROM USER OBJECT (THIS IS THE FIX)
            profile.setLicenseNumber(user.getLicenseNumber());
            profile.setSpecialization(user.getSpecialization());

            doctorProfileRepository.save(profile);
        }

        return savedUser;
    }

    // =========================
    // LOGIN USER
    // =========================
    public User login(String email, String password) {

        System.out.println("LOGIN REQUEST EMAIL: [" + email + "]");
        System.out.println("LOGIN REQUEST PASSWORD: [" + password + "]");

        User user = userRepository.findByEmail(email);

        if (user == null) {
            System.out.println("USER NOT FOUND IN DATABASE");
            throw new RuntimeException("Invalid email or password");
        }

        System.out.println("DATABASE PASSWORD: [" + user.getPassword() + "]");

        if (!password.equals(user.getPassword())) {
            System.out.println("PASSWORD DOES NOT MATCH");
            throw new RuntimeException("Invalid email or password");
        }

        System.out.println("LOGIN SUCCESSFUL");

        return user;
    }
}