package com.metameds.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metameds.backend.model.ChatMessage;
import com.metameds.backend.service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    private final ChatService chatService;

    public ChatRestController(ChatService chatService) {
        this.chatService = chatService;
    }

    // ✅ LOAD CHAT HISTORY
    @GetMapping("/{appointmentId}")
    public List<ChatMessage> getMessages(@PathVariable Long appointmentId) {
        return chatService.getMessages(appointmentId);
    }
}