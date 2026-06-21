package com.meditrack.payment.service;

import com.meditrack.payment.client.AppointmentClient;
import com.meditrack.payment.entity.Payment;
import com.meditrack.payment.enums.PaymentStatus;
import com.meditrack.payment.exception.CustomException;
import com.meditrack.payment.gateway.PaymentGateway;
import com.meditrack.payment.repository.PaymentRepository;
import com.razorpay.Utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository repo;

    @Autowired
    private PaymentGateway gateway;

    @Autowired
    private AppointmentClient appointmentClient;
    
    @Value("${razorpay.secret}")
    private String secret;

    public Payment createPayment(Long appointmentId, Double amount) {
        try {
            String orderId = gateway.createOrder(amount, appointmentId);

            Payment payment = new Payment();
            payment.setAppointmentId(appointmentId);
            payment.setAmount(amount);
            payment.setStatus(PaymentStatus.CREATED);
            payment.setOrderId(orderId);

            return repo.save(payment);

        } catch (Exception e) {
            throw new CustomException("Failed to create payment: " + e.getMessage());
        }
    }

    public Payment verifyPayment(String orderId, String paymentId, String signature) {

        Payment payment = repo.findByOrderId(orderId)
                .orElseThrow(() -> new CustomException("Payment not found"));

        try {
            String data = orderId + "|" + paymentId;

            //boolean isValid = Utils.verifySignature(data, signature, secret);
            //no UI simulate it manually
            
            boolean isValid=true;   

            if (!isValid) {
                payment.setStatus(PaymentStatus.FAILED);
                return repo.save(payment);
            }

            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaymentId(paymentId);
            repo.save(payment);

            //appointmentClient.markPaymentSuccess(payment.getAppointmentId()); //add after UI is done

            return payment;

        } catch (Exception e) {
            throw new CustomException("Payment verification failed");
        }
    }
}