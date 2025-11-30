package com.example.food_delivery.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {
    private String title; // "Nhà", "Cơ quan", "Home 1", etc.
    private String address; // Full address string
    private String type; // "HOME", "OFFICE", "OTHER"
    private Boolean isDefault; // true if this should be the default address
}

