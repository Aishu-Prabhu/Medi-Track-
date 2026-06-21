package com.meditrack.auth.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private final Map<String, String> otpStorage = new HashMap<>();
    private final Map<String, Boolean> verifiedStorage = new HashMap<>();
    private final Map<String, LocalDateTime> expiryStorage = new HashMap<>();

    private static final int OTP_EXPIRY_MINUTES = 5;

    public String generateOtp(String email) {

        String otp = String.valueOf(
                100000 + new Random().nextInt(900000));

        otpStorage.put(email, otp);
        verifiedStorage.put(email, false);

        expiryStorage.put(
                email,
                LocalDateTime.now()
                        .plusMinutes(OTP_EXPIRY_MINUTES)
        );

        return otp;
    }

    public boolean verifyOtp(String email, String otp) {

        String savedOtp = otpStorage.get(email);
        LocalDateTime expiry = expiryStorage.get(email);

        if (savedOtp == null || expiry == null) {
            return false;
        }

        // expired
        if (LocalDateTime.now().isAfter(expiry)) {
            clear(email);
            return false;
        }

        if (savedOtp.equals(otp)) {
            verifiedStorage.put(email, true);
            return true;
        }

        return false;
    }

    public boolean isVerified(String email) {
        return verifiedStorage.getOrDefault(email, false);
    }

    public void clear(String email) {
        otpStorage.remove(email);
        verifiedStorage.remove(email);
        expiryStorage.remove(email);
    }
}