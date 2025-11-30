package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.domain.entity.RatingFood;
import com.example.food_delivery.domain.entity.RatingRestaurant;
import com.example.food_delivery.domain.entity.Restaurant;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.reponsitory.FoodRepository;
import com.example.food_delivery.reponsitory.RatingFoodRepository;
import com.example.food_delivery.reponsitory.RatingRestaurantRepository;
import com.example.food_delivery.reponsitory.RestaurantReponsitory;
import com.example.food_delivery.reponsitory.UserReponsitory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RatingService {
    
    @Autowired
    private RatingRestaurantRepository ratingRestaurantRepository;
    
    @Autowired
    private RatingFoodRepository ratingFoodRepository;
    
    @Autowired
    private UserReponsitory userRepository;
    
    @Autowired
    private RestaurantReponsitory restaurantRepository;
    
    @Autowired
    private FoodRepository foodRepository;
    
    /**
     * Đánh giá nhà hàng (tạo mới hoặc cập nhật nếu đã có)
     */
    @Transactional
    public RatingRestaurant rateRestaurant(int userId, int restaurantId, int ratePoint, String content) {
        // Validate
        if (ratePoint < 1 || ratePoint > 5) {
            throw new IllegalArgumentException("Điểm đánh giá phải từ 1 đến 5!");
        }
        
        Optional<Users> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User không tồn tại!");
        }
        
        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
        if (restaurantOpt.isEmpty()) {
            throw new IllegalArgumentException("Nhà hàng không tồn tại!");
        }
        
        Users user = userOpt.get();
        Restaurant restaurant = restaurantOpt.get();
        
        // Tìm đánh giá hiện tại
        Optional<RatingRestaurant> existingRatingOpt = 
            ratingRestaurantRepository.findByUsersIdAndRestaurantId(userId, restaurantId);
        
        RatingRestaurant rating;
        if (existingRatingOpt.isPresent()) {
            // Cập nhật đánh giá cũ
            rating = existingRatingOpt.get();
            rating.setRatePoint(ratePoint);
            if (content != null && !content.trim().isEmpty()) {
                rating.setContent(content.trim());
            }
        } else {
            // Tạo đánh giá mới
            rating = RatingRestaurant.builder()
                    .users(user)
                    .restaurant(restaurant)
                    .ratePoint(ratePoint)
                    .content(content != null ? content.trim() : null)
                    .build();
        }
        
        return ratingRestaurantRepository.save(rating);
    }
    
    /**
     * Đánh giá món ăn (tạo mới hoặc cập nhật nếu đã có)
     */
    @Transactional
    public RatingFood rateFood(int userId, int foodId, int ratePoint, String content) {
        // Validate
        if (ratePoint < 1 || ratePoint > 5) {
            throw new IllegalArgumentException("Điểm đánh giá phải từ 1 đến 5!");
        }
        
        Optional<Users> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User không tồn tại!");
        }
        
        Optional<Food> foodOpt = foodRepository.findById(foodId);
        if (foodOpt.isEmpty()) {
            throw new IllegalArgumentException("Món ăn không tồn tại!");
        }
        
        Users user = userOpt.get();
        Food food = foodOpt.get();
        
        // Tìm đánh giá hiện tại
        Optional<RatingFood> existingRatingOpt = 
            ratingFoodRepository.findByUsersIdAndFoodId(userId, foodId);
        
        RatingFood rating;
        if (existingRatingOpt.isPresent()) {
            // Cập nhật đánh giá cũ
            rating = existingRatingOpt.get();
            rating.setRatePoint(ratePoint);
            if (content != null && !content.trim().isEmpty()) {
                rating.setContent(content.trim());
            }
        } else {
            // Tạo đánh giá mới
            rating = RatingFood.builder()
                    .users(user)
                    .food(food)
                    .ratePoint(ratePoint)
                    .content(content != null ? content.trim() : null)
                    .build();
        }
        
        return ratingFoodRepository.save(rating);
    }
    
    /**
     * Lấy đánh giá của user cho restaurant
     */
    public Optional<RatingRestaurant> getUserRestaurantRating(int userId, int restaurantId) {
        return ratingRestaurantRepository.findByUsersIdAndRestaurantId(userId, restaurantId);
    }
    
    /**
     * Lấy đánh giá của user cho food
     */
    public Optional<RatingFood> getUserFoodRating(int userId, int foodId) {
        return ratingFoodRepository.findByUsersIdAndFoodId(userId, foodId);
    }
    
    /**
     * Lấy tất cả đánh giá của restaurant
     */
    public List<RatingRestaurant> getRestaurantRatings(int restaurantId) {
        return ratingRestaurantRepository.findByRestaurantId(restaurantId);
    }
    
    /**
     * Lấy tất cả đánh giá của food
     */
    public List<RatingFood> getFoodRatings(int foodId) {
        return ratingFoodRepository.findByFoodId(foodId);
    }
    
    /**
     * Xóa đánh giá restaurant
     */
    @Transactional
    public boolean deleteRestaurantRating(int ratingId, int userId) {
        Optional<RatingRestaurant> ratingOpt = ratingRestaurantRepository.findById(ratingId);
        if (ratingOpt.isEmpty()) {
            return false;
        }
        
        RatingRestaurant rating = ratingOpt.get();
        // Chỉ cho phép xóa đánh giá của chính mình
        if (rating.getUsers().getId() != userId) {
            throw new SecurityException("Bạn không có quyền xóa đánh giá này!");
        }
        
        ratingRestaurantRepository.delete(rating);
        return true;
    }
    
    /**
     * Xóa đánh giá food
     */
    @Transactional
    public boolean deleteFoodRating(int ratingId, int userId) {
        Optional<RatingFood> ratingOpt = ratingFoodRepository.findById(ratingId);
        if (ratingOpt.isEmpty()) {
            return false;
        }
        
        RatingFood rating = ratingOpt.get();
        // Chỉ cho phép xóa đánh giá của chính mình
        if (rating.getUsers().getId() != userId) {
            throw new SecurityException("Bạn không có quyền xóa đánh giá này!");
        }
        
        ratingFoodRepository.delete(rating);
        return true;
    }
    
    /**
     * Tính điểm trung bình của restaurant
     */
    public Double getRestaurantAverageRating(int restaurantId) {
        return ratingRestaurantRepository.getAverageRatingByRestaurantId(restaurantId);
    }
    
    /**
     * Tính điểm trung bình của food
     */
    public Double getFoodAverageRating(int foodId) {
        return ratingFoodRepository.getAverageRatingByFoodId(foodId);
    }
}

