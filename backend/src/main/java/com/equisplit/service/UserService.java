package com.equisplit.service;

import com.equisplit.dto.request.RegisterRequest;
import com.equisplit.dto.request.LoginRequest;
import com.equisplit.dto.response.LoginResponse;
import com.equisplit.entity.User;

public interface UserService {

    User register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    boolean existsByEmail(String email);

    User changeUsername(com.equisplit.dto.request.ChangeUsernameRequest request, String email);

    User updateProfile(com.equisplit.dto.request.UpdateProfileRequest request, String email);

    User getProfile(String email);

    LoginResponse loginWithGoogle(com.equisplit.dto.request.GoogleLoginRequest request);
}

