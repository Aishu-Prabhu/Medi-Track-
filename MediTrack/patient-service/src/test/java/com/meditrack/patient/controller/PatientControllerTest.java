package com.meditrack.patient.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meditrack.patient.entity.Patient;
import com.meditrack.patient.exception.AccessDeniedException;
import com.meditrack.patient.exception.DuplicateResourceException;
import com.meditrack.patient.exception.ResourceNotFoundException;
import com.meditrack.patient.service.PatientService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.meditrack.patient.exception.GlobalExceptionHandler;

@WebMvcTest(PatientController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PatientService patientService;

    @Autowired
    private ObjectMapper objectMapper;

    private Patient getPatient() {
        Patient p = new Patient();
        p.setId(1L);
        p.setName("John");
        p.setEmail("john@test.com");
        p.setPhone("1234567890");
        p.setAge(25);
        p.setBloodGroup("O+");
        p.setAddress("Bangalore");
        p.setMedicalHistory("None");
        p.setRole("PATIENT");
        return p;
    }

    // Add patient
    @Test
    void testAddPatient() throws Exception {

        when(patientService.addPatient(any()))
                .thenReturn(getPatient());

        mockMvc.perform(post("/patients/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(getPatient())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John"));
    }

    // Add patient exception
    @Test
    void testAddPatient_Exception() throws Exception {

        when(patientService.addPatient(any()))
                .thenThrow(new DuplicateResourceException("Exists"));

        mockMvc.perform(post("/patients/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(getPatient())))
                .andExpect(status().isConflict());
    }

    // Get by id
    @Test
    void testGetPatientById() throws Exception {

        when(patientService.getPatientById(1L))
                .thenReturn(getPatient());

        mockMvc.perform(get("/patients/id/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // Get by id exception
    @Test
    void testGetPatientById_Exception() throws Exception {

        when(patientService.getPatientById(1L))
                .thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/patients/id/1"))
                .andExpect(status().isNotFound());
    }

    // Get all
    @Test
    void testGetAllPatients() throws Exception {

        when(patientService.getAllPatients())
                .thenReturn(List.of(getPatient()));

        mockMvc.perform(get("/patients/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("John"));
    }

    // Get all exception
    @Test
    void testGetAllPatients_Exception() throws Exception {

        when(patientService.getAllPatients())
                .thenThrow(new AccessDeniedException("Denied"));

        mockMvc.perform(get("/patients/all"))
                .andExpect(status().isForbidden());
    }

    // Update patient
    @Test
    void testUpdatePatient() throws Exception {

        Patient p = getPatient();
        p.setName("Updated");

        when(patientService.updatePatient(eq(1L), any()))
                .thenReturn(p);

        mockMvc.perform(put("/patients/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(p)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    // Update patient exception
    @Test
    void testUpdatePatient_Exception() throws Exception {

        when(patientService.updatePatient(eq(1L), any()))
                .thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(put("/patients/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(getPatient())))
                .andExpect(status().isNotFound());
    }

    // Delete patient
    @Test
    void testDeletePatient() throws Exception {

        when(patientService.deletePatient(1L))
                .thenReturn("Patient deleted successfully");

        mockMvc.perform(delete("/patients/delete/1"))
                .andExpect(status().isOk());
    }

    // Delete patient exception
    @Test
    void testDeletePatient_Exception() throws Exception {

        when(patientService.deletePatient(1L))
                .thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(delete("/patients/delete/1"))
                .andExpect(status().isNotFound());
    }

    // Update medical history
    @Test
    void testUpdateMedicalHistory() throws Exception {

        Patient p = getPatient();
        p.setMedicalHistory("Updated");

        when(patientService.updateMedicalHistory(1L, "Updated"))
                .thenReturn(p);

        mockMvc.perform(put("/patients/update-history/1")
                .param("history", "Updated"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.medicalHistory").value("Updated"));
    }

    // Update medical history exception
    @Test
    void testUpdateMedicalHistory_Exception() throws Exception {

        when(patientService.updateMedicalHistory(1L, "Updated"))
                .thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(put("/patients/update-history/1")
                .param("history", "Updated"))
                .andExpect(status().isNotFound());
    }
}