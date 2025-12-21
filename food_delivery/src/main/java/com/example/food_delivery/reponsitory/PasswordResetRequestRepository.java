package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.PasswordResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Integer> {
    
    // Find all pending requests
    List<PasswordResetRequest> findByStatusOrderByRequestDateDesc(String status);
    
    // Find requests by user
    List<PasswordResetRequest> findByUserIdOrderByRequestDateDesc(int userId);
    
    // Find latest pending request for a user
    @Query("SELECT prr FROM password_reset_request prr WHERE prr.user.id = :userId AND prr.status = 'PENDING' ORDER BY prr.requestDate DESC")
    Optional<PasswordResetRequest> findLatestPendingRequestByUserId(@Param("userId") int userId);
}

