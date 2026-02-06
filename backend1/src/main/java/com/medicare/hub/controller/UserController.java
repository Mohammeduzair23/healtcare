package com.medicare.hub.controller;

import com.medicare.hub.dto.ApiResponse;
import com.medicare.hub.model.User;
import com.medicare.hub.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            log.info("📊 Fetched {} users", users.size());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", users.size(),
                    "users", users
            ));
        } catch (Exception e) {
            log.error("❌ Get users error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve users"));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            userRepository.deleteById(id);
            log.info("🗑️ User deleted: {}", id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User deleted successfully"
            ));
        } catch (Exception e) {
            log.error("❌ Delete error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve users"));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> grtUserProfile(@PathVariable String userId) {
        log.info("Fetching user profile: {}",userId);
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "user", userOpt.get()
            ));
        } catch (Exception e) {
            log.error("❌ Error fetching user profile:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch user profile"));
        }
    }

    @PutMapping("/user/{userId}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable String userId,
            @RequestBody Map<String, Object> updates) {
        log.info("Updating profile for user: {}", userId);

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();

            if (updates.containsKey("name")) {
                user.setName((String) updates.get("name"));
            }
            if (updates.containsKey("age")) {
                user.setAge((Integer) updates.get("age"));
            }
            if (updates.containsKey("gender")) {
                user.setGender((String) updates.get("gender"));
            }
            if (updates.containsKey("dateOfBirth")) {
                user.setDateOfBirth(LocalDate.parse((String) updates.get("dateOfBirth")));
            }
            userRepository.save(user);

            log.info("Profile updated successfully");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "user", user
            ));
        } catch (Exception e) {
            log.error("Error updating profile:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }
}
