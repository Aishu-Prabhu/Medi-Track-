package com.meditrack.prescription.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PatientResponseTest {

    @Test
    void testGettersAndSetters() {

        PatientResponse p = new PatientResponse();

        p.setId(1L);
        p.setName("Aishu");
        p.setEmail("aishu@gmail.com");
        p.setPhone("9876543210");
        p.setAge(25);
        p.setBloodGroup("O+");
        p.setAddress("Bangalore");
        p.setMedicalHistory("No issues");

        assertEquals(1L, p.getId());
        assertEquals("Aishu", p.getName());
        assertEquals("aishu@gmail.com", p.getEmail());
        assertEquals("9876543210", p.getPhone());
        assertEquals(25, p.getAge());
        assertEquals("O+", p.getBloodGroup());
        assertEquals("Bangalore", p.getAddress());
        assertEquals("No issues", p.getMedicalHistory());
    }
}