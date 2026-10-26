
package com.example.backend.controller;

import com.example.backend.entity.AppUser;
import com.example.backend.service.AuthService;
import com.example.backend.service.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String name = request.get("name");
            String phone = request.get("phone");
            String intent = request.get("intent");

            if (email == null || email.isBlank()
                    || !email.contains("@")) {
                return ResponseEntity.badRequest().body(
                        Map.of("message",
                                "Please enter a valid email address."));
            }

            if (password == null || password.length() < 8) {
                return ResponseEntity.badRequest().body(
                        Map.of("message",
                                "Password must contain at least 8 characters."));
            }

            if (name == null || name.isBlank()
                    || phone == null || phone.isBlank()
                    || intent == null || intent.isBlank()
                    || request.get("propertyType") == null
                    || request.get("state") == null
                    || request.get("city") == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message",
                                "Please complete all required registration fields."));
            }

            AppUser user = authService.register(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "Registration successful.",
                            "email", user.getEmail()
                    ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null
                || !authService.verifyPassword(email, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid email or password."));
        }

        String normalizedEmail = email.trim().toLowerCase();

        String token = jwtService.generateToken(normalizedEmail);

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful.",
                        "token", token,
                        "email", normalizedEmail
                ));
    }
}
