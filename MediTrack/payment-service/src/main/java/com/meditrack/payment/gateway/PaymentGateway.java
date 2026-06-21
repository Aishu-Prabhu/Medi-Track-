package com.meditrack.payment.gateway;

public interface PaymentGateway {
    String createOrder(Double amount, Long appointmentId) throws Exception;
}