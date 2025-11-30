package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.RatingFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingFoodRepository extends JpaRepository<RatingFood, Integer> {
    
    /**
     * Tìm đánh giá của user cho food
     */
    Optional<RatingFood> findByUsersIdAndFoodId(int userId, int foodId);
    
    /**
     * Lấy tất cả đánh giá của food
     */
    List<RatingFood> findByFoodId(int foodId);
    
    /**
     * Lấy tất cả đánh giá của user
     */
    List<RatingFood> findByUsersId(int userId);
    
    /**
     * Đếm số lượng đánh giá của food
     */
    long countByFoodId(int foodId);
    
    /**
     * Tính điểm trung bình của food
     */
    @Query("SELECT AVG(r.ratePoint) FROM rating_food r WHERE r.food.id = :foodId")
    Double getAverageRatingByFoodId(int foodId);
}

