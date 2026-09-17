package com.campusmart.service;

import com.campusmart.dto.ProfileResponse;
import com.campusmart.dto.ProfileUpdateRequest;
import com.campusmart.exception.ResourceNotFoundException;
import com.campusmart.model.Profile;
import com.campusmart.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfileById(UUID id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        return new ProfileResponse(profile.getId(), profile.getFullName(), profile.getEmail(), profile.getCreatedAt());
    }

    @Transactional
    public ProfileResponse updateProfile(UUID id, ProfileUpdateRequest request) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            profile.setFullName(request.getFullName().trim());
        }

        Profile updated = profileRepository.save(profile);
        return new ProfileResponse(updated.getId(), updated.getFullName(), updated.getEmail(), updated.getCreatedAt());
    }
}
