package com.equisplit.service;

import com.equisplit.dto.request.RegisterRequest;
import com.equisplit.dto.request.LoginRequest;
import com.equisplit.dto.response.LoginResponse;
import com.equisplit.entity.User;

public interface UserService {

    User register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    boolean existsByEmail(String email);
}
