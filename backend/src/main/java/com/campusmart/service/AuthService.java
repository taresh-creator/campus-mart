package com.campusmart.service;

import com.campusmart.config.JwtUtils;
import com.campusmart.dto.AuthResponse;
import com.campusmart.dto.LoginRequest;
import com.campusmart.dto.ProfileResponse;
import com.campusmart.dto.SignupRequest;
import com.campusmart.exception.BadRequestException;
import com.campusmart.exception.ResourceNotFoundException;
import com.campusmart.model.Profile;
import com.campusmart.repository.ProfileRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(ProfileRepository profileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (profileRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists");
        }

        Profile profile = new Profile();
        profile.setFullName(request.getFullName().trim());
        profile.setEmail(email);
        profile.setPassword(passwordEncoder.encode(request.getPassword()));

        Profile saved = profileRepository.save(profile);

        String token = jwtUtils.generateToken(saved.getId(), saved.getEmail());
        ProfileResponse userDto = new ProfileResponse(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getCreatedAt());

        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Profile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), profile.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtils.generateToken(profile.getId(), profile.getEmail());
        ProfileResponse userDto = new ProfileResponse(profile.getId(), profile.getFullName(), profile.getEmail(), profile.getCreatedAt());

        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getCurrentUser(UUID userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new ProfileResponse(profile.getId(), profile.getFullName(), profile.getEmail(), profile.getCreatedAt());
    }
}
