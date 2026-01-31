package com.medicare.hub.repository;

import com.medicare.hub.model.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabResultRepository extends JpaRepository<LabResult, String> {
    List<LabResult> findByPatientIdOrderByCreatedAtDesc(String patiendId);
}
