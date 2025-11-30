package com.example.food_delivery.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class MessageDTO {
    int id;
    int senderId;
    String senderName;
    String senderUserName;
    int receiverId;
    String receiverName;
    String receiverUserName;
    String content;
    boolean isRead;
    Date createDate;
}

