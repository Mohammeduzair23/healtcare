package com.medicare.hub.repository;

import com.medicare.hub.model.PatientNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PatientNotificationRepository extends JpaRepository<PatientNotification, String> {
    // Find all notifications for a patient
    List<PatientNotification> findByPatientIdOrderByCreatedAtDesc(String patientId);

    // Find unread notification
    List<PatientNotification> findByPatientIdAndIsReadOrderByCreatedAtDesc(
            String patientId,
            boolean isRead
    );

    // Find notifications by type
    List<PatientNotification> findByPatientIdAndTypeOrderByCreatedAtDesc(
            String patientId,
            String type
    );

    // Find passkey notifications that are not expired
    List<PatientNotification> findByPatientIdAndPasskeyIsNotNullAndExpiresAtAfterOrderByCreatedAtDesc(
            String patientId,
            LocalDateTime currentTime
    );

    // Count unread notifications
    long countByPatientIdAndIsRead(String patientId, Boolean isRead);

    // Delete old/expired notifications (for cleanup)
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}
