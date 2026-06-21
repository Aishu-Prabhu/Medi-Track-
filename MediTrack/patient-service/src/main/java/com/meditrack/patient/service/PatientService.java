package com.meditrack.patient.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.meditrack.patient.dto.PatientRequest;
import com.meditrack.patient.dto.PatientResponse;
import com.meditrack.patient.entity.Patient;
import com.meditrack.patient.exception.AccessDeniedException;
import com.meditrack.patient.exception.DuplicateResourceException;
import com.meditrack.patient.exception.ResourceNotFoundException;
import com.meditrack.patient.repository.PatientRepository;

@Service
public class PatientService {

    private static final Logger log =
            LoggerFactory.getLogger(PatientService.class);

    private final PatientRepository repo;

    public PatientService(PatientRepository repo) {
        this.repo = repo;
    }

    // =====================================================
    // SECURITY HELPERS
    // =====================================================

    private Authentication getAuth() {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            log.error("No authenticated user found");
            throw new AccessDeniedException("User not authenticated");
        }

        return auth;
    }

    private String getEmail() {
        return getAuth().getName();
    }

    private String getRole() {
        return getAuth().getAuthorities()
                .iterator()
                .next()
                .getAuthority();
    }

    private boolean isAdmin() {
        String role = getRole();
        return role.equals("ROLE_ADMIN")
                || role.equals("ROLE_SUPER_ADMIN");
    }

    // =====================================================
    // ADD PATIENT
    // =====================================================

    public Patient addPatient(Patient patient) {

        String email = getEmail();
        String role = getRole();

        log.info("Add patient request by {} with role {}", email, role);

        // PATIENT can create only own profile
        if (role.equals("ROLE_PATIENT")) {
            patient.setEmail(email);
        }

        repo.findByEmail(patient.getEmail()).ifPresent(existing -> {

            log.warn("Duplicate patient email found: {}",
                    patient.getEmail());

            if (role.equals("ROLE_PATIENT")) {
                throw new DuplicateResourceException(
                        "You are already registered."
                );
            }

            throw new DuplicateResourceException(
                    "Email already registered: "
                            + patient.getEmail()
            );
        });

        Patient saved = repo.save(patient);

        log.info("Patient created successfully id={}",
                saved.getId());

        return saved;
    }

    // =====================================================
    // GET PATIENT BY ID
    // =====================================================

    public Patient getPatientById(Long id) {

        log.info("Fetching patient by id {}", id);

        Patient patient = repo.findById(id)
                .orElseThrow(() -> {
                    log.error("Patient not found id={}", id);
                    return new ResourceNotFoundException(
                            "Patient not found with id: " + id
                    );
                });

        String email = getEmail();
        String role = getRole();

        log.info("Access requested by {} role={}", email, role);

        // ADMIN / SUPER_ADMIN / DOCTOR can view
        if (role.equals("ROLE_ADMIN")
                || role.equals("ROLE_SUPER_ADMIN")
                || role.equals("ROLE_DOCTOR")) {

            return patient;
        }

        // PATIENT only own record
        if (!patient.getEmail().equals(email)) {
            log.warn("Unauthorized patient access");
            throw new AccessDeniedException(
                    "You can only view your own details"
            );
        }

        return patient;
    }

    // =====================================================
    // GET ALL PATIENTS
    // =====================================================

    public List<Patient> getAllPatients() {

        String email = getEmail();
        String role = getRole();

        log.info("Get all patients request by {} role={}",
                email, role);

        if (!isAdmin()) {
            log.error("Access denied for {}", role);
            throw new AccessDeniedException(
                    "Only ADMIN / SUPER_ADMIN can access all patients"
            );
        }

        List<Patient> list = repo.findAll();

        log.info("Total patients fetched = {}", list.size());

        return list;
    }

    // =====================================================
    // UPDATE PATIENT
    // =====================================================

    public Patient updatePatient(Long id,
                                 Patient updatedPatient) {

        log.info("Update patient request id={}", id);

        Patient existing = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found with id: " + id
                        ));

        String email = getEmail();
        String role = getRole();

        // Only admin or owner
        if (!isAdmin()
                && !existing.getEmail().equals(email)) {

            throw new AccessDeniedException(
                    "You can only update your own details"
            );
        }

        // PATIENT cannot change email
        if (role.equals("ROLE_PATIENT")
                && !existing.getEmail()
                .equals(updatedPatient.getEmail())) {

            throw new AccessDeniedException(
                    "You cannot change your email"
            );
        }

        // Admin changing email check
        if (isAdmin()
                && !existing.getEmail()
                .equals(updatedPatient.getEmail())) {

            repo.findByEmail(updatedPatient.getEmail())
                    .ifPresent(p -> {
                        throw new DuplicateResourceException(
                                "Email already registered: "
                                        + updatedPatient.getEmail()
                        );
                    });
        }

        existing.setName(updatedPatient.getName());
        existing.setEmail(updatedPatient.getEmail());
        existing.setPhone(updatedPatient.getPhone());
        existing.setAge(updatedPatient.getAge());
        existing.setBloodGroup(updatedPatient.getBloodGroup());
        existing.setAddress(updatedPatient.getAddress());
        existing.setMedicalHistory(
                updatedPatient.getMedicalHistory());
        existing.setRole(updatedPatient.getRole());

        Patient saved = repo.save(existing);

        log.info("Patient updated successfully id={}", id);

        return saved;
    }

    // =====================================================
    // DELETE PATIENT
    // =====================================================

    public String deletePatient(Long id) {

        String email = getEmail();
        String role = getRole();

        log.info("Delete patient request id={} by {} role={}",
                id, email, role);

        if (!isAdmin()) {
            throw new AccessDeniedException(
                    "Only ADMIN / SUPER_ADMIN can delete patients"
            );
        }

        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Patient not found with id: " + id
            );
        }

        repo.deleteById(id);

        log.info("Patient deleted successfully id={}", id);

        return "Patient deleted successfully with id: " + id;
    }

    // =====================================================
    // UPDATE MEDICAL HISTORY
    // =====================================================

    public Patient updateMedicalHistory(Long id,
                                        String history) {

        log.info("Update medical history patient id={}", id);

        Patient existing = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found with id: " + id
                        ));

        existing.setMedicalHistory(history);

        return repo.save(existing);
    }

    // =====================================================
    // GET BY EMAIL
    // =====================================================

    public PatientResponse getPatientByEmail(String email) {

        log.info("Fetching patient by email={}", email);

        Patient patient = repo.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Patient not found"
                        ));

        PatientResponse response =
                new PatientResponse();

        response.setId(patient.getId());
        response.setName(patient.getName());
        response.setEmail(patient.getEmail());
        response.setPhone(patient.getPhone());
        response.setAge(patient.getAge());
        response.setBloodGroup(patient.getBloodGroup());
        response.setAddress(patient.getAddress());
        response.setMedicalHistory(
                patient.getMedicalHistory());
        response.setRole(patient.getRole());

        return response;
    }

    // =====================================================
    // CREATE PROFILE
    // =====================================================

    public Patient createProfile(PatientRequest request) {

        log.info("Creating profile for {}",
                request.getEmail());

        repo.findByEmail(request.getEmail())
                .ifPresent(p -> {
                    throw new DuplicateResourceException(
                            "Profile already exists"
                    );
                });

        Patient p = new Patient();

        p.setName(request.getName());
        p.setEmail(request.getEmail());
        p.setPhone(request.getPhone());
        p.setAge(request.getAge());
        p.setBloodGroup(request.getBloodGroup());
        p.setAddress(request.getAddress());
        p.setRole(request.getRole());

        Patient saved = repo.save(p);

        log.info("Profile created id={}",
                saved.getId());

        return saved;
    }
}