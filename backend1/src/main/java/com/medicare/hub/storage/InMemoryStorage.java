package com.medicare.hub.storage;

import com.medicare.hub.model.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class InMemoryStorage {
    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, MedicalRecord> medicalRecords = new ConcurrentHashMap<>();
    private final Map<String, Prescription> prescriptions = new ConcurrentHashMap<>();
    private final Map<String, LabResult> labResults = new ConcurrentHashMap<>();

    // User Operations
    public void saveUser(User user) {
        users.put(user.getId(),user);
    }

    public Optional<User> findUserById(String id) {
        return Optional.ofNullable(users.get(id));
    }

    public Optional<User> findUserByEmail(String email) {
        return users.values().stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }

    public Optional<User> findUserByEmailAndPassword(String email, String password) {
        return users.values().stream()
                .filter(user -> user.getEmail().equals(email) && user.getPassword().equals(password))
                .findFirst();
    }

    public List<User> findAllUsers() {
        return new ArrayList<>(users.values());
    }

    public void deleteUser(String id) {
        users.remove(id);
    }

    // Medical Record Operations
    public void saveMedicalRecord(MedicalRecord record) {
        medicalRecords.put(record.getId(), record);
    }

    public Optional<MedicalRecord> findMedicalRecordById(String id) {
        return Optional.ofNullable(medicalRecords.get(id));
    }

    public List<MedicalRecord> findMedicalRecordByPatientId(String patientId) {
        return medicalRecords.values().stream()
                .filter(record -> record.getPatientId().equals(patientId))
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<MedicalRecord> findMedicalRecordsByPatientIdAndCategory(String patientId, String category) {
        return medicalRecords.values().stream()
                .filter(record -> record.getPatientId().equals(patientId) &&
                        category.equals(record.getCategory()))
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void deleteMedicalRecord(String id) {
        medicalRecords.remove(id);
    }

    //Prescription operation
    public void savePrescription(Prescription prescription) {
        prescriptions.put(prescription.getId(), prescription);
    }

    public Optional<Prescription> findPrescriptionById(String id) {
        return Optional.ofNullable(prescriptions.get(id));
    }

    public List<Prescription> findPrescriptionsByPatientId(String patientId) {
        return prescriptions.values().stream()
                .filter(prescription -> prescription.getPatientId().equals(patientId))
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void deletePrescription(String id) {
        prescriptions.remove(id);
    }

    // Lab Result Operation
    public void saveLabResult(LabResult labResult) {
        labResults.put(labResult.getId(), labResult);
    }

    public Optional<LabResult> findLabResultById(String id) {
        return Optional.ofNullable(labResults.get(id));
    }

    public List<LabResult> findLabResultsByPatientId(String patientId) {
        return labResults.values().stream()
                .filter(labResult -> labResult.getPatientId().equals(patientId))
                .sorted((l1, l2) -> l2.getCreatedAt().compareTo(l1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void deleteLabResult(String id) {
        labResults.remove(id);
    }
}
