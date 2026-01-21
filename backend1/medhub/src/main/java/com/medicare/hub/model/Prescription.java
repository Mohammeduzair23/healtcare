package com.medicare.hub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    private String id;
    private String patientId;
    private String hospital;
    private String doctorName;
    private String medicineName;
    private String instructions;
    private String notes;
    private LocalDate prescriptionDate;
    private String status;
    private String prescriptionImage;  // S3 URL
    private LocalDateTime createdAt;
}
