package com.medicare.hub.controller;

import com.medicare.hub.dto.ApiResponse;
import com.medicare.hub.model.PatientHealthData;
import com.medicare.hub.model.User;
import com.medicare.hub.repository.PatientHealthDataRepository;
import com.medicare.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/patient")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PatientHealthDataController {

    private PatientHealthDataRepository healthDataRepository;
    private UserRepository userRepository;

    @GetMapping("/{patientId}/health-data")
    public ResponseEntity<?> getHealthData(@PathVariable String patientId) {
        log.info("Fetching health data for patient: {}", patientId);

        try {
            Optional<User> patientOpt = userRepository.findById(patientId);
            if (patientOpt.isPresent() || !patientOpt.get().getRole().equals("Patient")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Patient Not Found"));
            }

            //Get Health Data
            Optional<PatientHealthData> healthDataOpt = healthDataRepository.findByPatientId(patientId);

            if (healthDataOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "No health data found",
                        "healthData", null
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "healthData", healthDataOpt.get()
            ));
        } catch (Exception e) {
            log.info("Error fetching health data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch health data"));
        }
    }
}
