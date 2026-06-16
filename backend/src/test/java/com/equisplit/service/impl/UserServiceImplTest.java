package com.equisplit.service.impl;

import com.equisplit.repository.UserRepository;
import com.equisplit.security.JwtService;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.equisplit.dto.request.LoginRequest;
import com.equisplit.dto.request.RegisterRequest;
import com.equisplit.dto.response.LoginResponse;
import com.equisplit.entity.User;
import com.equisplit.exception.UnauthorizedActionException;

import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void register_shouldCreateUser() {

        RegisterRequest request = new RegisterRequest();

        request.setName("QuantumCoder");
        request.setEmail("test@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("test@test.com"))
                .thenReturn(false);

        when(passwordEncoder.encode("password123"))
                .thenReturn("encoded-password");

        User savedUser = User.builder()
                .id(1L)
                .name("QuantumCoder")
                .email("test@test.com")
                .passwordHash("encoded-password")
                .build();

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        User result = userService.register(request);

        assertNotNull(result);

        assertEquals("QuantumCoder", result.getName());

        assertEquals("test@test.com", result.getEmail());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldThrowException_whenEmailAlreadyExists() {

        RegisterRequest request = new RegisterRequest();

        request.setName("QuantumCoder");
        request.setEmail("test@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("test@test.com"))
                .thenReturn(true);

        assertThrows(
                UnauthorizedActionException.class,
                () -> userService.register(request)
        );

        verify(userRepository, never())
                .save(any(User.class));
    }

    @Test
    void login_shouldReturnJwtToken() {

        LoginRequest request = new LoginRequest();

        request.setEmail("test@test.com");
        request.setPassword("password123");

        User user = User.builder()
                .id(1L)
                .name("QuantumCoder")
                .email("test@test.com")
                .passwordHash("encoded-password")
                .build();

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(java.util.Optional.of(user));

        when(passwordEncoder.matches(
                "password123",
                "encoded-password"))
                .thenReturn(true);

        when(jwtService.generateToken("test@test.com"))
                .thenReturn("jwt-token");

        LoginResponse response = userService.login(request);

        assertNotNull(response);

        assertEquals(
                "jwt-token",
                response.getToken()
        );

        verify(jwtService)
                .generateToken("test@test.com");
    }

    @Test
    void login_shouldThrowException_whenPasswordIsWrong() {

        LoginRequest request = new LoginRequest();

        request.setEmail("test@test.com");
        request.setPassword("wrong-password");

        User user = User.builder()
                .email("test@test.com")
                .passwordHash("encoded-password")
                .build();

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(java.util.Optional.of(user));

        when(passwordEncoder.matches(
                "wrong-password",
                "encoded-password"))
                .thenReturn(false);

        assertThrows(
                UnauthorizedActionException.class,
                () -> userService.login(request)
        );

        verify(jwtService, never())
                .generateToken(anyString());
    }
}