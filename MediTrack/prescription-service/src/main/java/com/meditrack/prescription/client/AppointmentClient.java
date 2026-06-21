package com.meditrack.prescription.client;

import com.meditrack.prescription.config.FeignConfig;
import com.meditrack.prescription.dto.AppointmentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "appointment-service", configuration = FeignConfig.class)
public interface AppointmentClient {

    @GetMapping("/appointments/{id}")
    AppointmentResponse getAppointmentById(@PathVariable Long id);

    @PutMapping("/appointments/complete/{id}")
    AppointmentResponse completeAppointment(@PathVariable Long id);
}