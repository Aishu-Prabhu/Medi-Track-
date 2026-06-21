package com.meditrack.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import com.meditrack.payment.config.FeignConfig;

@FeignClient(name = "appointment-service", configuration = FeignConfig.class)
public interface AppointmentClient {

    @PutMapping("/appointments/payment-success/{id}")
    void markPaymentSuccess(@PathVariable Long id);
}