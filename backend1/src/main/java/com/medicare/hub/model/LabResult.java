package com.medicare.hub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabResult {
    private String id;
    private String patientId;
    private String hospitalName;
    private String doctorName;
    private String instructions;
    private String report;
    private LocalDate labResultDate;
    private String reportPath;  // S3 URL
    private LocalDateTime createdAt;
}
