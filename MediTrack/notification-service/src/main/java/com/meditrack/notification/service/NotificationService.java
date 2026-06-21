
package com.meditrack.notification.service;

import com.meditrack.notification.entity.Notification;
import com.meditrack.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(
            NotificationRepository repo
    ) {
        this.repo = repo;
    }

    // CREATE
    public Notification create(
            Notification n
    ) {
        return repo.save(n);
    }

    // PATIENT LIST
    public List<Notification> getByPatient(
            Long patientId
    ) {
        return repo
          .findByPatientIdOrderByCreatedAtDesc(
                  patientId
          );
    }

    // DOCTOR LIST 
    public List<Notification> getByDoctor(
            Long doctorId
    ) {
        return repo
          .findByDoctorIdOrderByCreatedAtDesc(
                  doctorId
          );
    }

    // PATIENT UNREAD
    public long unread(
            Long patientId
    ) {
        return repo
          .countByPatientIdAndIsReadFalse(
                  patientId
          );
    }

    // DOCTOR UNREAD 
    public long unreadDoctor(
            Long doctorId
    ) {
        return repo
          .countByDoctorIdAndIsReadFalse(
                  doctorId
          );
    }

    // MARK READ
    public void markRead(
            Long id
    ) {
        Notification n =
            repo.findById(id)
                .orElseThrow();

        n.setRead(true);

        repo.save(n);
    }
}