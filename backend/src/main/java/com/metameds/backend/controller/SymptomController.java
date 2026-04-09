package com.metameds.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metameds.backend.dto.SymptomRequest;
import com.metameds.backend.dto.SymptomResponse;
import com.metameds.backend.service.GeminiService;

@RestController
@RequestMapping("/api/symptoms")
@CrossOrigin(origins = "*")
public class SymptomController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/analyze")
    public SymptomResponse analyze(@RequestBody SymptomRequest request) {
        System.out.println("🔥 CONTROLLER HIT");
        return geminiService.analyzeSymptoms(request);
    }
}