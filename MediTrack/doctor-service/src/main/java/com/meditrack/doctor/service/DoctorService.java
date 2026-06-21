package com.meditrack.doctor.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.meditrack.doctor.dto.DoctorRequest;
import com.meditrack.doctor.dto.DoctorResponse;
import com.meditrack.doctor.entity.Doctor;
import com.meditrack.doctor.entity.Role;
import com.meditrack.doctor.entity.Specialization;
import com.meditrack.doctor.exception.BadRequestException;
import com.meditrack.doctor.exception.DuplicateResourceException;
import com.meditrack.doctor.exception.ResourceNotFoundException;
import com.meditrack.doctor.repository.DoctorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);

    private final DoctorRepository repo;


    //ADD DOCTOR
    public DoctorResponse addDoctor(DoctorRequest dto) {

        log.info("Adding new doctor: {}", dto.getEmail());

        if (repo.existsByEmail(dto.getEmail())) {
            log.error("Duplicate email detected: {}", dto.getEmail());
            throw new DuplicateResourceException("Doctor with this email already exists");
        }

        Doctor doctor = new Doctor();

        doctor.setName(dto.getName());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setExperience(dto.getExperience());
        doctor.setQualification(dto.getQualification());
        doctor.setConsultationFee(dto.getSpecialization().getConsultationFee());

        doctor.setRole(Role.ROLE_DOCTOR);
        doctor.setHospital("Medicare Hospital");
        doctor.setAvailable(true);

        return mapToDTO(repo.save(doctor));
    }

    //GET BY ID
    public DoctorResponse getDoctorById(Long id) {

        log.info("Fetching doctor with id: {}", id);

        Doctor doctor = repo.findById(id)
                .orElseThrow(() -> {
                    log.error("Doctor not found with id: {}", id);
                    return new ResourceNotFoundException("Doctor not found with id: " + id);
                });

        return mapToDTO(doctor);
    }

    //GET ALL
    public List<DoctorResponse> getAllDoctors() {

        log.info("Fetching all doctors");

        return repo.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    //GET AVAILABLE
    public List<DoctorResponse> getAvailableDoctors() {

        log.info("Fetching available doctors");

        return repo.findByAvailableTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    //GET BY SPECIALIZATION
    public List<DoctorResponse> getDoctorsBySpecialization(
            Specialization specialization) {

        log.info(
            "Fetching doctors by specialization: {}",
            specialization
        );

        List<Doctor> doctors =
                repo.findBySpecialization(specialization);

        return doctors.stream()
                .map(this::mapToDTO)
                .toList();
    }

    //UPDATE
    public DoctorResponse updateDoctor(Long id, DoctorRequest dto) {

        log.info("Updating doctor with id: {}", id);

        Doctor existing = repo.findById(id)
                .orElseThrow(() -> {
                    log.error("Doctor not found for update: {}", id);
                    return new ResourceNotFoundException("Doctor not found with id: " + id);
                });

        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setSpecialization(dto.getSpecialization());
        existing.setExperience(dto.getExperience());
        existing.setQualification(dto.getQualification());
        existing.setConsultationFee(
                dto.getSpecialization().getConsultationFee()
        );

        return mapToDTO(repo.save(existing));
    }

    //DELETE
    public String deleteDoctor(Long id) {

        log.info("Deleting doctor with id: {}", id);

        if (!repo.existsById(id)) {
            log.error("Doctor not found for deletion: {}", id);
            throw new ResourceNotFoundException("Doctor not found with id: " + id);
        }

        repo.deleteById(id);

        log.info("Doctor deleted successfully with id: {}", id);
        return "Doctor deleted successfully with id: " + id;
    }

    //TOGGLE AVAILABILITY
    public DoctorResponse toggleAvailability(Long id) {

        log.info("Request to toggle availability for doctor id: {}", id);

        Doctor doctor = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found with id: " + id));

        // Get logged-in user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String loggedInEmail = auth.getName();

        String role = auth.getAuthorities()
                .stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("");

        // If DOCTOR → allow only self
        if ("ROLE_DOCTOR".equals(role) && !doctor.getEmail().equals(loggedInEmail)) {
            throw new BadRequestException("You can only update your own availability");
        }

        // Toggle
        doctor.setAvailable(!doctor.getAvailable());

        return mapToDTO(repo.save(doctor));
    }
    // MAPPING
    private DoctorResponse mapToDTO(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .email(doctor.getEmail())
                .phone(doctor.getPhone())
                .specialization(doctor.getSpecialization())
                .experience(doctor.getExperience())
                .qualification(doctor.getQualification())
                .consultationFee(doctor.getConsultationFee())
                .hospital(doctor.getHospital())
                .available(doctor.getAvailable())
                .build();
    }
    public DoctorResponse getDoctorByEmail(String email) {

        Doctor doctor = repo.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Doctor not found"));

        return mapToDTO(doctor);
    }
}