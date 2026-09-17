package com.campusmart.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class ProfileUpdateRequest {

    @NotBlank(message = "Full name cannot be blank")
    @JsonAlias({"fullName", "full_name"})
    private String fullName;

    public ProfileUpdateRequest() {
    }

    public ProfileUpdateRequest(String fullName) {
        this.fullName = fullName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
