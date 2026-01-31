package com.medicare.hub.repository;

import com.medicare.hub.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findByPatientIdOrderByCreatedAtDesc(String patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateAsc(String doctorId);
    List<Appointment> findByDoctorIdAndStatusOrderByAppointmentDateAsc(Value.Str doctorId, String status);
}
