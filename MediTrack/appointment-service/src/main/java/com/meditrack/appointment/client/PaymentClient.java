package com.meditrack.appointment.client;

import com.meditrack.appointment.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "payment-service", configuration = FeignConfig.class)
public interface PaymentClient {

    // Triggers refund for payments linked to this appointmentId
    @PostMapping("/payments/refund/{appointmentId}")
    void refundPayment(@PathVariable Long appointmentId);
}