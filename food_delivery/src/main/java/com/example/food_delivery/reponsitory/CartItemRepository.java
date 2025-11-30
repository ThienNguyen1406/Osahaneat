package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    /**
     * Tìm tất cả cart items theo cart ID
     */
    List<CartItem> findByCartId(int cartId);
    
    /**
     * Tìm cart item theo cart ID và food ID
     */
    CartItem findByCartIdAndFoodId(int cartId, int foodId);
    
    /**
     * Xóa tất cả cart items theo cart ID
     */
    void deleteByCartId(int cartId);
    
    /**
     * Đếm số lượng cart items trong một cart
     */
    int countByCartId(int cartId);
}

