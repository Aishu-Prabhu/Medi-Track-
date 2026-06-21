package com.meditrack.doctor.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    private Specialization specialization;

    private Integer experience;

    private String qualification;
    
    private Double consultationFee;
    
    @Column(nullable=false)
    private String hospital;

    private Boolean available = true;

    @Enumerated(EnumType.STRING)
    private Role role;
}