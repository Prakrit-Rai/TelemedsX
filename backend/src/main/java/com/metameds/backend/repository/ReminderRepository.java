package com.metameds.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metameds.backend.model.Reminder;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserId(Long userId);
    List<Reminder> findByIsActiveTrue();
}