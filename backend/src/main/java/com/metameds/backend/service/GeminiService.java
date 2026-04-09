package com.metameds.backend.service;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.Scanner;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.metameds.backend.dto.SymptomRequest;
import com.metameds.backend.dto.SymptomResponse;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper mapper = new ObjectMapper();

    public SymptomResponse analyzeSymptoms(SymptomRequest request) {
        System.out.println("🔥 GEMINI SERVICE HIT");

        try {
            String prompt = buildPrompt(request);
            String response = null;

            // =========================
            // 🔥 PRIMARY MODEL
            // =========================
            try {
                response = callGemini(prompt, "gemini-2.5-flash");
            } catch (Exception e) {

                System.out.println("⚠️ Primary failed. Trying fallback...");

                // Small delay to avoid rate-limit burst
                Thread.sleep(3000);

                try {
                    // =========================
                    // 🔥 FALLBACK MODEL
                    // =========================
                    response = callGemini(prompt, "gemini-3.1-flash-lite-preview");
                } catch (Exception fallbackError) {

                    System.out.println("❌ Fallback also failed. Using local logic.");
                    return fallbackResponse(request);
                }
            }

            // =========================
            // 🔥 PARSE RESPONSE
            // =========================
            JsonNode root = mapper.readTree(response);

            JsonNode textNode = root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");

            if (textNode == null || textNode.isMissingNode()) {
                return fallbackResponse(request);
            }

            String aiText = textNode.asText()
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            System.out.println("🧠 AI TEXT:\n" + aiText);

            SymptomResponse result = mapper.readValue(aiText, SymptomResponse.class);
            // Convert probability (0-1) → percentage (0-100)
            if (result.getConditions() != null) {
                for (SymptomResponse.Condition c : result.getConditions()) {
                    if (c.getProbability() <= 1) {
                        c.setProbability((int) (c.getProbability() * 100));
                    }
                }
            }

            applySafetyRules(result, request);

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return fallbackResponse(request);
        }
    }

    // =========================
    // 🔥 GEMINI CALL METHOD
    // =========================
    private String callGemini(String prompt, String model) throws Exception {

        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent?key=" + apiKey;

        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        String requestBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \""
                + prompt.replace("\"", "\\\"") + "\" }] }] }";

        OutputStream os = conn.getOutputStream();
        os.write(requestBody.getBytes());
        os.flush();
        os.close();

        int statusCode = conn.getResponseCode();

        InputStream stream = (statusCode >= 400)
                ? conn.getErrorStream()
                : conn.getInputStream();

        Scanner scanner = new Scanner(stream);
        String response = scanner.useDelimiter("\\A").next();
        scanner.close();

        System.out.println("📡 MODEL: " + model);
        System.out.println("📡 STATUS: " + statusCode);
        System.out.println("📡 RESPONSE: " + response);

        if (statusCode != 200) {
            throw new RuntimeException("Gemini API failed");
        }

        return response;
    }

    // =========================
    // 🔥 PROMPT
    // =========================
    private String buildPrompt(SymptomRequest req) {
        return "You are a cautious medical assistant.\n" +
                "Analyze symptoms safely.\n\n" +
                "Symptoms: " + req.getSymptoms() + "\n" +
                "Duration: " + req.getDuration() + "\n" +
                "Severity: " + req.getSeverity() + "\n" +
                "Additional: " + req.getAdditionalSymptoms() + "\n\n" +
                "Rules:\n" +
                "- Do NOT suggest medications\n" +
                "- Do NOT give diagnosis\n" +
                "- Be cautious\n" +
                "- Explain briefly why each condition matches\n\n" +

                "Return ONLY JSON:\n" +
                "{\n" +
                "  \"severity\": \"mild/moderate/severe\",\n" +
                "  \"conditions\": [\n" +
                "    {\n" +
                "      \"name\": \"\",\n" +
                "      \"probability\": 0-100,\n" +
                "      \"reason\": \"Short explanation why this matches\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"recommendations\": [\"\"],\n" +
                "  \"doctorNeeded\": true\n" +
                "}";
    }

    // =========================
    // 🔥 SAFETY RULES
    // =========================
    private void applySafetyRules(SymptomResponse res, SymptomRequest req) {

        String input = (req.getSymptoms() + " " + req.getAdditionalSymptoms()).toLowerCase();

        if (input.contains("chest pain") || input.contains("breathing difficulty")) {
            res.setSeverity("severe");
            res.setDoctorNeeded(true);
        }

        if ("severe".equalsIgnoreCase(res.getSeverity())) {
            res.setDoctorNeeded(true);
        }
    }

    // =========================
    // 🔥 FALLBACK (SMART)
    // =========================
    private SymptomResponse fallbackResponse(SymptomRequest req) {

        String input = (req.getSymptoms() + " " + req.getAdditionalSymptoms()).toLowerCase();

        SymptomResponse res = new SymptomResponse();

        res.setSeverity("moderate");
        res.setDoctorNeeded(true);

        if (input.contains("fever") || input.contains("cough")) {
            res.setConditions(Arrays.asList(
                    new SymptomResponse.Condition("Viral infection", 70),
                    new SymptomResponse.Condition("Common cold", 55)
            ));
        } else if (input.contains("headache")) {
            res.setConditions(Arrays.asList(
                    new SymptomResponse.Condition("Tension headache", 65),
                    new SymptomResponse.Condition("Migraine", 40)
            ));
        } else {
            SymptomResponse.Condition c = new SymptomResponse.Condition("Unidentifies Illness", 0);
            c.setReason("Symptoms are unclear or insufficient for detailed analysis");

            res.setConditions(Arrays.asList(c));
        }

        res.setRecommendations(Arrays.asList(
                "Stay hydrated",
                "Get adequate rest",
                "Monitor symptoms",
                "Consult a doctor if symptoms worsen"
        ));

        return res;
    }
}