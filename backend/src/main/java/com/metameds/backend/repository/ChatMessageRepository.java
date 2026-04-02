package com.metameds.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metameds.backend.model.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByAppointmentIdOrderByTimestampAsc(Long appointmentId);
}