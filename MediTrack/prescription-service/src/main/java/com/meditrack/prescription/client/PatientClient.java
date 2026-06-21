package com.meditrack.prescription.client;

import com.meditrack.prescription.config.FeignConfig;
import com.meditrack.prescription.dto.PatientResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "patient-service", configuration = FeignConfig.class)
public interface PatientClient {

    @GetMapping("/patients/{id}")
    PatientResponse getPatientById(@PathVariable Long id);
    
    @GetMapping("/patients/email/{email}")
    PatientResponse getPatientByEmail(@PathVariable String email);


    @PutMapping("/patients/update-history/{id}")
    PatientResponse updateMedicalHistory(
        @PathVariable Long id,
        @RequestParam String history);
}