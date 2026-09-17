package com.campusmart.config;

import java.security.Principal;
import java.util.UUID;

public class UserPrincipal implements Principal {

    private final UUID id;
    private final String email;

    public UserPrincipal(UUID id, String email) {
        this.id = id;
        this.email = email;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getName() {
        return email;
    }
}
