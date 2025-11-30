package com.example.food_delivery.service.imp;

import com.example.food_delivery.domain.entity.Message;
import com.example.food_delivery.domain.entity.Users;

import java.util.List;

public interface MessageServiceImp {
    /**
     * Gửi tin nhắn
     */
    Message sendMessage(int senderId, int receiverId, String content);
    
    /**
     * Lấy danh sách conversations (người đã nhắn tin)
     */
    List<Users> getConversations(int userId);
    
    /**
     * Lấy admin user
     */
    com.example.food_delivery.domain.entity.Users getAdminUser();
    
    /**
     * Lấy danh sách users đã chat với admin (dành cho admin)
     */
    List<com.example.food_delivery.domain.entity.Users> getUsersForAdmin(int adminId);
    
    /**
     * Lấy tin nhắn giữa 2 user
     */
    List<Message> getConversation(int userId, int otherUserId);
    
    /**
     * Lấy tin nhắn cuối cùng của mỗi conversation
     */
    List<Message> getLastMessages(int userId);
    
    /**
     * Đếm số tin nhắn chưa đọc
     */
    long getUnreadCount(int userId);
    
    /**
     * Đánh dấu conversation là đã đọc
     */
    boolean markConversationAsRead(int userId, int otherUserId);
}

