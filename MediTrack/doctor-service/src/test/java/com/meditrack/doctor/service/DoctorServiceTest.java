package com.meditrack.doctor.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import com.meditrack.doctor.dto.DoctorRequest;
import com.meditrack.doctor.dto.DoctorResponse;
import com.meditrack.doctor.entity.Doctor;
import com.meditrack.doctor.entity.Specialization;
import com.meditrack.doctor.exception.DuplicateResourceException;
import com.meditrack.doctor.exception.ResourceNotFoundException;
import com.meditrack.doctor.repository.DoctorRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class DoctorServiceTest {

    @InjectMocks
    private DoctorService doctorService;

    @Mock
    private DoctorRepository doctorRepository;

    private Doctor doctor;
    private DoctorRequest request;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        doctor = new Doctor();
        doctor.setId(1L);
        doctor.setName("Dr A");
        doctor.setEmail("a@test.com");
        doctor.setPhone("9876543210");
        doctor.setQualification("MBBS");
        doctor.setExperience(5);
        doctor.setAvailable(true);
        doctor.setSpecialization(Specialization.CARDIOLOGIST);

        request = new DoctorRequest();
        request.setName("Dr A");
        request.setEmail("a@test.com");
        request.setPhone("9876543210");
        request.setQualification("MBBS");
        request.setExperience(5);
        request.setSpecialization(Specialization.CARDIOLOGIST);
    }

    // Add doctor
    @Test
    void testAddDoctor() {
        when(doctorRepository.existsByEmail(any())).thenReturn(false);
        when(doctorRepository.save(any())).thenReturn(doctor);

        DoctorResponse result = doctorService.addDoctor(request);

        assertNotNull(result);
        assertEquals("Dr A", result.getName());
    }

    // Duplicate doctor
    @Test
    void testAddDoctor_Duplicate() {
        when(doctorRepository.existsByEmail(any())).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> doctorService.addDoctor(request));
    }

    // Get by id
    @Test
    void testGetDoctorById() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

        DoctorResponse result = doctorService.getDoctorById(1L);

        assertEquals(1L, result.getId());
    }

    // Get by id not found
    @Test
    void testGetDoctorById_NotFound() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> doctorService.getDoctorById(1L));
    }

    // Get all doctors
    @Test
    void testGetAllDoctors() {
        when(doctorRepository.findAll()).thenReturn(List.of(doctor));

        List<DoctorResponse> result = doctorService.getAllDoctors();

        assertEquals(1, result.size());
    }

    // Get available doctors
    @Test
    void testGetAvailableDoctors() {
        when(doctorRepository.findByAvailableTrue()).thenReturn(List.of(doctor));

        List<DoctorResponse> result = doctorService.getAvailableDoctors();

        assertTrue(result.get(0).getAvailable());
    }

    // Get by specialization
    @Test
    void testGetDoctorsBySpecialization() {
        when(doctorRepository.findBySpecialization(Specialization.CARDIOLOGIST))
                .thenReturn(List.of(doctor));

        List<DoctorResponse> result =
                doctorService.getDoctorsBySpecialization(
                        Specialization.CARDIOLOGIST);

        assertEquals(Specialization.CARDIOLOGIST,
                result.get(0).getSpecialization());
    }

    // Update doctor
    @Test
    void testUpdateDoctor() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorRepository.save(any())).thenReturn(doctor);

        DoctorResponse result = doctorService.updateDoctor(1L, request);

        assertEquals("Dr A", result.getName());
    }

    // Update not found
    @Test
    void testUpdateDoctor_NotFound() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> doctorService.updateDoctor(1L, request));
    }

    // Delete doctor
    @Test
    void testDeleteDoctor() {
        when(doctorRepository.existsById(1L)).thenReturn(true);

        String result = doctorService.deleteDoctor(1L);

        assertTrue(result.contains("deleted successfully"));
        verify(doctorRepository).deleteById(1L);
    }

    // Delete not found
    @Test
    void testDeleteDoctor_NotFound() {
        when(doctorRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> doctorService.deleteDoctor(1L));
    }

    // Toggle availability
    @Test
    void testToggleAvailability() {

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorRepository.save(any())).thenReturn(doctor);

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        "a@test.com",
                        null,
                        List.of(() -> "ROLE_DOCTOR"));

        SecurityContextHolder.getContext().setAuthentication(auth);

        DoctorResponse result = doctorService.toggleAvailability(1L);

        assertFalse(result.getAvailable());
    }
}