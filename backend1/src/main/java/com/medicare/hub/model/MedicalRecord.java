package com.medicare.hub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medical_records")
public class MedicalRecord {
    @Id
    private String id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    private String hospital;

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "record_type")
    private String recordType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "record_date")
    private LocalDate recordDate;

    @Column(name = "softcopy_path", length = 500)
    private String softcopyPath;

    @Column(name = "prescription_path", length = 500)
    private String prescriptionPath;

    private String category;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
