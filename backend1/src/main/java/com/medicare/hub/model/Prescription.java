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
@Table(name = "prescriptions")
public class Prescription {
    @Id
    private String id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    private String hospital;

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "prescription_date")
    private LocalDate prescriptionDate;

    private String status;

    @Column(name = "prescription_image", length = 500)
    private String prescriptionImage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "Active";
        }
    }
}
