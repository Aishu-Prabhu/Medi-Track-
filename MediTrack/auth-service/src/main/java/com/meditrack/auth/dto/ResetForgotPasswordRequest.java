package com.meditrack.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetForgotPasswordRequest {
    private String email;
    private String newPassword;
}