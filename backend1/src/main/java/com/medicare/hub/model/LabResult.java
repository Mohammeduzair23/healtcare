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
@Table(name = "lab_results")
public class LabResult {
    @Id
    private String id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(name = "hospital_name")
    private String hospitalName;

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(columnDefinition = "TEXT")
    private String report;

    @Column(name = "lab_result_date")
    private LocalDate labResultDate;

    @Column(name = "report_path", length = 500)
    private String reportPath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
