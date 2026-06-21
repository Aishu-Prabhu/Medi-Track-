package com.meditrack.doctor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meditrack.doctor.dto.DoctorRequest;
import com.meditrack.doctor.dto.DoctorResponse;
import com.meditrack.doctor.entity.Specialization;
import com.meditrack.doctor.exception.GlobalExceptionHandler;
import com.meditrack.doctor.exception.ResourceNotFoundException;
import com.meditrack.doctor.service.DoctorService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DoctorController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class DoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorService doctorService;

    @Autowired
    private ObjectMapper objectMapper;

    private DoctorResponse getResponse() {
        return DoctorResponse.builder()
                .id(1L)
                .name("Dr A")
                .email("a@test.com")
                .specialization(Specialization.CARDIOLOGIST)
                .available(true)
                .build();
    }

    private DoctorRequest getRequest() {
        DoctorRequest req = new DoctorRequest();
        req.setName("Dr A");
        req.setEmail("a@test.com");
        req.setPhone("9876543210");          
        req.setQualification("MBBS");        
        req.setExperience(5);                
        req.setSpecialization(Specialization.CARDIOLOGIST);
        return req;
    }

    //ADD
    @Test
    void testAddDoctor() throws Exception {

        when(doctorService.addDoctor(any())).thenReturn(getResponse());

        mockMvc.perform(post("/doctors/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(getRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dr A"));
    }

    //GET BY ID
    @Test
    void testGetDoctorById() throws Exception {

        when(doctorService.getDoctorById(1L)).thenReturn(getResponse());

        mockMvc.perform(get("/doctors/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    //NOT FOUND
    @Test
    void testGetDoctorById_NotFound() throws Exception {

        when(doctorService.getDoctorById(1L))
                .thenThrow(new ResourceNotFoundException("Doctor not found"));

        mockMvc.perform(get("/doctors/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Doctor not found"));
    }

    //GET ALL
    @Test
    void testGetAllDoctors() throws Exception {

        when(doctorService.getAllDoctors())
                .thenReturn(List.of(getResponse()));

        mockMvc.perform(get("/doctors/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Dr A"));
    }

    //GET AVAILABLE
    @Test
    void testGetAvailableDoctors() throws Exception {

        when(doctorService.getAvailableDoctors())
                .thenReturn(List.of(getResponse()));

        mockMvc.perform(get("/doctors/available"))
                .andExpect(status().isOk());
    }

    //GET BY SPECIALIZATION (ENUM)
    @Test
    void testGetBySpecialization() throws Exception {

        when(doctorService.getDoctorsBySpecialization(Specialization.CARDIOLOGIST))
                .thenReturn(List.of(getResponse()));

        mockMvc.perform(get("/doctors/specialization/CARDIOLOGIST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].specialization").value("CARDIOLOGIST"));
    }

    //UPDATE
    @Test
    void testUpdateDoctor() throws Exception {

        when(doctorService.updateDoctor(eq(1L), any()))
                .thenReturn(getResponse());

        mockMvc.perform(put("/doctors/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(getRequest())))
                .andExpect(status().isOk());
    }

    // DELETE
    @Test
    void testDeleteDoctor() throws Exception {

        when(doctorService.deleteDoctor(1L))
                .thenReturn("Doctor deleted successfully");

        mockMvc.perform(delete("/doctors/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Doctor deleted successfully")); // ✅ add this
    }

    // TOGGLE
    @Test
    void testToggleAvailability() throws Exception {

        DoctorResponse res = getResponse();
        res.setAvailable(false);

        when(doctorService.toggleAvailability(1L))
                .thenReturn(res);

        mockMvc.perform(put("/doctors/toggle-availability/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }
}