package com.medicare.hub.controller;

import com.cloudinary.Api;
import com.medicare.hub.dto.ApiResponse;
import com.medicare.hub.dto.PasskeyVerification;
import com.medicare.hub.dto.PatientAccessRequest;
import com.medicare.hub.model.*;
import com.medicare.hub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PatientAccessController {

    private final UserRepository userRepository;
    private final PasskeyAccessRequestRepository passkeyRequestRepository;
    private final PatientNotificationRepository notificationRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabResultRepository labResultRepository;
    private final AppointmentRepository appointmentRepository;

    // Generate 5 Character passkey
    private String generatePassKey() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random random = new Random();
        StringBuilder passkey = new StringBuilder();

        for (int i =0; i < 5; i++) {
            passkey.append(chars.charAt(random.nextInt(chars.length())));
        }
        return passkey.toString();
    }

    // Step 1 Doctor Request Access
    @PostMapping("/doctor/{doctorId}/request-patient-access")
    public ResponseEntity<?> requestPatientAccess(
            @PathVariable String doctorId,
            @RequestBody PatientAccessRequest request) {

        log.info("Doctor {} requesting access to patient email: {}", doctorId, request.getPatientEmail());

        try {
            // Find doctor
            Optional<User> doctorOpt = userRepository.findById(doctorId);
            if (doctorOpt.isEmpty() || !doctorOpt.get().getRole().equals("Doctor")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid doctor ID"));
            }
            User doctor = doctorOpt.get();

            // Find Patient By email
            Optional<User> patientOpt = userRepository.findByEmail(request.getPatientEmail());
            if (patientOpt.isEmpty() || !patientOpt.get().getRole().equals("Patient")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Patient not found with this email"));
            }
            User patient = patientOpt.get();

            // Check if there's already an active request
            Optional<PasskeyAccessRequest> existingRequest =
                    passkeyRequestRepository.findByDoctorIdAndPatientIdAndStatusAndExpiresAtAfter(
                            doctorId,
                            patient.getId(),
                            "pending",
                            LocalDateTime.now()
                    );

            if (existingRequest.isPresent()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Access request already sent. Waiting for patient verification.",
                        "passkey", existingRequest.get().getPasskey(),
                        "expiresIn", "30 Minutes"
                ));
            }
                // Generate new passkey
                String passkey = generatePassKey();

                // Create Access Request
                PasskeyAccessRequest accessRequest = new PasskeyAccessRequest();
                accessRequest.setId(UUID.randomUUID().toString());
                accessRequest.setDoctorId(doctorId);
                accessRequest.setPatientId(patient.getId());
                accessRequest.setPasskey(passkey);
                accessRequest.setStatus("pending");
                accessRequest.setCreatedAt(LocalDateTime.now());
                accessRequest.setExpiresAt(LocalDateTime.now().plusMinutes(30));

                passkeyRequestRepository.save(accessRequest);

                // Create notification for patient
                PatientNotification notification = new PatientNotification();
                notification.setId(UUID.randomUUID().toString());
                notification.setPatientId(patient.getId());
                notification.setType("passkey_request");
                notification.setTitle("Doctor Access Request");
                notification.setMessage(String.format(
                        "%s has requested access to view your medical records. Please share this access code with the doctor: %s",
                        doctor.getName(),
                        passkey
                ));
                notification.setPasskey(passkey);
                notification.setDoctorName(doctor.getName());
                notification.setIsRead(false);
                notification.setCreatedAt(LocalDateTime.now());
                notification.setExpiresAt(LocalDateTime.now().plusMinutes(30));

                notificationRepository.save(notification);

                log.info("Passkey generated and notification sent: {}", passkey);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Access code sent to patient",
                        "passkey", passkey,
                        "expiresIn", "30 minutes",
                        "patientName", patient.getName()
                ));

        } catch (Exception e) {
            log.error("Error requesting patient access:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to request access: " + e.getMessage()));
        }
    }

    // STEP 2: DOCTOR VERIFIES PASSKEY
    @PostMapping("/doctor/{doctorId}/verify-passkey")
    public ResponseEntity<?> verifyPasskey(
            @PathVariable String doctorId,
            @RequestBody PasskeyVerification verification) {
        log.info("Doctor {} verifying passkey for patient: {}", doctorId, verification.getPatientEmail());

        try {
            // Find patient
            Optional<User> patientOpt = userRepository.findByEmail(verification.getPatientEmail());
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Patient not found"));
            }
            User patient = patientOpt.get();

            // Find matching passkey request
            Optional<PasskeyAccessRequest> requestOpt =
                    passkeyRequestRepository.findByPatientIdAndPasskeyAndStatus(
                            patient.getId(),
                            verification.getPasskey().toUpperCase(),
                            "pending"
                    );

            if (requestOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid or expired access code"));
            }
            PasskeyAccessRequest accessRequest = requestOpt.get();

            // Check if expired
            if (accessRequest.isExpired()) {
                accessRequest.setStatus("expired");
                passkeyRequestRepository.save(accessRequest);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Access code has expired. Please request a new one."));
            }

            // Check if doctor matches
            if (!accessRequest.getDoctorId().equals(doctorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("This access code was not generated for you"));
            }
            // Mark as verified
            accessRequest.setStatus("verified");
            accessRequest.setVerifiedAt(LocalDateTime.now());
            passkeyRequestRepository.save(accessRequest);

            // Fetch patient's complete data
            Map<String, Object> patientData = fetchPatientCompleteData(patient.getId(), doctorId);

            log.info("Passkey verified successfully");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Access granted",
                    "patient", patientData
            ));
        } catch (Exception e) {
            log.error("Error verifying passkey:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to verify passkey: " + e.getMessage()));
        }
    }

    // FETCH COMPLETE PATIENT DATA
    private Map<String, Object> fetchPatientCompleteData(String patientId, String doctorId) {
        Map<String, Object> data = new HashMap<>();

        // Basic patient info
        Optional<User> patientOpt = userRepository.findById(patientId);
        if (patientOpt.isPresent()) {
            User patient = patientOpt.get();
            data.put("id", patient.getId());
            data.put("name", patient.getName());
            data.put("email", patient.getEmail());
            data.put("age", patient.getAge());
            //data.put("condition", patient.getCondition());
            //data.put("lastVisit", patient.getLastVisit());
            //data.put("medications", parseJsonArray(patient.get()));
            //data.put("allergies", parseJsonArray(patient.getAllergies()));
        }

        // Medical records
        List<MedicalRecord> medicalRecords = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        data.put("medicalRecords", medicalRecords);
        data.put("medicalRecordsCount", medicalRecords.size());

        // Prescriptions
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        data.put("prescriptions", prescriptions);
        data.put("prescriptionsCount", prescriptions.size());

        // Lab results
        List<LabResult> labResults = labResultRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        data.put("labResults", labResults);
        data.put("labResultsCount", labResults.size());

        // Appointments
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        data.put("appointments", appointments);
        data.put("appointmentsCount", appointments.size());

        return data;
    }

    private List<String> parseJsonArray(String jsonArray) {
        if (jsonArray == null || jsonArray.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            // Remove brackets and split by comma
            String cleaned = jsonArray.replace("[", "").replace("]", "").replace("\"", "");
            if (cleaned.trim().isEmpty()) {
                return new ArrayList<>();
            }
            return Arrays.asList(cleaned.split(","));
        } catch (Exception e) {
            return new ArrayList<>();
            }
        }

        // GET PATIENT NOTIFICATION
        @GetMapping("/patient/{patientId}/notifications")
        public ResponseEntity<?> getPatientNotifications(@PathVariable String patientId) {
            log.info("Fetching notifications for patient: {}", patientId);

        try {
            List<PatientNotification> notifications =
                    notificationRepository.findByPatientIdOrderByCreatedAtDesc(patientId);

            long unreadCount = notificationRepository.countByPatientIdAndIsRead(patientId, false);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "notifications", notifications,
                    "unreadCount", unreadCount
            ));
        } catch (Exception e) {
            log.error("Error fetching notifications:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch notifications"));
            }
        }

        // MARK NOTIFICATION AS READ
        @PutMapping("/patient/{patientId}/notifications/{notificationId}/read")
        public ResponseEntity<?> markNotificationAsRead(
                @PathVariable String patientId,
                @PathVariable String notificationId) {

            try {
                Optional<PatientNotification> notificationOpt = notificationRepository.findById(notificationId);
                if (notificationOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponse.error("Notification not found"));
                }

                PatientNotification notification = notificationOpt.get();
                if (!notification.getPatientId().equals(patientId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Not authorized"));
                }

                notification.setIsRead(true);
                notificationRepository.save(notification);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Notification marked as read"
                ));

            } catch (Exception e) {
                log.error("Error marking notification as read:", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Failed to mark notification as read"));
            }
        }

    // ============================================
    // DELETE NOTIFICATION
    // ============================================
    @DeleteMapping("/patient/{patientId}/notifications/{notificationId}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable String patientId,
            @PathVariable String notificationId) {

        log.info("🗑️ Deleting notification: {}", notificationId);

        try {
            Optional<PatientNotification> notificationOpt = notificationRepository.findById(notificationId);
            if (notificationOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Notification not found"));
            }

            PatientNotification notification = notificationOpt.get();
            if (!notification.getPatientId().equals(patientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Not authorized"));
            }

            notificationRepository.delete(notification);

            log.info("Notification deleted");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification deleted"
            ));

        } catch (Exception e) {
            log.error("Error deleting notification:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete notification"));
        }
    }
    }

