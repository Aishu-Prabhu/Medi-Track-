package com.meditrack.appointment.dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Data
@Getter
@Setter
public class DoctorResponse {

    private Long id;
    private String name;
    private String email;
    private String specialization;
    private int experience;
    private Double consultationFee;
    private String hospital;
    private boolean available;
}