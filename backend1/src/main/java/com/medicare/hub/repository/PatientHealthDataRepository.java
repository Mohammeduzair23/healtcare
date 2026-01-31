package com.medicare.hub.repository;

import com.medicare.hub.model.PatientHealthData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientHealthDataRepository extends JpaRepository<PatientHealthData, String> {
    Optional<PatientHealthData> findByPatientId(String patientId);
}
