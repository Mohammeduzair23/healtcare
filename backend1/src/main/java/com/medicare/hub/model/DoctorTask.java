package com.medicare.hub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "doctor_tasks")
public class DoctorTask {
    @Id
    private String id;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date", length = 50)
    private String dueDate;

    private Boolean completed;

    private String priority;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (completed == null) {
            completed = false;
        }
        if (priority == null) {
            priority = "medium";
        }
    }
}
