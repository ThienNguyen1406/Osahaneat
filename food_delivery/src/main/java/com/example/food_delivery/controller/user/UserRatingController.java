package com.example.food_delivery.controller.user;

import com.example.food_delivery.domain.entity.RatingFood;
import com.example.food_delivery.domain.entity.RatingRestaurant;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.RatingService;
import com.example.food_delivery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController("userRatingController")
@RequestMapping("/rating")
public class UserRatingController {

    @Autowired
    private RatingService ratingService;
    
    @Autowired
    private UserService userService;

    /**
     * Helper method để lấy userId từ authenticated user
     */
    private int getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return 0;
            }
            var userDTO = userService.getMyInfo();
            return userDTO != null ? userDTO.getId() : 0;
        } catch (Exception e) {
            System.err.println("Error getting current user ID: " + e.getMessage());
            return 0;
        }
    }

    /**
     * POST /rating/food - Đánh giá món ăn
     * Yêu cầu authentication (user)
     * Body: { foodId: int, content: String (optional), ratePoint: int (1-5) }
     */
    @PostMapping("/food")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> rateFood(@RequestBody RatingFoodRequest request) {
        ResponseData responseData = new ResponseData();
        try {
            int userId = getCurrentUserId();
            if (userId <= 0) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Vui lòng đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
            
            // Validate input
            if (request.getFoodId() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Food ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (request.getRatePoint() < 1 || request.getRatePoint() > 5) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Điểm đánh giá phải từ 1 đến 5!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            RatingFood rating = ratingService.rateFood(
                userId, 
                request.getFoodId(), 
                request.getRatePoint(), 
                request.getContent()
            );
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(convertRatingFoodToMap(rating));
            responseData.setDesc("Đánh giá món ăn thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi đánh giá món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /rating/food/{foodId} - Lấy danh sách đánh giá của món ăn
     * Public endpoint - không cần authentication
     */
    @GetMapping("/food/{foodId}")
    public ResponseEntity<?> getFoodRatings(@PathVariable int foodId) {
        ResponseData responseData = new ResponseData();
        try {
            List<RatingFood> ratings = ratingService.getFoodRatings(foodId);
            Double averageRating = ratingService.getFoodAverageRating(foodId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("ratings", ratings.stream().map(this::convertRatingFoodToMap).collect(Collectors.toList()));
            result.put("averageRating", averageRating != null ? averageRating : 0.0);
            result.put("totalRatings", ratings.size());
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(result);
            responseData.setDesc("Lấy đánh giá món ăn thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy đánh giá món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * GET /rating/food/{foodId}/my - Lấy đánh giá của user hiện tại cho món ăn
     */
    @GetMapping("/food/{foodId}/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyFoodRating(@PathVariable int foodId) {
        ResponseData responseData = new ResponseData();
        try {
            int userId = getCurrentUserId();
            if (userId <= 0) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Vui lòng đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
            
            var ratingOpt = ratingService.getUserFoodRating(userId, foodId);
            if (ratingOpt.isPresent()) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(convertRatingFoodToMap(ratingOpt.get()));
                responseData.setDesc("Lấy đánh giá thành công!");
            } else {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(null);
                responseData.setDesc("Bạn chưa đánh giá món ăn này");
            }
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy đánh giá: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /rating/food/{foodId} - Cập nhật đánh giá món ăn (sử dụng POST với foodId để tạo/cập nhật)
     * Yêu cầu authentication (user)
     * Body: { content: String (optional), ratePoint: int (1-5) }
     */
    @PutMapping("/food/{foodId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateFoodRating(@PathVariable int foodId, @RequestBody UpdateRatingRequest request) {
        ResponseData responseData = new ResponseData();
        try {
            int userId = getCurrentUserId();
            if (userId <= 0) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Vui lòng đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
            
            if (request.getRatePoint() != null && (request.getRatePoint() < 1 || request.getRatePoint() > 5)) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Điểm đánh giá phải từ 1 đến 5!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Sử dụng rateFood để tạo/cập nhật (nó tự động kiểm tra và cập nhật nếu đã có)
            RatingFood rating = ratingService.rateFood(
                userId, 
                foodId, 
                request.getRatePoint() != null ? request.getRatePoint() : 5, 
                request.getContent()
            );
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(convertRatingFoodToMap(rating));
            responseData.setDesc("Cập nhật đánh giá món ăn thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi cập nhật đánh giá: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /rating/food/{id} - Xóa đánh giá món ăn
     * Yêu cầu authentication (user)
     */
    @DeleteMapping("/food/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteFoodRating(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            int userId = getCurrentUserId();
            if (userId <= 0) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Vui lòng đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
            
            boolean deleted = ratingService.deleteFoodRating(id, userId);
            if (deleted) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa đánh giá thành công!");
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không tìm thấy đánh giá!");
            }
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (SecurityException e) {
            responseData.setStatus(403);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi xóa đánh giá: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /rating/restaurant - Đánh giá nhà hàng
     * Yêu cầu authentication (user)
     * Body: { restaurantId: int, content: String (optional), ratePoint: int (1-5) }
     */
    @PostMapping("/restaurant")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> rateRestaurant(@RequestBody RatingRestaurantRequest request) {
        ResponseData responseData = new ResponseData();
        try {
            int userId = getCurrentUserId();
            if (userId <= 0) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Vui lòng đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
            
            // Validate input
            if (request.getRestaurantId() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (request.getRatePoint() < 1 || request.getRatePoint() > 5) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Điểm đánh giá phải từ 1 đến 5!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            RatingRestaurant rating = ratingService.rateRestaurant(
                userId, 
                request.getRestaurantId(), 
                request.getRatePoint(), 
                request.getContent()
            );
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(convertRatingRestaurantToMap(rating));
            responseData.setDesc("Đánh giá nhà hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi đánh giá nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /rating/restaurant/{restaurantId} - Lấy danh sách đánh giá của nhà hàng
     * Public endpoint - không cần authentication
     */
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getRestaurantRatings(@PathVariable int restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            List<RatingRestaurant> ratings = ratingService.getRestaurantRatings(restaurantId);
            Double averageRating = ratingService.getRestaurantAverageRating(restaurantId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("ratings", ratings.stream().map(this::convertRatingRestaurantToMap).collect(Collectors.toList()));
            result.put("averageRating", averageRating != null ? averageRating : 0.0);
            result.put("totalRatings", ratings.size());
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(result);
            responseData.setDesc("Lấy đánh giá nhà hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy đánh giá nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * GET /rating/restaurant/{restaurantId}/my - Lấy đánh giá của user hiện tại cho nhà hàng
     */
    @GetMapping("/restaurant/{restaurantId}/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyRestaurantRating(@PathVariable int restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            int userId = getCurrentUserId();
            if (userId <= 0) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Vui lòng đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
            
            var ratingOpt = ratingService.getUserRestaurantRating(userId, restaurantId);
            if (ratingOpt.isPresent()) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(convertRatingRestaurantToMap(ratingOpt.get()));
                responseData.setDesc("Lấy đánh giá thành công!");
            } else {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(null);
                responseData.setDesc("Bạn chưa đánh giá nhà hàng này");
            }
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy đánh giá: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /rating/restaurant/{restaurantId} - Cập nhật đánh giá nhà hàng
     * Yêu cầu authentication (user)
     * Body: { content: String (optional), ratePoint: int (1-5) }
     */
    @PutMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateRestaurantRating(@PathVariable int restaurantId, @RequestBody UpdateRatingRequest request) {
        ResponseData responseData = new ResponseData();
        try {
            int userId = getCurrentUserId();
            if (userId <= 0) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Vui lòng đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
            
            if (request.getRatePoint() != null && (request.getRatePoint() < 1 || request.getRatePoint() > 5)) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Điểm đánh giá phải từ 1 đến 5!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Sử dụng rateRestaurant để tạo/cập nhật (nó tự động kiểm tra và cập nhật nếu đã có)
            RatingRestaurant rating = ratingService.rateRestaurant(
                userId, 
                restaurantId, 
                request.getRatePoint() != null ? request.getRatePoint() : 5, 
                request.getContent()
            );
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(convertRatingRestaurantToMap(rating));
            responseData.setDesc("Cập nhật đánh giá nhà hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi cập nhật đánh giá: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /rating/restaurant/{id} - Xóa đánh giá nhà hàng
     * Yêu cầu authentication (user)
     */
    @DeleteMapping("/restaurant/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteRestaurantRating(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            int userId = getCurrentUserId();
            if (userId <= 0) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Vui lòng đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
            
            boolean deleted = ratingService.deleteRestaurantRating(id, userId);
            if (deleted) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa đánh giá thành công!");
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không tìm thấy đánh giá!");
            }
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (SecurityException e) {
            responseData.setStatus(403);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi xóa đánh giá: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Convert RatingFood to Map for JSON response
     */
    private Map<String, Object> convertRatingFoodToMap(RatingFood rating) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", rating.getId());
        map.put("foodId", rating.getFood().getId());
        map.put("userId", rating.getUsers().getId());
        map.put("userName", rating.getUsers().getUserName());
        map.put("userFullName", rating.getUsers().getFullName());
        map.put("ratePoint", rating.getRatePoint());
        map.put("content", rating.getContent());
        return map;
    }
    
    /**
     * Convert RatingRestaurant to Map for JSON response
     */
    private Map<String, Object> convertRatingRestaurantToMap(RatingRestaurant rating) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", rating.getId());
        map.put("restaurantId", rating.getRestaurant().getId());
        map.put("userId", rating.getUsers().getId());
        map.put("userName", rating.getUsers().getUserName());
        map.put("userFullName", rating.getUsers().getFullName());
        map.put("ratePoint", rating.getRatePoint());
        map.put("content", rating.getContent());
        return map;
    }

    // Inner classes for request DTOs
    public static class RatingFoodRequest {
        private int foodId;
        private String content;
        private int ratePoint;

        public int getFoodId() { return foodId; }
        public void setFoodId(int foodId) { this.foodId = foodId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public int getRatePoint() { return ratePoint; }
        public void setRatePoint(int ratePoint) { this.ratePoint = ratePoint; }
    }

    public static class RatingRestaurantRequest {
        private int restaurantId;
        private String content;
        private int ratePoint;

        public int getRestaurantId() { return restaurantId; }
        public void setRestaurantId(int restaurantId) { this.restaurantId = restaurantId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public int getRatePoint() { return ratePoint; }
        public void setRatePoint(int ratePoint) { this.ratePoint = ratePoint; }
    }

    public static class UpdateRatingRequest {
        private String content;
        private Integer ratePoint;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Integer getRatePoint() { return ratePoint; }
        public void setRatePoint(Integer ratePoint) { this.ratePoint = ratePoint; }
    }
}

