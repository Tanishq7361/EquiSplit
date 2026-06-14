package com.equisplit.controller;

import com.equisplit.dto.request.LoginRequest;
import com.equisplit.dto.request.RegisterRequest;
import com.equisplit.dto.response.LoginResponse;
import com.equisplit.dto.response.RegisterResponse;
import com.equisplit.entity.User;
import com.equisplit.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.register(request);

        RegisterResponse response = RegisterResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request);

        LoginResponse response = LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();

        return ResponseEntity.ok(response);
    }
}
