package com.metameds.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String link) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Verify your TeleMedSX account");

        message.setText(
                "Welcome to TeleMedSX!\n\n" +
                "Click the link below to verify your account:\n\n" +
                link +
                "\n\nIf you did not create this account, ignore this email."
        );

        mailSender.send(message);
    }
}