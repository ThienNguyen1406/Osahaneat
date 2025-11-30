package com.example.food_delivery.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class PaymentResponse {
    int orderId;
    String paymentMethod;
    String paymentStatus;
    String paymentIntentId; // For Stripe
    String transactionId; // For bank transfer
    Long amount;
    Date paymentDate;
    String message;
}

