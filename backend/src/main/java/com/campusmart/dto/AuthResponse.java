package com.campusmart.dto;

public class AuthResponse {

    private String token;
    private ProfileResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String token, ProfileResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public ProfileResponse getUser() {
        return user;
    }

    public void setUser(ProfileResponse user) {
        this.user = user;
    }
}
