package com.campusmart;

import com.campusmart.config.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils("testsecretkeytestsecretkeytestsecretkey2026", 3600000);
    }

    @Test
    void testTokenGenerationAndParsing() {
        UUID userId = UUID.randomUUID();
        String email = "student@university.edu";

        String token = jwtUtils.generateToken(userId, email);
        assertNotNull(token);
        assertTrue(jwtUtils.validateToken(token));
        assertEquals(email, jwtUtils.getEmailFromToken(token));
        assertEquals(userId, jwtUtils.getUserIdFromToken(token));
    }
}
