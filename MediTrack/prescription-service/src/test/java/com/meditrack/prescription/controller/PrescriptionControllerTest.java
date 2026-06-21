package com.meditrack.prescription.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meditrack.prescription.dto.PrescriptionUpdateRequest;
import com.meditrack.prescription.entity.Prescription;
import com.meditrack.prescription.service.PrescriptionService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PrescriptionController.class)
@AutoConfigureMockMvc(addFilters = false)
class PrescriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PrescriptionService service;

    @Autowired
    private ObjectMapper objectMapper;

    private Prescription getPrescription() {

        Prescription p = new Prescription();
        p.setId(1L);
        p.setAppointmentId(10L);
        p.setPatientId(100L);
        p.setDoctorId(200L);
        p.setDiagnosis("Fever");
        p.setMedicines("Paracetamol");
        p.setPatientName("Aishu");
        p.setDoctorName("Doc");
        p.setFollowUpDate(LocalDate.now().plusDays(5));
        p.setPrescriptionDate(LocalDate.now());

        return p;
    }

    // Add prescription
    @Test
    void testAddPrescription() throws Exception {

        when(service.addPrescription(any()))
                .thenReturn(getPrescription());

        mockMvc.perform(post("/prescriptions/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(getPrescription())))
                .andExpect(status().isOk());
    }

    // Get by id
    @Test
    void testGetById() throws Exception {

        when(service.getPrescriptionById(1L))
                .thenReturn(getPrescription());

        mockMvc.perform(get("/prescriptions/1"))
                .andExpect(status().isOk());
    }

    // Get by patient
    @Test
    void testGetByPatient() throws Exception {

        when(service.getPrescriptionsByPatient(1L))
                .thenReturn(List.of(getPrescription()));

        mockMvc.perform(get("/prescriptions/patient/1"))
                .andExpect(status().isOk());
    }

    // Update

 // Replace ONLY testUpdate() in PrescriptionControllerTest.java

    @Test
    void testUpdate() throws Exception {

        PrescriptionUpdateRequest req =
                new PrescriptionUpdateRequest();

        req.setDiagnosis("Common Cold");
        req.setMedicines("Paracetamol");
        req.setNotes("Take rest");
        req.setFollowUpDate(LocalDate.now().plusDays(7));

        Prescription updated = getPrescription();
        updated.setDiagnosis("Common Cold");
        updated.setMedicines("Paracetamol");
        updated.setNotes("Take rest");
        updated.setFollowUpDate(LocalDate.now().plusDays(7));

        when(service.updatePrescription(eq(1L), any()))
                .thenReturn(updated);

        mockMvc.perform(put("/prescriptions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.diagnosis")
                        .value("Common Cold"));
    }
}