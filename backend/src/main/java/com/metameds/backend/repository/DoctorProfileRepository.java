package com.metameds.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metameds.backend.model.DoctorProfile;
import com.metameds.backend.model.User;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {

    Optional<DoctorProfile> findByUser(User user);
    void deleteByUserId(Long userId);
}