package com.medicare.hub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "patient_health_data")
public class PatientHealthData {
    @Id
    private String Id;

    @Column(name = "patient_id", nullable = false, unique = true)
    private String patientId;

    @Column(name = "condition")
    private String condition;

    @Column(name = "last_visit")
    private LocalDate lastVisit;

    @Column(name = "age")
    private Integer age;

    @Column(name = "medications")
    private List<String> medications;

    @ElementCollection
    @CollectionTable(name = "patient_allergies", joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "allergies")
    private List<String> allergies;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
