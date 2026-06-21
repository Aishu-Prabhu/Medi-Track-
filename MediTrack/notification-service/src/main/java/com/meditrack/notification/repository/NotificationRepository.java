package com.meditrack.notification.repository;

import com.meditrack.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // PATIENT
    List<Notification>
    findByPatientIdOrderByCreatedAtDesc(
            Long patientId
    );

    long countByPatientIdAndIsReadFalse(
            Long patientId
    );

    // DOCTOR 
    List<Notification>
    findByDoctorIdOrderByCreatedAtDesc(
            Long doctorId
    );

    long countByDoctorIdAndIsReadFalse(
            Long doctorId
    );
}