package com.meditrack.prescription.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
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
}