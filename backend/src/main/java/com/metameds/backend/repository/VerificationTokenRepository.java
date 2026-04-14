package com.metameds.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metameds.backend.model.VerificationToken;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    VerificationToken findByToken(String token);
    void deleteByUserId(Long userId);
}