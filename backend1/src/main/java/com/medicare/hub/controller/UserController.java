package com.medicare.hub.controller;

import com.medicare.hub.dto.ApiResponse;
import com.medicare.hub.model.User;
import com.medicare.hub.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
}
