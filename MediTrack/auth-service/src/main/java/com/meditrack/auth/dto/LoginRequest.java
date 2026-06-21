package com.meditrack.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import io.swagger.v3.oas.annotations.media.Schema;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(
        regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
        message = "Email must be like user@gmail.com"
    )
    @Schema(description = "User email address",example = "user@gmail.com")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Schema(description = "User account password",example = "user@123")
    private String password;
}