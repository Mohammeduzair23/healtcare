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
import java.util.HashMap;
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
            log.info("Fetched {} users", users.size());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", users.size(),
                    "users", users
            ));
        } catch (Exception e) {
            log.error("Get users error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve users"));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            userRepository.deleteById(id);
            log.info("🗑 User deleted: {}", id);

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
            User user = userOpt.get();

            // Create response with profile completeness check
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            response.put("isProfileComplete", user.isProfileComplete());

            return ResponseEntity.ok(response);
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
        log.info("📝 Updates received: {}", updates);

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
                Object ageValue = updates.get("age");
                if (ageValue instanceof String) {
                    user.setAge(Integer.parseInt((String) ageValue));
                } else if (ageValue instanceof Integer) {
                    user.setAge((Integer) ageValue);
                }
            }
            if (updates.containsKey("gender")) {
                user.setGender((String) updates.get("gender"));
            }
            if (updates.containsKey("dateOfBirth")) {
                String dobStr = (String) updates.get("dateOfBirth");
                if (dobStr != null && !dobStr.isEmpty()) {
                    user.setDateOfBirth(LocalDate.parse(dobStr));
                }
            }
            if (updates.containsKey("hospitalName")) {
                user.setHospitalName((String) updates.get("hospitalName"));
            }
            User savedUser = userRepository.save(user);

            log.info("Profile updated successfully for user: {}", userId);

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
