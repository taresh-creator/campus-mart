package com.campusmart.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SellerDto {

    @JsonProperty("full_name")
    private String fullName;

    private String email;

    public SellerDto() {
    }

    public SellerDto(String fullName, String email) {
        this.fullName = fullName;
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
