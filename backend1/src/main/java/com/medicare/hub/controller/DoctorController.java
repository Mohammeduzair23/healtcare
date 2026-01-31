package com.medicare.hub.controller;

import com.medicare.hub.dto.ApiResponse;
import com.medicare.hub.model.*;
import com.medicare.hub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DoctorController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final LabResultRepository labResultRepository;
    private final DoctorTaskRepository doctorTaskRepository;
    private final PatientHealthDataRepository patientHealthDataRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;

    // ============================================
    // NEW PATIENTS
    // ============================================

    @GetMapping("/{doctorId}/patients/new")
    public ResponseEntity<?> getNewPatients(@PathVariable String doctorId) {
        log.info("👥 Fetching new patients for doctor: {}", doctorId);

        try {
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);

            List<Appointment> recentAppointments = appointmentRepository
                    .findByDoctorIdOrderByAppointmentDateAsc(doctorId)
                    .stream()
                    .filter(apt -> apt.getCreatedAt().isAfter(oneWeekAgo))
                    .filter(apt -> "New Patient".equals(apt.getType()))
                    .collect(Collectors.toList());

            List<Map<String, Object>> newPatients = recentAppointments.stream()
                    .map(apt -> {
                        Map<String, Object> patient = new HashMap<>();
                        userRepository.findById(apt.getPatientId()).ifPresent(user -> {
                            patient.put("id", user.getId());
                            patient.put("name", user.getName());
                            patient.put("email", user.getEmail());
                            patient.put("appointmentDate", apt.getAppointmentDate());
                        });
                        return patient;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", newPatients.size(),
                    "patients", newPatients
            ));

        } catch (Exception e) {
            log.error("❌ Error fetching new patients:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch new patients"));
        }
    }

    // ============================================
    // LAB RESULTS (PENDING REVIEW)
    // ============================================

    @GetMapping("/{doctorId}/lab-results/pending")
    public ResponseEntity<?> getPendingLabResults(@PathVariable String doctorId) {
        log.info("🧪 Fetching pending lab results for doctor: {}", doctorId);

        try {
            Set<String> patientIds = appointmentRepository
                    .findByDoctorIdOrderByAppointmentDateAsc(doctorId)
                    .stream()
                    .map(Appointment::getPatientId)
                    .collect(Collectors.toSet());

            List<Map<String, Object>> pendingResults = new ArrayList<>();

            for (String patientId : patientIds) {
                List<LabResult> labResults = labResultRepository
                        .findByPatientIdOrderByCreatedAtDesc(patientId);
                labResults.stream()
                        .limit(3)
                        .forEach(lab -> {
                            Map<String, Object> result = new HashMap<>();
                            result.put("id", lab.getId());
                            result.put("testName", lab.getReport() != null ? lab.getReport() : "Lab Test");
                            result.put("status", getRandomStatus());
                            result.put("date", lab.getLabResultDate());

                            userRepository.findById(patientId).ifPresent(patient -> {
                                result.put("patientName", patient.getName());
                            });

                            pendingResults.add(result);
                        });
            }

            List<Map<String, Object>> limitedResults = pendingResults.stream()
                    .limit(10)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", limitedResults.size(),
                    "results", limitedResults
            ));

        } catch (Exception e) {
            log.error("❌ Error fetching lab results:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch lab results"));
        }
    }

    // ============================================
    // DOCTOR TASKS
    // ============================================

    @GetMapping("/{doctorId}/tasks")
    public ResponseEntity<?> getDoctorTasks(@PathVariable String doctorId) {
        log.info("📝 Fetching tasks for doctor: {}", doctorId);

        try {
            List<DoctorTask> tasks = doctorTaskRepository
                    .findByDoctorIdOrderByCompletedAscCreatedAtDesc(doctorId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", tasks.size(),
                    "tasks", tasks
            ));

        } catch (Exception e) {
            log.error("❌ Error fetching tasks:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch tasks"));
        }
    }

    @PutMapping("/{doctorId}/tasks/{taskId}/complete")
    public ResponseEntity<?> completeTask(
            @PathVariable String doctorId,
            @PathVariable String taskId) {

        log.info("✅ Completing task: {}", taskId);

        try {
            Optional<DoctorTask> taskOpt = doctorTaskRepository.findById(taskId);
            if (taskOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Task not found"));
            }

            DoctorTask task = taskOpt.get();

            if (!task.getDoctorId().equals(doctorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Not authorized to complete this task"));
            }

            task.setCompleted(true);
            task.setCompletedAt(LocalDateTime.now());
            doctorTaskRepository.save(task);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Task completed successfully"
            ));

        } catch (Exception e) {
            log.error("❌ Error completing task:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to complete task"));
        }
    }

    // ============================================
    // PATIENT OVERVIEW (SIMPLIFIED - FROM HEALTH DATA)
    // ============================================

    @GetMapping("/{doctorId}/patient/{patientId}/overview")
    public ResponseEntity<?> getPatientOverview(
            @PathVariable String doctorId,
            @PathVariable String patientId) {

        log.info("Fetching patient overview for patient: {}", patientId);

        try {
            Optional<User> patientOpt = userRepository.findById(patientId);
            if (patientOpt.isEmpty() || !patientOpt.get().getRole().equals("Patient")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Patient not found"));
            }

            User patient = patientOpt.get();

            Map<String, Object> overview = new HashMap<>();
            overview.put("name", patient.getName());
            overview.put("id", patient.getId());

            // Get from patient_health_data table
            Optional<PatientHealthData> healthDataOpt = patientHealthDataRepository.findByPatientId(patientId);

            if (healthDataOpt.isPresent()) {
                PatientHealthData healthData = healthDataOpt.get();
                overview.put("age", healthData.getAge());
                overview.put("condition", healthData.getCondition());
                overview.put("lastVisit", healthData.getLastVisit());
                overview.put("medications", stringToList(String.valueOf(healthData.getMedications())));
                overview.put("allergies", stringToList(String.valueOf(healthData.getAllergies())));
            } else {
                // Default values if no health data
                overview.put("age", null);
                overview.put("condition", "Not specified");
                overview.put("lastVisit", null);
                overview.put("medications", Arrays.asList());
                overview.put("allergies", Arrays.asList());
            }

            // Mock vitals (can be added to health_data table if needed)
            Map<String, Integer> bp = new HashMap<>();
            bp.put("systolic", 138);
            bp.put("diastolic", 85);
            overview.put("bloodPressure", bp);
            overview.put("heartRate", 78);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "patient", overview
            ));

        } catch (Exception e) {
            log.error("❌ Error fetching patient overview:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch patient overview"));
        }
    }

    private List<String> stringToList(String input) {
        if (input == null || input.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> result = new ArrayList<>();
        String[] parts = input.split(",");
        for (String part : parts) {
            result.add(part.trim());
        }
        return result;
    }

    // ============================================
    // PATIENT FULL DETAILS (FROM MEDICAL RECORDS)
    // ============================================

    @GetMapping("/{doctorId}/patient/{patientId}/full-details")
    public ResponseEntity<?> getPatientFullDetails(
            @PathVariable String doctorId,
            @PathVariable String patientId) {

        log.info("📄 Fetching full details for patient: {}", patientId);

        try {
            Optional<User> patientOpt = userRepository.findById(patientId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Patient not found"));
            }

            User patient = patientOpt.get();
            Map<String, Object> fullDetails = new HashMap<>();

            // Basic info
            fullDetails.put("id", patient.getId());
            fullDetails.put("name", patient.getName());
            fullDetails.put("email", patient.getEmail());

            // Health data
            patientHealthDataRepository.findByPatientId(patientId).ifPresent(healthData -> {
                fullDetails.put("age", healthData.getAge());
                fullDetails.put("condition", healthData.getCondition());
                fullDetails.put("lastVisit", healthData.getLastVisit());
                fullDetails.put("medications", healthData.getMedications());
                fullDetails.put("allergies", healthData.getAllergies());
            });

            // Medical records
            List<MedicalRecord> medicalRecords = medicalRecordRepository
                    .findByPatientIdOrderByCreatedAtDesc(patientId);
            fullDetails.put("medicalRecords", medicalRecords);
            fullDetails.put("medicalRecordsCount", medicalRecords.size());

            // Prescriptions
            List<Prescription> prescriptions = prescriptionRepository
                    .findByPatientIdOrderByCreatedAtDesc(patientId);
            fullDetails.put("prescriptions", prescriptions);
            fullDetails.put("prescriptionsCount", prescriptions.size());

            // Lab results
            List<LabResult> labResults = labResultRepository
                    .findByPatientIdOrderByCreatedAtDesc(patientId);
            fullDetails.put("labResults", labResults);
            fullDetails.put("labResultsCount", labResults.size());

            // Appointments
            List<Appointment> appointments = appointmentRepository
                    .findByPatientIdOrderByCreatedAtDesc(patientId);
            fullDetails.put("appointments", appointments);
            fullDetails.put("appointmentsCount", appointments.size());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "patient", fullDetails
            ));

        } catch (Exception e) {
            log.error("❌ Error fetching full details:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch full details"));
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private String getRandomStatus() {
        String[] statuses = {"Normal", "High", "Elevated", "Low"};
        return statuses[new Random().nextInt(statuses.length)];
    }
}