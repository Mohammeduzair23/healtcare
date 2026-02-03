package com.medicare.hub.controller;

import com.medicare.hub.dto.ApiResponse;
import com.medicare.hub.dto.AppointmentRequest;
import com.medicare.hub.model.*;
import com.medicare.hub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @PostMapping("/patient/{patientId}/appointments/request")
    public ResponseEntity<?> requestAppointment(
            @PathVariable String patientId,
            @RequestBody AppointmentRequest request) {

        log.info("📅 Appointment request from patient: {} to doctor: {}", patientId, request.getDoctorId());

        try {
            Optional<User> patientOpt = userRepository.findById(patientId);
            if (patientOpt.isEmpty() || !patientOpt.get().getRole().equals("Patient")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid patient ID"));
            }

            Optional<User> doctorOpt = userRepository.findById(request.getDoctorId());
            if (doctorOpt.isEmpty() || !doctorOpt.get().getRole().equals("Doctor")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid doctor ID"));
            }

            Appointment appointment = new Appointment();
            appointment.setId(UUID.randomUUID().toString());
            appointment.setPatientId(patientId);
            appointment.setDoctorId(request.getDoctorId());
            appointment.setAppointmentDate(request.getAppointmentDate());
            appointment.setAppointmentTime(request.getAppointmentTime());
            appointment.setType(request.getType());
            appointment.setReason(request.getReason());
            appointment.setStatus("pending");
            appointment.setCreatedAt(LocalDateTime.now());
            appointment.setUpdatedAt(LocalDateTime.now());

            appointmentRepository.save(appointment);

            log.info("✅ Appointment created: {}", appointment.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Appointment request sent successfully",
                            "appointmentId", appointment.getId()
                    ));

        } catch (Exception e) {
            log.error("❌ Appointment request error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to request appointment: " + e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}/appointments")
    public ResponseEntity<?> getPatientAppointments(@PathVariable String patientId) {
        log.info("📋 Fetching appointments for patient: {}", patientId);

        try {
            List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByCreatedAtDesc(patientId);

            List<Map<String, Object>> enrichedAppointments = appointments.stream()
                    .map(apt -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", apt.getId());
                        map.put("appointmentDate", apt.getAppointmentDate());
                        map.put("appointmentTime", apt.getAppointmentTime());
                        map.put("status", apt.getStatus());
                        map.put("type", apt.getType());
                        map.put("reason", apt.getReason());
                        map.put("notes", apt.getNotes());

                        userRepository.findById(apt.getDoctorId()).ifPresent(doctor -> {
                            map.put("doctorName", doctor.getName());
                        });

                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", enrichedAppointments.size(),
                    "appointments", enrichedAppointments
            ));

        } catch (Exception e) {
            log.error("❌ Error fetching patient appointments:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch appointments"));
        }
    }

    @GetMapping("/doctor/{doctorId}/appointments/today")
    public ResponseEntity<?> getDoctorTodayAppointments(@PathVariable String doctorId) {
        log.info("📅 Fetching today's appointments for doctor: {}", doctorId);

        try {
            LocalDate today = LocalDate.now();

            List<Appointment> allAppointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateAsc(doctorId);
            List<Appointment> todayAppointments = allAppointments.stream()
                    .filter(apt -> apt.getAppointmentDate().equals(today))
                    .filter(apt -> apt.getStatus().equals("accepted"))
                    .collect(Collectors.toList());

            List<Map<String, Object>> enrichedAppointments = enrichAppointmentsWithPatientInfo(todayAppointments);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", enrichedAppointments.size(),
                    "appointments", enrichedAppointments
            ));

        } catch (Exception e) {
            log.error("❌ Error fetching today's appointments:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch appointments"));
        }
    }

    @GetMapping("/doctor/{doctorId}/appointments/upcoming")
    public ResponseEntity<?> getDoctorUpcomingAppointments(@PathVariable String doctorId) {
        log.info("📋 Fetching upcoming appointments for doctor: {}", doctorId);

        try {
            LocalDate today = LocalDate.now();

            List<Appointment> allAppointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateAsc(doctorId);
            List<Appointment> upcomingAppointments = allAppointments.stream()
                    .filter(apt -> apt.getAppointmentDate().isAfter(today) || apt.getAppointmentDate().equals(today))
                    .filter(apt -> !apt.getStatus().equals("rejected") && !apt.getStatus().equals("completed"))
                    .limit(10)
                    .collect(Collectors.toList());

            List<Map<String, Object>> enrichedAppointments = enrichAppointmentsWithPatientInfo(upcomingAppointments);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", enrichedAppointments.size(),
                    "appointments", enrichedAppointments
            ));

        } catch (Exception e) {
            log.error("❌ Error fetching upcoming appointments:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch appointments"));
        }
    }

    @PutMapping("/doctor/{doctorId}/appointments/{appointmentId}/accept")
    public ResponseEntity<?> acceptAppointment(
            @PathVariable String doctorId,
            @PathVariable String appointmentId) {

        log.info("✅ Doctor {} accepting appointment: {}", doctorId, appointmentId);

        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (appointmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Appointment not found"));
            }

            Appointment appointment = appointmentOpt.get();

            if (!appointment.getDoctorId().equals(doctorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Not authorized to accept this appointment"));
            }

            appointment.setStatus("accepted");
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(appointment);

            log.info("✅ Appointment accepted successfully");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment accepted successfully"
            ));

        } catch (Exception e) {
            log.error("❌ Error accepting appointment:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to accept appointment"));
        }
    }

    @PutMapping("/doctor/{doctorId}/appointments/{appointmentId}/reject")
    public ResponseEntity<?> rejectAppointment(
            @PathVariable String doctorId,
            @PathVariable String appointmentId) {

        log.info("❌ Doctor {} rejecting appointment: {}", doctorId, appointmentId);

        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (appointmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Appointment not found"));
            }

            Appointment appointment = appointmentOpt.get();

            if (!appointment.getDoctorId().equals(doctorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Not authorized to reject this appointment"));
            }

            appointment.setStatus("rejected");
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(appointment);

            log.info("❌ Appointment rejected");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment rejected"
            ));

        } catch (Exception e) {
            log.error("❌ Error rejecting appointment:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to reject appointment"));
        }
    }

    @PutMapping("/doctor/{doctorId}/appointments/{appointmentId}/complete")
    public ResponseEntity<?> completeAppointment(
            @PathVariable String doctorId,
            @PathVariable String appointmentId) {

        log.info("✓ Doctor {} marking appointment as completed: {}", doctorId, appointmentId);

        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (appointmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Appointment not found"));
            }

            Appointment appointment = appointmentOpt.get();

            if (!appointment.getDoctorId().equals(doctorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Not authorized to complete this appointment"));
            }

            // Mark as completed
            appointment.setStatus("completed");
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(appointment);

            log.info("✓ Appointment marked as completed");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment completed successfully"
            ));

        } catch (Exception e) {
            log.error("❌ Error completing appointment:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to complete appointment"));
        }
    }

    private List<Map<String, Object>> enrichAppointmentsWithPatientInfo(List<Appointment> appointments) {
        return appointments.stream()
                .map(apt -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", apt.getId());
                    map.put("appointmentDate", apt.getAppointmentDate());
                    map.put("time", apt.getAppointmentTime().toString());
                    map.put("period", apt.getAppointmentTime().getHour() < 12 ? "AM" : "PM");
                    map.put("status", apt.getStatus());
                    map.put("type", apt.getType());
                    map.put("reason", apt.getReason());

                    userRepository.findById(apt.getPatientId()).ifPresent(patient -> {
                        map.put("patientName", patient.getName());
                        map.put("patientId", patient.getId());
                    });

                    return map;
                })
                .collect(Collectors.toList());
    }
}