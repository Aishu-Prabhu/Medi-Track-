package com.meditrack.patient.service;

import com.meditrack.patient.dto.PatientRequest;
import com.meditrack.patient.dto.PatientResponse;
import com.meditrack.patient.entity.Patient;
import com.meditrack.patient.exception.AccessDeniedException;
import com.meditrack.patient.exception.DuplicateResourceException;
import com.meditrack.patient.exception.ResourceNotFoundException;
import com.meditrack.patient.repository.PatientRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @InjectMocks
    private PatientService patientService;

    @Mock
    private PatientRepository repo;

    private Patient patient;

    @BeforeEach
    void setUp() {

        patient = new Patient();

        patient.setId(1L);
        patient.setName("Aishu");
        patient.setEmail("aishu@gmail.com");
        patient.setPhone("9876543210");
        patient.setAge(22);
        patient.setBloodGroup("O+");
        patient.setAddress("Bangalore");
        patient.setMedicalHistory("None");
        patient.setRole("PATIENT");
    }

    private void setAuthentication(String email, String role) {

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(() -> role)
                );

        SecurityContextHolder.getContext()
                .setAuthentication(auth);
    }

    @Test
    void testAddPatientSuccess() {

        setAuthentication(
                "aishu@gmail.com",
                "ROLE_PATIENT"
        );

        when(repo.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        when(repo.save(any(Patient.class)))
                .thenReturn(patient);

        Patient result =
                patientService.addPatient(patient);

        assertNotNull(result);

        assertEquals(
                "aishu@gmail.com",
                result.getEmail()
        );
    }

    @Test
    void testAddPatientDuplicate() {

        setAuthentication(
                "aishu@gmail.com",
                "ROLE_PATIENT"
        );

        when(repo.findByEmail(anyString()))
                .thenReturn(Optional.of(patient));

        assertThrows(
                DuplicateResourceException.class,
                () -> patientService.addPatient(patient)
        );
    }

    @Test
    void testGetPatientByIdSuccess() {

        setAuthentication(
                "admin@gmail.com",
                "ROLE_ADMIN"
        );

        when(repo.findById(1L))
                .thenReturn(Optional.of(patient));

        Patient result =
                patientService.getPatientById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void testGetPatientByIdNotFound() {

        setAuthentication(
                "admin@gmail.com",
                "ROLE_ADMIN"
        );

        when(repo.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> patientService.getPatientById(1L)
        );
    }

    @Test
    void testGetPatientByIdAccessDenied() {

        setAuthentication(
                "other@gmail.com",
                "ROLE_PATIENT"
        );

        when(repo.findById(1L))
                .thenReturn(Optional.of(patient));

        assertThrows(
                AccessDeniedException.class,
                () -> patientService.getPatientById(1L)
        );
    }

    @Test
    void testGetAllPatientsSuccess() {

        setAuthentication(
                "admin@gmail.com",
                "ROLE_ADMIN"
        );

        when(repo.findAll())
                .thenReturn(List.of(patient));

        List<Patient> list =
                patientService.getAllPatients();

        assertEquals(1, list.size());
    }

    @Test
    void testGetAllPatientsDenied() {

        setAuthentication(
                "aishu@gmail.com",
                "ROLE_PATIENT"
        );

        assertThrows(
                AccessDeniedException.class,
                () -> patientService.getAllPatients()
        );
    }

    @Test
    void testUpdatePatientSuccess() {

        setAuthentication(
                "admin@gmail.com",
                "ROLE_ADMIN"
        );

        when(repo.findById(1L))
                .thenReturn(Optional.of(patient));

        when(repo.save(any(Patient.class)))
                .thenReturn(patient);

        Patient updated =
                patientService.updatePatient(
                        1L,
                        patient
                );

        assertNotNull(updated);
    }

    @Test
    void testDeletePatientSuccess() {

        setAuthentication(
                "admin@gmail.com",
                "ROLE_ADMIN"
        );

        when(repo.existsById(1L))
                .thenReturn(true);

        String result =
                patientService.deletePatient(1L);

        assertTrue(
                result.contains("Patient deleted successfully")
        );

        verify(repo, times(1))
                .deleteById(1L);
    }

    @Test
    void testDeletePatientDenied() {

        setAuthentication(
                "aishu@gmail.com",
                "ROLE_PATIENT"
        );

        assertThrows(
                AccessDeniedException.class,
                () -> patientService.deletePatient(1L)
        );
    }

    @Test
    void testUpdateMedicalHistorySuccess() {

        setAuthentication(
                "admin@gmail.com",
                "ROLE_ADMIN"
        );

        when(repo.findById(1L))
                .thenReturn(Optional.of(patient));

        when(repo.save(any(Patient.class)))
                .thenReturn(patient);

        Patient result =
                patientService.updateMedicalHistory(
                        1L,
                        "Diabetes"
                );

        assertNotNull(result);

        verify(repo, times(1))
                .save(any(Patient.class));
    }

    @Test
    void testGetPatientByEmailSuccess() {

        when(repo.findByEmail("aishu@gmail.com"))
                .thenReturn(Optional.of(patient));

        PatientResponse response =
                patientService.getPatientByEmail(
                        "aishu@gmail.com"
                );

        assertEquals(
                "Aishu",
                response.getName()
        );
    }

    @Test
    void testCreateProfileSuccess() {

        PatientRequest request =
                new PatientRequest();

        request.setName("Aishu");
        request.setEmail("aishu@gmail.com");
        request.setPhone("9876543210");
        request.setAge(22);
        request.setBloodGroup("O+");
        request.setAddress("Bangalore");
        request.setRole("PATIENT");

        when(repo.findByEmail(request.getEmail()))
                .thenReturn(Optional.empty());

        when(repo.save(any(Patient.class)))
                .thenReturn(patient);

        Patient result =
                patientService.createProfile(request);

        assertNotNull(result);

        assertEquals(
                "Aishu",
                result.getName()
        );
    }

    @Test
    void testCreateProfileDuplicate() {

        PatientRequest request =
                new PatientRequest();

        request.setEmail("aishu@gmail.com");

        when(repo.findByEmail(request.getEmail()))
                .thenReturn(Optional.of(patient));

        assertThrows(
                DuplicateResourceException.class,
                () -> patientService.createProfile(request)
        );
    }
}