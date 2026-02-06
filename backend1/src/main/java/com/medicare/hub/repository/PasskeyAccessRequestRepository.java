package com.medicare.hub.repository;

import com.medicare.hub.model.PasskeyAccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasskeyAccessRequestRepository extends JpaRepository<PasskeyAccessRequest, String> {

    // Find all requests by doctor
    List<PasskeyAccessRequest> findByDoctorIdOrderByCreatedAtDesc(String doctorId);

    // Find all requests by patient
    List<PasskeyAccessRequest> findByPatientIdOrderByCreatedAtDesc(String patientId);

    // Find pending requests by patient
    List<PasskeyAccessRequest> findByPatientIdAndStatus(String patientId, String status);

    // Find by passkey and patient (for verification)
    Optional<PasskeyAccessRequest> findByPatientIdAndPasskeyAndStatus(
            String patientId,
            String passkey,
            String status
    );

    // Find active request between doctor and patient
    Optional<PasskeyAccessRequest> findByDoctorIdAndPatientIdAndStatusAndExpiresAtAfter(
            String doctorId,
            String patientId,
            String status,
            LocalDateTime currentTime
    );

    // Delete expired requests (for cleanup)
    void deleteByExpiresAtBefore(LocalDateTime currentTime);
}