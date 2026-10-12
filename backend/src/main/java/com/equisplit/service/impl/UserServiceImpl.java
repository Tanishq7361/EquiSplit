package com.equisplit.service.impl;

import com.equisplit.dto.request.GoogleLoginRequest;
import com.equisplit.dto.request.LoginRequest;
import com.equisplit.dto.request.RegisterRequest;
import com.equisplit.dto.response.LoginResponse;
import com.equisplit.entity.User;
import com.equisplit.exception.ConflictException;
import com.equisplit.exception.ResourceNotFoundException;
import com.equisplit.exception.UnauthorizedActionException;
import com.equisplit.repository.UserRepository;
import com.equisplit.security.JwtService;
import com.equisplit.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${google.client-id:}")
    private String googleClientId;

    @Override
    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UnauthorizedActionException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedActionException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedActionException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public User updateProfile(com.equisplit.dto.request.UpdateProfileRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null) {
            String newName = request.getName().trim();
            if (newName.isEmpty()) {
                throw new IllegalArgumentException("Name cannot be empty");
            }
            if (newName.length() < 2 || newName.length() > 120) {
                throw new IllegalArgumentException("Name must be between 2 and 120 characters");
            }
            user.setName(newName);
        }

        if (request.getProfileImageUrl() != null) {
            String img = request.getProfileImageUrl().trim();
            user.setProfileImageUrl(img.isEmpty() ? null : img);
        }

        user.setUpdatedAt(OffsetDateTime.now());
        return userRepository.save(user);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public User changeUsername(com.equisplit.dto.request.ChangeUsernameRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String newUsername = request.getNewUsername();

        if (newUsername == null || newUsername.isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (newUsername.length() < 2 || newUsername.length() > 30) {
            throw new IllegalArgumentException("Username must be between 2 and 30 characters");
        }

        if (!newUsername.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("Username must contain only letters, numbers and underscores");
        }

        if (newUsername.equals(user.getName())) {
            throw new IllegalArgumentException("Username cannot be same as current username");
        }

        if (userRepository.existsByName(newUsername)) {
            throw new ConflictException("Username already exists.");
        }

        user.setName(newUsername);
        user.setUpdatedAt(OffsetDateTime.now());
        return userRepository.save(user);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        if (request.getIdToken() == null || request.getIdToken().trim().isEmpty()) {
            throw new UnauthorizedActionException("ID token is required");
        }

        Map<String, Object> payload;
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getIdToken().trim();
            //noinspection unchecked
            payload = restTemplate.getForObject(url, Map.class);
        } catch (RestClientException ex) {
            throw new UnauthorizedActionException("Failed to verify Google token: " + ex.getMessage());
        }

        if (payload == null || !payload.containsKey("email")) {
            throw new UnauthorizedActionException("Invalid Google token payload");
        }

        Object emailVerifiedObj = payload.get("email_verified");
        boolean emailVerified = emailVerifiedObj instanceof Boolean
                ? (Boolean) emailVerifiedObj
                : "true".equalsIgnoreCase(String.valueOf(emailVerifiedObj));

        if (!emailVerified) {
            throw new UnauthorizedActionException("Google email is not verified");
        }

        if (googleClientId != null && !googleClientId.trim().isEmpty()) {
            String aud = String.valueOf(payload.get("aud"));
            if (!googleClientId.trim().equals(aud)) {
                throw new UnauthorizedActionException("Google token audience mismatch");
            }
        }

        String email = String.valueOf(payload.get("email")).toLowerCase().trim();
        String name = payload.get("name") != null ? String.valueOf(payload.get("name")).trim() : null;
        if (name == null || name.isEmpty()) {
            name = email.split("@")[0];
        }
        if (name.length() > 120) {
            name = name.substring(0, 120);
        }

        String picture = payload.get("picture") != null ? String.valueOf(payload.get("picture")).trim() : null;

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .name(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .profileImageUrl(picture)
                    .isActive(true)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();
            user = userRepository.save(user);
        } else {
            boolean updated = false;
            if ((user.getProfileImageUrl() == null || user.getProfileImageUrl().isEmpty()) && picture != null) {
                user.setProfileImageUrl(picture);
                updated = true;
            }
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                user.setIsActive(true);
                updated = true;
            }
            if (updated) {
                user.setUpdatedAt(OffsetDateTime.now());
                user = userRepository.save(user);
            }
        }

        String token = jwtService.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}

