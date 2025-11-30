package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Notification;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.reponsitory.NotificationRepository;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.service.imp.NotificationServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService implements NotificationServiceImp {

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    UserReponsitory userRepository;

    @Override
    public Notification createNotification(int userId, String title, String content, String type, String link) {
        try {
            Optional<Users> userOptional = userRepository.findById(userId);
            if (!userOptional.isPresent()) {
                System.err.println("User not found: " + userId);
                return null;
            }

            Users user = userOptional.get();
            if (user != null) {
                Notification notification = Notification.builder()
                        .users(user)
                        .title(title)
                        .content(content)
                        .type(type != null ? type : "SYSTEM")
                        .isRead(false)
                        .createDate(new Date())
                        .link(link)
                        .build();

                return notificationRepository.save(notification);
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error creating notification: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<Notification> getUserNotifications(int userId) {
        try {
            return notificationRepository.findByUsersIdOrderByCreateDateDesc(userId);
        } catch (Exception e) {
            System.err.println("Error getting user notifications: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Notification> getUnreadNotifications(int userId) {
        try {
            return notificationRepository.findByUsersIdAndIsReadOrderByCreateDateDesc(userId, false);
        } catch (Exception e) {
            System.err.println("Error getting unread notifications: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public long getUnreadCount(int userId) {
        try {
            return notificationRepository.countByUsersIdAndIsRead(userId, false);
        } catch (Exception e) {
            System.err.println("Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public boolean markAsRead(int notificationId, int userId) {
        try {
            Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
            if (notificationOptional.isPresent()) {
                Notification notification = notificationOptional.get();
                // Verify ownership
                if (notification.getUsers() != null && notification.getUsers().getId() == userId) {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean markAllAsRead(int userId) {
        try {
            List<Notification> unreadNotifications = getUnreadNotifications(userId);
            if (unreadNotifications != null && !unreadNotifications.isEmpty()) {
                for (Notification notification : unreadNotifications) {
                    if (notification != null) {
                        notification.setRead(true);
                    }
                }
                notificationRepository.saveAll(unreadNotifications);
            }
            return true;
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean deleteNotification(int notificationId, int userId) {
        try {
            Optional<Notification> notificationOptional = notificationRepository.findById(notificationId);
            if (notificationOptional.isPresent()) {
                Notification notification = notificationOptional.get();
                // Verify ownership
                if (notification.getUsers() != null && notification.getUsers().getId() == userId) {
                    notificationRepository.delete(notification);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error deleting notification: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<Notification> getAllNotifications() {
        try {
            return notificationRepository.findAllByOrderByCreateDateDesc();
        } catch (Exception e) {
            System.err.println("Error getting all notifications: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public Notification createSystemNotification(String title, String content, String link) {
        try {
            // System notification - send to all users
            // For now, return null - need to implement broadcast to all users
            // This can be enhanced to send to all users
            System.out.println("System notification: " + title);
            return null;
        } catch (Exception e) {
            System.err.println("Error creating system notification: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}

