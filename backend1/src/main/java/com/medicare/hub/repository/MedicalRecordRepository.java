package com.medicare.hub.repository;

import com.medicare.hub.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, String> {
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(String patientId);
    List<MedicalRecord> findByPatientIdAndCategoryOrderByCreatedAtDesc(String patientId, String category);
}
