package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.Cart;
import com.example.food_delivery.domain.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    /**
     * Tìm cart theo user (customer)
     */
    Optional<Cart> findByCustomer(Users customer);
    
    /**
     * Tìm cart theo customer ID
     */
    Optional<Cart> findByCustomerId(int customerId);
    
    /**
     * Kiểm tra cart có tồn tại cho user không
     */
    boolean existsByCustomerId(int customerId);
}

