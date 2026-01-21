package com.medicare.hub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {
    private String id;
    private String patientId;
    private String hospital;
    private String doctorName;
    private String recordType;
    private String description;
    private String details;
    private LocalDate recordDate;
    private String softcopyPath;      // S3 URL
    private String prescriptionPath;  // S3 URL
    private String category;
    private LocalDateTime createdAt;
}
