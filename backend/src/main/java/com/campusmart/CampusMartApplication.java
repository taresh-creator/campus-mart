package com.campusmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class CampusMartApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusMartApplication.class, args);
    }

    @RestController
    static class HealthController {
        @GetMapping("/api/health")
        public String health() {
            return "Campus Mart Backend is running";
        }
    }
}