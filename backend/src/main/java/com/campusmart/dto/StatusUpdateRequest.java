package com.campusmart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class StatusUpdateRequest {

    @NotBlank(message = "Status cannot be blank")
    @Pattern(regexp = "^(active|sold)$", message = "Status must be either 'active' or 'sold'")
    private String status;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
