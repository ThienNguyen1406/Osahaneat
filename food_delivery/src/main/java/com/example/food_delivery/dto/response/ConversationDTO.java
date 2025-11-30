package com.example.food_delivery.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ConversationDTO {
    int userId;
    String userName;
    String fullName;
    String lastMessage;
    Date lastMessageDate;
    long unreadCount;
}

