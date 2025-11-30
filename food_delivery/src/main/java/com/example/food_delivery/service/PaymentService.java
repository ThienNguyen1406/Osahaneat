package com.example.food_delivery.service;

import com.example.food_delivery.dto.request.PaymentRequest;
import com.example.food_delivery.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
    PaymentResponse processCOD(PaymentRequest request);
    PaymentResponse processCreditCard(PaymentRequest request);
    PaymentResponse processBankTransfer(PaymentRequest request);
}

