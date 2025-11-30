package com.example.food_delivery.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodRequest {
    private String type; // "CREDIT_CARD", "DEBIT_CARD", "BANK_ACCOUNT", "COD"
    private String cardNumber; // Full card number (will be masked when saved)
    private String cardHolderName;
    private Integer expiryMonth;
    private Integer expiryYear;
    private String cardBrand; // "VISA", "MASTERCARD", "AMEX", etc.
    private String stripePaymentMethodId; // Stripe PaymentMethod ID (pm_xxx)
    private Boolean isDefault; // true if this should be the default payment method
}

