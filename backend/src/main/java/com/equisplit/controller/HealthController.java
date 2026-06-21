package com.equisplit.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

   @GetMapping("/api/health")
    public Map<String, String> health() {
        System.out.println("Health endpoint hit at " + java.time.LocalDateTime.now());
        return Map.of("status", "UP");
    }
}