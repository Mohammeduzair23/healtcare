package com.medicare.hub.controller;

import com.medicare.hub.dto.*;
import com.medicare.hub.model.User;
import com.medicare.hub.storage.InMemoryStorage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AuthController {

    private final InMemoryStorage storage;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        log.info("📝 Registration attempt: {}, {}", request.getName(), request.getEmail());

        try {
            if (request.getName() == null || request.getEmail() == null ||
                request.getPassword() == null || request.getRole() == null ) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("All fields are requied"));
            }
            Optional<User> existingUser = storage.findUserByEmail(request.getEmail());
            if (existingUser.isPresent()) {
                log.warn("⚠️ User already exists: {}", request.getEmail());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User with this email already exists"));
            }
            User user = new User();
            user.setId(UUID.randomUUID().toString());
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setRole(request.getRole());
            user.setCreatedAt(LocalDateTime.now());

            storage.saveUser(user);

            log.info("✅ User created: {}",request.getEmail());

            UserResponse userResponse = new UserResponse(
                    user.getId(), user.getName(), user.getEmail(), user.getRole()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new Object() {
                        public boolean success = true;
                        public String message = "User registered successfully";
                        public UserResponse user = userResponse;
                    });
        } catch (Exception e) {
            log.error("❌ Registration error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error during registration"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        log.info("🔑 Login attempt: {}", request.getEmail());

        try {
            if (request.getEmail() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email and password are required"));
            }
            Optional<User> userOpt = storage.findUserByEmailAndPassword(
                    request.getEmail(), request.getPassword()
            );
            if (userOpt.isEmpty()) {
                log.warn("⚠️ Invalid credentials for: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid email or password"));
            }

            User user = userOpt.get();
            log.info("✅ Login successful: {}", request.getEmail());

            UserResponse userResponse = new UserResponse(
                    user.getId(), user.getName(), user.getEmail(), user.getRole()
            );

            return ResponseEntity.ok(new Object() {
                public boolean success = true;
                public UserResponse userData = userResponse;
            });

        } catch (Exception e) {
            log.error("❌ Login error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Server error during login"));
        }
    }
}
