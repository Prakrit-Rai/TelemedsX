package com.metameds.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.metameds.backend.model.ChatMessage;
import com.metameds.backend.service.ChatService;

@Controller
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService,
                          SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    // ✅ RECEIVE MESSAGE FROM FRONTEND
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage message) {

        System.out.println("📩 Incoming message: " + message.getContent());

        // 🚨 SAFETY CHECKS (IMPORTANT)
        if (message.getAppointmentId() == null) {
            System.out.println("❌ Appointment ID is NULL");
            return;
        }

        if (message.getSenderId() == null) {
            System.out.println("❌ Sender ID is NULL");
            return;
        }

        // ✅ Normalize role (avoid mismatch bugs)
        if (message.getSenderRole() != null) {
            message.setSenderRole(message.getSenderRole().toUpperCase());
        }

        // ✅ Always set timestamp (backend authoritative)
        message.setTimestamp(java.time.LocalDateTime.now());

        // ✅ SAVE TO DATABASE
        ChatMessage saved = chatService.saveMessage(message);

        System.out.println("✅ Saved message ID: " + saved.getId());

        // ✅ SEND TO SUBSCRIBERS
        messagingTemplate.convertAndSend(
            "/topic/chat/" + saved.getAppointmentId(), // use saved
            saved
        );
    }
}