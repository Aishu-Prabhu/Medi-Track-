package com.meditrack.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.meditrack.auth.dto.PatientRequest;
import com.meditrack.auth.config.FeignConfig;

@FeignClient(name = "patient-service", configuration = FeignConfig.class)
public interface PatientClient {

    @PostMapping("/patients/register-profile")
    void createPatient(@RequestBody PatientRequest request);
}