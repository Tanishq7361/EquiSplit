package com.equisplit.controller;

import com.equisplit.dto.request.ChangeUsernameRequest;
import com.equisplit.dto.request.UpdateProfileRequest;
import com.equisplit.dto.response.RegisterResponse;
import com.equisplit.dto.response.UserProfileResponse;
import com.equisplit.entity.User;
import com.equisplit.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping({"/api/v1/users/me", "/api/users/me"})
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        User user = userService.getProfile(authentication.getName());

        UserProfileResponse response = UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .phoneNumber(user.getPhoneNumber())
                .defaultCurrency(user.getDefaultCurrency())
                .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping({"/api/users/profile", "/api/v1/users/profile"})
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        User user = userService.updateProfile(request, authentication.getName());

        UserProfileResponse response = UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .phoneNumber(user.getPhoneNumber())
                .defaultCurrency(user.getDefaultCurrency())
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping({"/api/users/profile", "/api/v1/users/profile"})
    public ResponseEntity<UserProfileResponse> updateProfilePut(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        return updateProfile(request, authentication);
    }

    @PatchMapping({"/api/users/username", "/api/v1/users/username"})
    public ResponseEntity<RegisterResponse> changeUsername(
            @Valid @RequestBody ChangeUsernameRequest request,
            Authentication authentication) {

        User user = userService.changeUsername(request, authentication.getName());

        RegisterResponse response = RegisterResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .build();

        return ResponseEntity.ok(response);
    }
}