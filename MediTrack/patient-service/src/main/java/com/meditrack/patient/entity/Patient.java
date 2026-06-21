package com.meditrack.patient.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Data
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(
        regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
        message = "Please enter a valid email address (example: user@gmail.com)"
    )
    @Column(unique = true)
    private String email;
    
    @NotBlank(message = "Phone cannot be empty")
    @Pattern(regexp = "^\\d{10}$",
             message = "Phone must be exactly 10 digits")
    private String phone;

    @Min(value = 1, message = "Age must be greater than 0")
    @Max(value = 120, message = "Age cannot be more than 120")
    private int age;

    @NotBlank(message = "Blood group cannot be empty")
    @Pattern(regexp = "A\\+|A-|B\\+|B-|O\\+|O-|AB\\+|AB-",
             message = "Blood group must be A+, A-, B+, B-, O+, O-, AB+ or AB-")
    private String bloodGroup;

    @NotBlank(message = "Address cannot be empty")
    private String address;

    private String medicalHistory;
    
    @Pattern(regexp = "PATIENT", message = "Role must be PATIENT only")
    private String role;

    
}