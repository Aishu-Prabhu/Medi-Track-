package com.meditrack.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PatientResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Integer age;
    private String bloodGroup;
    private String address;
    private String medicalHistory;
    private String role;

    
}