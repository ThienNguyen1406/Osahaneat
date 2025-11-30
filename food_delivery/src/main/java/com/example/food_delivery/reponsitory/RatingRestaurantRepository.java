package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.RatingRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRestaurantRepository extends JpaRepository<RatingRestaurant, Integer> {
    
    /**
     * Tìm đánh giá của user cho restaurant
     */
    Optional<RatingRestaurant> findByUsersIdAndRestaurantId(int userId, int restaurantId);
    
    /**
     * Lấy tất cả đánh giá của restaurant
     */
    List<RatingRestaurant> findByRestaurantId(int restaurantId);
    
    /**
     * Lấy tất cả đánh giá của user
     */
    List<RatingRestaurant> findByUsersId(int userId);
    
    /**
     * Đếm số lượng đánh giá của restaurant
     */
    long countByRestaurantId(int restaurantId);
    
    /**
     * Tính điểm trung bình của restaurant
     */
    @Query("SELECT AVG(r.ratePoint) FROM rating_restaurant r WHERE r.restaurant.id = :restaurantId")
    Double getAverageRatingByRestaurantId(int restaurantId);
}

