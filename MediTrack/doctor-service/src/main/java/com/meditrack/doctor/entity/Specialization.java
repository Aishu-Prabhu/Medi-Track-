package com.meditrack.doctor.entity;

public enum Specialization {

    CARDIOLOGIST(1000),
    DERMATOLOGIST(700),
    ORTHOPEDIC(800),
    NEUROLOGIST(1200),
    ONCOLOGIST(1500),
    PEDIATRICIAN(600),
    GENERAL_PHYSICIAN(500);

    private final double consultationFee;

    Specialization(double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public double getConsultationFee() {
        return consultationFee;
    }
}