package com.meditrack.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CancelRequest {
	@NotBlank(message="Reason cannot be null")
    private String reason;
}