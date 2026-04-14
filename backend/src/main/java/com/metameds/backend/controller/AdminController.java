package com.metameds.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metameds.backend.model.User;
import com.metameds.backend.repository.DoctorProfileRepository;
import com.metameds.backend.repository.UserRepository;
import com.metameds.backend.repository.VerificationTokenRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminController {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    // ✅ Get all users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Pending doctors
    @GetMapping("/pending-doctors")
    public List<User> getPendingDoctors() {
        return userRepository.findByRoleAndIsApproved("DOCTOR", false);
    }

    // ✅ Approve doctor
    @PutMapping("/approve/{id}")
    public String approveDoctor(@PathVariable Long id) {

        User user = userRepository.findById(id).orElseThrow();

        user.setApproved(true);
        userRepository.save(user);

        return "Doctor approved successfully";
    }

    // ✅ Delete user
    @DeleteMapping("/delete/{id}")
    @Transactional 
    public String deleteUser(@PathVariable Long id) {
        try {

            System.out.println("Deleting user ID: " + id);

            verificationTokenRepository.deleteByUserId(id);
            doctorProfileRepository.deleteByUserId(id);

            userRepository.deleteById(id);

            return "User deleted successfully";

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 THIS WILL SHOW REAL ERROR
            return "Error: " + e.getMessage();
        }
    }

    // ✅ Dashboard stats
    @GetMapping("/stats")
    public Map<String, Long> getStats() {

        Map<String, Long> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("patients", userRepository.countByRole("PATIENT"));
        stats.put("doctors", userRepository.countByRole("DOCTOR"));

        return stats;
    }
}