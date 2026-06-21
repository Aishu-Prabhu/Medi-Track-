package com.meditrack.appointment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.meditrack.appointment.config.FeignConfig;
import com.meditrack.appointment.dto.PatientResponse;

@FeignClient(name="patient-service", configuration = FeignConfig.class)
public interface PatientClient {
	
	@GetMapping("/patients/{id}")
	public PatientResponse getPatientById(@PathVariable Long id);
	@GetMapping("/patients/email/{email}")
	PatientResponse getPatientByEmail(@PathVariable String email);

}
