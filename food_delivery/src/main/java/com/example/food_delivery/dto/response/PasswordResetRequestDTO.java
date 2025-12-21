package com.example.food_delivery.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordResetRequestDTO {
    int id;
    UserDTO user;
    Date requestDate;
    String status;
    String adminNotes;
    UserDTO processedBy;
    Date processedDate;
    String reason;
}

