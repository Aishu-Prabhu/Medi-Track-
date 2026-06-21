package com.meditrack.doctor.dto;

import com.meditrack.doctor.entity.Specialization;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Specialization specialization;
    private Integer experience;
    private String qualification;
    private Double consultationFee;
    private String hospital;
    private Boolean available;
}
