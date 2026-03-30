package com.metameds.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping; 
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metameds.backend.model.User;
import com.metameds.backend.security.JwtUtil;
import com.metameds.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> body) {

        // Build User object
        User user = User.builder()
                .fullName(body.get("name"))
                .email(body.get("email"))
                .password(body.get("password"))
                .phone(body.get("phone"))
                .role(body.get("role"))
                .build();

        // Doctor fields (optional)
        // Set doctor fields inside User
        user.setLicenseNumber(body.get("licenseNumber"));
        user.setSpecialization(body.get("specialization"));

        // Call updated service
        return userService.register(user);
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User loginRequest) {

        User user = userService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);

        return response;
    }
}