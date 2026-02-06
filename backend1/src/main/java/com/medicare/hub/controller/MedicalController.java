package com.medicare.hub.controller;

import com.medicare.hub.service.CloudinaryService;
import com.medicare.hub.dto.ApiResponse;
import com.medicare.hub.model.LabResult;
import com.medicare.hub.model.MedicalRecord;
import com.medicare.hub.model.Prescription;
import com.medicare.hub.repository.LabResultRepository;
import com.medicare.hub.repository.MedicalRecordRepository;
import com.medicare.hub.repository.PrescriptionRepository;
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
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class MedicalController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabResultRepository labResultRepository;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/patient/{patientId}/{type}/records")
    public ResponseEntity<?> getRecords(@PathVariable String patientId, @PathVariable String type) {
        log.info("📋 Fetching {} records for patient: {}", type, patientId);

        try {
            switch (type.toLowerCase()) {
                case "medical":
                    List<MedicalRecord> medicalRecords = medicalRecordRepository
                            .findByPatientIdAndCategoryOrderByCreatedAtDesc(patientId, "Medical Record");
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "count", medicalRecords.size(),
                            "records", medicalRecords
                    ));

                case "prescription":
                    List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "count", prescriptions.size(),
                            "records", prescriptions
                    ));

                case "lab":
                    List<LabResult> labResults = labResultRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
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
                    medicalRecord.setPatientCondition(params.get("condition"));
                    medicalRecord.setMedications(params.get("medications"));
                    medicalRecord.setAllergies(params.get("allergies"));
                    medicalRecord.setCreatedAt(LocalDateTime.now());

                    if (params.get("recordDate") != null) {
                        medicalRecord.setRecordDate(LocalDate.parse(params.get("recordDate")));
                    }
                    // Upload files to Cloudinary
                    if (softcopyFile != null) {
                        String cloudinaryUrl = cloudinaryService.uploadFile(softcopyFile, "reports");
                        medicalRecord.setSoftcopyPath(cloudinaryUrl);
                    }

                    if (prescriptionImage != null) {
                        String cloudinaryUrl = cloudinaryService.uploadFile(prescriptionImage, "prescriptions");
                        medicalRecord.setPrescriptionPath(cloudinaryUrl);
                    }
                    medicalRecordRepository.save(medicalRecord);
                    log.info("✅ Saved medical record to PostgreSQL, files to cloudinary");
                    break;

                case "prescription":
                    Prescription prescription = new Prescription();
                    prescription.setId(recordId);
                    prescription.setPatientId(patientId);
                    prescription.setHospital(params.get("hospitalName"));
                    prescription.setDoctorName(params.get("doctorName"));
                    prescription.setMedicineName(params.get("medicineName"));
                    prescription.setInstructions(params.get("instructions"));
                    prescription.setNotes(params.get("notes"));
                    prescription.setStatus(params.getOrDefault("status", "Active"));

                    if (params.get("prescriptionDate") != null) {
                        prescription.setPrescriptionDate(LocalDate.parse(params.get("prescriptionDate")));
                    }

                    if (prescriptionImage != null) {
                        String cloudinaryUrl = cloudinaryService.uploadFile(prescriptionImage, "prescriptions");
                        prescription.setPrescriptionImage(cloudinaryUrl);
                    }

                    prescriptionRepository.save(prescription);
                    log.info("✅ Saved prescription to PostgreSQL, files to Cloudinary");
                    break;

                case "lab":
                    LabResult labResult = new LabResult();
                    labResult.setId(recordId);
                    labResult.setPatientId(patientId);
                    labResult.setHospitalName(params.get("hospitalName"));
                    labResult.setDoctorName(params.get("doctorName"));
                    labResult.setInstructions(params.get("instructions"));
                    labResult.setReport(params.get("report"));
                    //labResult.setCreatedAt(LocalDateTime.now());

                    if (params.get("labResultDate") != null) {
                        labResult.setLabResultDate(LocalDate.parse(params.get("labResultDate")));
                    }
                    if (softcopyFile != null) {
                        String cloudinaryUrl = cloudinaryService.uploadFile(softcopyFile, "labs");
                        labResult.setReportPath(cloudinaryUrl);
                    }
                    labResultRepository.save(labResult);
                    log.info("✅ Saved lab result to PostgreSQL, files to cloudinary");
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
                    Optional<MedicalRecord> medicalOpt = medicalRecordRepository.findById(recordId);
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
                        cloudinaryService.deleteFile(medicalRecord.getSoftcopyPath());
                        String cloudinaryUrl = cloudinaryService.uploadFile(softcopyFile, "reports");
                        medicalRecord.setSoftcopyPath(cloudinaryUrl);
                    }

                    if (prescriptionImage != null) {
                        cloudinaryService.deleteFile(medicalRecord.getPrescriptionPath());
                        String cloUrl = cloudinaryService.uploadFile(prescriptionImage, "prescriptions");
                        medicalRecord.setPrescriptionPath(cloUrl);
                    }
                    medicalRecordRepository.save(medicalRecord);
                    break;

                case "prescription":
                    Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(recordId);
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
                        cloudinaryService.deleteFile(prescription.getPrescriptionImage());
                        String cloUrl = cloudinaryService.uploadFile(prescriptionImage, "prescriptions");
                        prescription.setPrescriptionImage(cloUrl);
                    }

                    prescriptionRepository.save(prescription);
                    break;

                case "lab":
                    Optional<LabResult> labOpt = labResultRepository.findById(recordId);
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
                        cloudinaryService.deleteFile(labResult.getReportPath());
                        String cloUrl = cloudinaryService.uploadFile(softcopyFile, "labs");
                        labResult.setReportPath(cloUrl);
                    }

                    labResultRepository.save(labResult);
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
                    Optional<MedicalRecord> medicalOpt = medicalRecordRepository.findById(recordId);
                    if (medicalOpt.isPresent()) {
                        MedicalRecord record = medicalOpt.get();
                        cloudinaryService.deleteFile(record.getSoftcopyPath());
                        cloudinaryService.deleteFile(record.getPrescriptionPath());
                        medicalRecordRepository.deleteById(recordId);
                    }
                    break;

                case "prescription":
                    Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(recordId);
                    if (prescriptionOpt.isPresent()) {
                        Prescription prescription = prescriptionOpt.get();
                        cloudinaryService.deleteFile(prescription.getPrescriptionImage());
                        prescriptionRepository.deleteById(recordId);
                    }
                    break;

                case "lab":
                    Optional<LabResult> labOpt = labResultRepository.findById(recordId);
                    if (labOpt.isPresent()) {
                        LabResult labResult = labOpt.get();
                        cloudinaryService.deleteFile(labResult.getReportPath());
                        labResultRepository.deleteById(recordId);
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
