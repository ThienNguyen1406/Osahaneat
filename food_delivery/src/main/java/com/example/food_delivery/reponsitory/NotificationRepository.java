package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUsersIdOrderByCreateDateDesc(int userId);
    
    List<Notification> findByUsersIdAndIsReadOrderByCreateDateDesc(int userId, boolean isRead);
    
    long countByUsersIdAndIsRead(int userId, boolean isRead);
    
    List<Notification> findAllByOrderByCreateDateDesc();
}

