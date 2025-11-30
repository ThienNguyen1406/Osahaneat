package com.example.food_delivery.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RestaurantRequest {
    String title;
    String sub_title;
    String description;
    boolean is_freeship;
    String address;
    String open_time;

}
