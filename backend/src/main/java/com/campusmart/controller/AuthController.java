package com.campusmart.controller;

import com.campusmart.config.UserPrincipal;
import com.campusmart.dto.AuthResponse;
import com.campusmart.dto.LoginRequest;
import com.campusmart.dto.ProfileResponse;
import com.campusmart.dto.SignupRequest;
import com.campusmart.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        ProfileResponse response = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(response);
    }
}
