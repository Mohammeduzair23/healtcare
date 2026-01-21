package com.medicare.hub.controller;

import com.medicare.hub.config.S3StorageService;
import com.medicare.hub.dto.ApiResponse;
import com.medicare.hub.model.LabResult;
import com.medicare.hub.model.MedicalRecord;
import com.medicare.hub.model.Prescription;
import com.medicare.hub.storage.InMemoryStorage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class MedicalController {

    private final InMemoryStorage storage;
    private final S3StorageService s3Service;

    @GetMapping("/patient/{patientId}/{type}/records")
    ResponseEntity<?> getRecords(@PathVariable String patientId, @PathVariable String type) {
        log.info("📋 Fetching {} records for patient: {}", type, patientId);

        try {
            switch (type.toLowerCase()) {
                case "medical":
                    List<MedicalRecord> medicalRecords = storage
                            .findMedicalRecordsByPatientIdAndCategory(patientId, "Medical Record");
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "count", medicalRecords.size(),
                            "records", medicalRecords
                    ));

                case "prescription":
                    List<Prescription> prescriptions = storage.findPrescriptionsByPatientId(patientId);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "count", prescriptions.size(),
                            "records", prescriptions
                    ));

                case "lab":
                    List<LabResult> labResults = storage.findLabResultsByPatientId(patientId);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "count", labResults.size(),
                            "records", labResults
                    ));
                default:
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid record type"));
            }
        } catch (Exception e) {
            log.error("❌ Error fetching {} records:",type, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch " + type + " records"));
        }
    }

    @PostMapping("/patient/{patientId}/{type}/records")
    public ResponseEntity<?> addRecord(
            @PathVariable String patientId,
            @PathVariable String type,
            @RequestParam Map<String, String> params,
            @RequestParam(required = false) MultipartFile softcopyFile,
            @RequestParam(required = false) MultipartFile prescriptionImage) {

        log.info("📝 Adding {} record for patient: {}", type, patientId);

        try {
            String recordId = UUID.randomUUID().toString();

            switch (type.toLowerCase()) {
                case "medical":
                    MedicalRecord medicalRecord = new MedicalRecord();
                    medicalRecord.setId(recordId);
                    medicalRecord.setPatientId(patientId);
                    medicalRecord.setHospital(params.get("hospitalName"));
                    medicalRecord.setDoctorName(params.get("doctorName"));
                    medicalRecord.setRecordType(params.get("recordType"));
                    medicalRecord.setDescription(params.get("description"));
                    medicalRecord.setDetails(params.get("details"));
                    medicalRecord.setCategory("Medical Record");
                    medicalRecord.setCreatedAt(LocalDateTime.now());

                    if (params.get("recordDate") != null) {
                        medicalRecord.setRecordDate(LocalDate.parse(params.get("recordDate")));
                    }
                    // Upload files to S3
                    if (softcopyFile != null) {
                        String s3Url = s3Service.uploadFile(softcopyFile, "reports");
                        medicalRecord.setSoftcopyPath(s3Url);
                    }

                    if (prescriptionImage != null) {
                        String s3Url = s3Service.uploadFile(prescriptionImage, "prescriptions");
                        medicalRecord.setPrescriptionPath(s3Url);
                    }
                    storage.saveMedicalRecord(medicalRecord);
                    break;

                case "lab":
                    LabResult labResult = new LabResult();
                    labResult.setId(recordId);
                    labResult.setPatientId(patientId);
                    labResult.setHospitalName(params.get("hospitalName"));
                    labResult.setDoctorName(params.get("doctorName"));
                    labResult.setInstructions(params.get("instructions"));
                    labResult.setReport(params.get("report"));
                    labResult.setCreatedAt(LocalDateTime.now());

                    if (params.get("labResultDate") != null) {
                        String s3Url = s3Service.uploadFile(softcopyFile, "labs");
                        labResult.setReportPath(s3Url);
                    }
                    storage.saveLabResult(labResult);
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid record type"));
            }

            log.info("✅ {} record added successfully", type);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", type + " record added successfully",
                            "recordId", recordId
                    ));
        } catch (Exception e) {
            log.error("❌ Error adding {} record:", type, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to add " + type + " record: " + e.getMessage()));
        }
    }

    @PutMapping("/{type}/records/{recordId}")
    public ResponseEntity<?> updateRecord(
            @PathVariable String type,
            @PathVariable String recordId,
            @RequestParam Map<String, String> params,
            @RequestParam(required = false) MultipartFile softcopyFile,
            @RequestParam(required = false) MultipartFile prescriptionImage) {

        log.info("🔧 Updating {} record: {}", type, recordId);

        try {
            switch (type.toLowerCase()) {
                case "medical":
                    Optional<MedicalRecord> medicalOpt = storage.findMedicalRecordById(recordId);
                    if (medicalOpt.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error("Record not found"));
                    }

                    MedicalRecord medicalRecord = medicalOpt.get();
                    if (params.get("hospitalName") != null) medicalRecord.setHospital(params.get("hospitalName"));
                    if (params.get("doctorName") != null) medicalRecord.setDoctorName(params.get("doctorName"));
                    if (params.get("recordType") != null) medicalRecord.setRecordType(params.get("recordType"));
                    if (params.get("description") != null) medicalRecord.setDescription(params.get("description"));
                    if (params.get("details") != null) medicalRecord.setDetails(params.get("details"));

                    if (softcopyFile != null) {
                        s3Service.deleteFile(medicalRecord.getSoftcopyPath());
                        String s3Url = s3Service.uploadFile(softcopyFile, "reports");
                        medicalRecord.setSoftcopyPath(s3Url);
                    }

                    if (prescriptionImage != null) {
                        s3Service.deleteFile(medicalRecord.getPrescriptionPath());
                        String s3Url = s3Service.uploadFile(prescriptionImage, "prescriptions");
                        medicalRecord.setPrescriptionPath(s3Url);
                    }
                    storage.saveMedicalRecord(medicalRecord);
                    break;

                case "prescription":
                    Optional<Prescription> prescriptionOpt = storage.findPrescriptionById(recordId);
                    if (prescriptionOpt.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error("Record not found"));
                    }

                    Prescription prescription = prescriptionOpt.get();
                    if (params.get("hospitalName") != null) prescription.setHospital(params.get("hospitalName"));
                    if (params.get("doctorName") != null) prescription.setDoctorName(params.get("doctorName"));
                    if (params.get("medicineName") != null) prescription.setMedicineName(params.get("medicineName"));
                    if (params.get("instructions") != null) prescription.setInstructions(params.get("instructions"));
                    if (params.get("notes") != null) prescription.setNotes(params.get("notes"));
                    if (params.get("status") != null) prescription.setStatus(params.get("status"));

                    if (prescriptionImage != null) {
                        s3Service.deleteFile(prescription.getPrescriptionImage());
                        String s3Url = s3Service.uploadFile(prescriptionImage, "prescriptions");
                        prescription.setPrescriptionImage(s3Url);
                    }

                    storage.savePrescription(prescription);
                    break;

                case "lab":
                    Optional<LabResult> labOpt = storage.findLabResultById(recordId);
                    if (labOpt.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error("Record not found"));
                    }

                    LabResult labResult = labOpt.get();
                    if (params.get("hospitalName") != null) labResult.setHospitalName(params.get("hospitalName"));
                    if (params.get("doctorName") != null) labResult.setDoctorName(params.get("doctorName"));
                    if (params.get("instructions") != null) labResult.setInstructions(params.get("instructions"));
                    if (params.get("report") != null) labResult.setReport(params.get("report"));

                    if (softcopyFile != null) {
                        s3Service.deleteFile(labResult.getReportPath());
                        String s3Url = s3Service.uploadFile(softcopyFile, "labs");
                        labResult.setReportPath(s3Url);
                    }

                    storage.saveLabResult(labResult);
                    break;

                default:
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid record type"));
            }

            log.info("✅ {} record updated successfully", type);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", type + " record updated successfully",
                    "recordId", recordId
            ));
        } catch (Exception e) {
            log.error("❌ Error updating {} record:", type, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update " + type + " record: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{type}/records/{recordId}")
    public ResponseEntity<?> deleteRecord(@PathVariable String type, @PathVariable String recordId) {
        log.info("🗑️ Deleting {} record: {}", type, recordId);

        try {
            switch (type.toLowerCase()) {
                case "medical":
                    Optional<MedicalRecord> medicalOpt = storage.findMedicalRecordById(recordId);
                    if (medicalOpt.isPresent()) {
                        MedicalRecord record = medicalOpt.get();
                        s3Service.deleteFile(record.getSoftcopyPath());
                        s3Service.deleteFile(record.getPrescriptionPath());
                        storage.deleteMedicalRecord(recordId);
                    }
                    break;

                case "prescription":
                    Optional<Prescription> prescriptionOpt = storage.findPrescriptionById(recordId);
                    if (prescriptionOpt.isPresent()) {
                        Prescription prescription = prescriptionOpt.get();
                        s3Service.deleteFile(prescription.getPrescriptionImage());
                        storage.deletePrescription(recordId);
                    }
                    break;

                case "lab":
                    Optional<LabResult> labOpt = storage.findLabResultById(recordId);
                    if (labOpt.isPresent()) {
                        LabResult labResult = labOpt.get();
                        s3Service.deleteFile(labResult.getReportPath());
                        storage.deleteLabResult(recordId);
                    }
                    break;

                default:
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid record type"));
            }
            log.info("✅ {} record deleted successfully", type);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", type + " record deleted successfully"
            ));
        } catch (Exception e) {
            log.error("❌ Error deleting {} record:", type, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete " + type + " record"));
        }
    }

}
