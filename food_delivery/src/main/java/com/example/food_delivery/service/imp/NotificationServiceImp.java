package com.example.food_delivery.service.imp;

import com.example.food_delivery.domain.entity.Notification;

import java.util.List;

public interface NotificationServiceImp {
    Notification createNotification(int userId, String title, String content, String type, String link);
    
    List<Notification> getUserNotifications(int userId);
    
    List<Notification> getUnreadNotifications(int userId);
    
    long getUnreadCount(int userId);
    
    boolean markAsRead(int notificationId, int userId);
    
    boolean markAllAsRead(int userId);
    
    boolean deleteNotification(int notificationId, int userId);
    
    // Admin methods
    List<Notification> getAllNotifications();
    
    Notification createSystemNotification(String title, String content, String link);
}

