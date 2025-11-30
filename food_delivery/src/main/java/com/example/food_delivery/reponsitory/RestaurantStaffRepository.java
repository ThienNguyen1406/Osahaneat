package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.RestaurantStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantStaffRepository extends JpaRepository<RestaurantStaff, Integer> {
    
    /**
     * Tìm staff theo user_id
     */
    Optional<RestaurantStaff> findByUserId(int userId);
    
    /**
     * Tìm tất cả staff của một nhà hàng
     */
    List<RestaurantStaff> findByRestaurantId(int restaurantId);
    
    /**
     * Kiểm tra xem user đã là staff của restaurant chưa
     */
    boolean existsByUserIdAndRestaurantId(int userId, int restaurantId);
    
    /**
     * Tìm staff theo user_id và trạng thái active
     */
    List<RestaurantStaff> findByUserIdAndIsActive(int userId, boolean isActive);
    
    /**
     * Tìm staff theo restaurant_id và trạng thái active
     */
    List<RestaurantStaff> findByRestaurantIdAndIsActive(int restaurantId, boolean isActive);
    
    /**
     * Tìm staff theo user_id và restaurant_id
     */
    Optional<RestaurantStaff> findByUserIdAndRestaurantId(int userId, int restaurantId);
    
    /**
     * Tìm tất cả staff của nhiều restaurants
     */
    List<RestaurantStaff> findByRestaurantIdIn(List<Integer> restaurantIds);
}

