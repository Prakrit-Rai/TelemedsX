package com.metameds.backend.service;

import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.metameds.backend.model.DoctorProfile;
import com.metameds.backend.model.User;
import com.metameds.backend.model.VerificationToken;
import com.metameds.backend.repository.DoctorProfileRepository;
import com.metameds.backend.repository.UserRepository;
import com.metameds.backend.repository.VerificationTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final VerificationTokenRepository verificationTokenRepository;

    // =========================
    // REGISTER USER
    // =========================

    public User register(User user) {

        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser != null) {
            throw new RuntimeException("Email already registered");
        }

        // 🔐 HASH PASSWORD
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // ✅ SET APPROVAL BEFORE SAVE
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {
            user.setApproved(true);
        } else if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            user.setApproved(false);
        }

        // ✅ SAVE USER
        User savedUser = userRepository.save(user);

        // 👨‍⚕️ CREATE DOCTOR PROFILE
        if ("DOCTOR".equalsIgnoreCase(savedUser.getRole())) {
            DoctorProfile profile = new DoctorProfile();
            profile.setUser(savedUser);
            profile.setLicenseNumber(user.getLicenseNumber());
            profile.setSpecialization(user.getSpecialization());
            doctorProfileRepository.save(profile);
        }

        // 🔐 EMAIL VERIFICATION
        String token = UUID.randomUUID().toString();

        VerificationToken vt = VerificationToken.builder()
                .token(token)
                .user(savedUser)
                .build();

        verificationTokenRepository.save(vt);

        String verifyLink = "http://localhost:8081/api/auth/verify?token=" + token;

        emailService.sendVerificationEmail(savedUser.getEmail(), verifyLink);

        return savedUser;
    }

    // =========================
    // LOGIN USER
    // =========================
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("Invalid email or password");
        }

        // --- NEW VERIFICATION CHECK START ---
        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email before logging in.");
        }
        // --- NEW VERIFICATION CHECK END ---

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email before logging in.");
        }
        // Email verified already checked


        if ("DOCTOR".equalsIgnoreCase(user.getRole()) && !user.isApproved()) {
            throw new RuntimeException("Waiting for admin approval.");
        }
        return user;
    }
    public VerificationToken getToken(String token) {
    return verificationTokenRepository.findByToken(token);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}