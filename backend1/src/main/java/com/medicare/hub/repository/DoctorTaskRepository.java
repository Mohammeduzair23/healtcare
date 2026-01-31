package com.medicare.hub.repository;

import com.medicare.hub.model.DoctorTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorTaskRepository extends JpaRepository<DoctorTask, String> {
    List<DoctorTask> findByDoctorIdOrderByCompletedAscCreatedAtDesc(String doctorId);
}
