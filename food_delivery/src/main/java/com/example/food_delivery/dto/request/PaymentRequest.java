package com.example.food_delivery.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class PaymentRequest {
    int userId;
    int orderId;
    String paymentMethod; // "COD", "CREDIT_CARD", "BANK_TRANSFER"
    
    // For credit card (Stripe)
    String stripeToken; // Stripe payment method token
    
    // For bank transfer
    String bankName;
    String accountNumber;
    String transactionId;
}

