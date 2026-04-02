package com.metameds.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.metameds.backend.model.ChatMessage;
import com.metameds.backend.repository.ChatMessageRepository;

@Service
public class ChatService {

    private final ChatMessageRepository chatRepo;

    public ChatService(ChatMessageRepository chatRepo) {
        this.chatRepo = chatRepo;
    }

    // ✅ SAVE MESSAGE
    public ChatMessage saveMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return chatRepo.save(message);
    }

    // ✅ GET CHAT HISTORY
    public List<ChatMessage> getMessages(Long appointmentId) {
        return chatRepo.findByAppointmentIdOrderByTimestampAsc(appointmentId);
    }
}