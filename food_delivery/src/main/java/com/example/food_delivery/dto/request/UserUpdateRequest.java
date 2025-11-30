package com.example.food_delivery.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class UserUpdateRequest {
    String password;
    String fullname;
    String phoneNumber;
    String email;
    String avatar;
    String address;
    List<String> roles;
}
