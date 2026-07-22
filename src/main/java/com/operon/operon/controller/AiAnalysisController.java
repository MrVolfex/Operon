package com.operon.operon.controller;

import com.operon.operon.service.AiAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    public AiAnalysisController(AiAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }

    // Worker (OWNER ili MECHANIC) analizira bilo koje vozilo
    @GetMapping("/api/ai/vehicles/{id}/analysis")
    public ResponseEntity<Map<String, String>> analyzeForWorker(@PathVariable Long id) {
        String analysis = aiAnalysisService.analyzeVehicleHistory(id);
        return ResponseEntity.ok(Map.of("analysis", analysis));
    }

    // Klijent analizira samo svoje vozilo
    @GetMapping("/api/vehicles/{id}/ai-analysis")
    public ResponseEntity<Map<String, String>> analyzeForClient(
            @PathVariable Long id,
            Authentication authentication) {
        String analysis = aiAnalysisService.analyzeVehicleHistoryForClient(id, authentication.getName());
        return ResponseEntity.ok(Map.of("analysis", analysis));
    }
}
