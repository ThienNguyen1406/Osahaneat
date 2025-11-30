package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    // Lấy tất cả tin nhắn giữa 2 user
    @Query("SELECT m FROM messages m WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) ORDER BY m.createDate ASC")
    List<Message> findConversation(@Param("userId1") int userId1, @Param("userId2") int userId2);
    
    // Lấy danh sách conversations (người mà user đã nhắn tin)
    // Sử dụng 2 query riêng biệt vì Hibernate không hỗ trợ CASE WHEN với entity trong JPQL
    @Query("SELECT DISTINCT m.receiver FROM messages m WHERE m.sender.id = :userId")
    List<com.example.food_delivery.domain.entity.Users> findReceiversBySender(@Param("userId") int userId);
    
    @Query("SELECT DISTINCT m.sender FROM messages m WHERE m.receiver.id = :userId")
    List<com.example.food_delivery.domain.entity.Users> findSendersByReceiver(@Param("userId") int userId);
    
    // Lấy tin nhắn cuối cùng của mỗi conversation
    // Sử dụng cách đơn giản hơn: lấy tất cả messages, sau đó xử lý trong service
    @Query("SELECT m FROM messages m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.createDate DESC")
    List<Message> findAllMessagesByUser(@Param("userId") int userId);
    
    // Đếm số tin nhắn chưa đọc
    long countByReceiverIdAndIsReadFalse(int receiverId);
    
    // Đánh dấu tất cả tin nhắn trong conversation là đã đọc
    @Modifying
    @Transactional
    @Query("UPDATE messages m SET m.isRead = true WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) OR (m.sender.id = :userId2 AND m.receiver.id = :userId1)")
    void markConversationAsRead(@Param("userId1") int userId1, @Param("userId2") int userId2);
}

