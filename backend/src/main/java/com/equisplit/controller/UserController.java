package com.equisplit.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserController {

    @GetMapping("/api/v1/users/me")
    public Map<String, Object> me(Authentication authentication) {

        return Map.of("email", authentication.getName());
    }
}