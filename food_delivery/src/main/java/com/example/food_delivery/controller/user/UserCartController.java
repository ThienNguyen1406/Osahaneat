package com.example.food_delivery.controller.user;

import com.example.food_delivery.dto.response.CartDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.CartServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController("userCartController")
@RequestMapping("/cart")
public class UserCartController {

    @Autowired
    CartServiceImp cartService;

    /**
     * GET /cart?userId={id} - Lấy giỏ hàng của user
     * Yêu cầu authentication (user)
     */
    @GetMapping()
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCart(@RequestParam int userId) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate userId
            if (userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Get cart from service
            CartDTO cart = cartService.getCartByUserId(userId);
            
            if (cart == null) {
                responseData.setStatus(500);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Lỗi khi lấy giỏ hàng!");
                return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(cart);
            responseData.setDesc("Lấy giỏ hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting cart: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy giỏ hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /cart/item - Thêm món ăn vào giỏ hàng
     * Yêu cầu authentication (user)
     * Body: { userId: int, foodId: int, quantity: int }
     */
    @PostMapping("/item")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> addCartItem(@RequestBody CartItemRequest request) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (request.getUserId() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (request.getFoodId() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Food ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (request.getQuantity() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Số lượng phải lớn hơn 0!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Add item to cart using service
            boolean result = cartService.addItemToCart(
                request.getUserId(),
                request.getFoodId(),
                request.getQuantity()
            );
            
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Thêm món vào giỏ hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Thêm món vào giỏ hàng thất bại!");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi thêm món vào giỏ hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /cart/item/{itemId} - Cập nhật số lượng món trong giỏ hàng
     * Yêu cầu authentication (user)
     * Body: { quantity: int }
     */
    @PutMapping("/item/{itemId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateCartItem(@PathVariable int itemId, @RequestBody UpdateCartItemRequest request) {
        ResponseData responseData = new ResponseData();
        try {
            if (request.getQuantity() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Số lượng phải lớn hơn 0!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Update cart item quantity using service
            boolean result = cartService.updateCartItemQuantity(itemId, request.getQuantity());
            
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Cập nhật giỏ hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Cập nhật giỏ hàng thất bại! Cart item không tồn tại.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi cập nhật giỏ hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /cart/item/{itemId} - Xóa món khỏi giỏ hàng
     * Yêu cầu authentication (user)
     */
    @DeleteMapping("/item/{itemId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteCartItem(@PathVariable int itemId) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate itemId
            if (itemId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Item ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Remove cart item using service
            boolean result = cartService.removeCartItem(itemId);
            
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa món khỏi giỏ hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Xóa món khỏi giỏ hàng thất bại! Cart item không tồn tại.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi xóa món khỏi giỏ hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /cart?userId={id} - Xóa toàn bộ giỏ hàng
     * Yêu cầu authentication (user)
     */
    @DeleteMapping()
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> clearCart(@RequestParam int userId) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate userId
            if (userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Clear cart using service
            boolean result = cartService.clearCart(userId);
            
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa giỏ hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Xóa giỏ hàng thất bại! Cart không tồn tại.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi khi xóa giỏ hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Inner classes for request DTOs
    public static class CartItemRequest {
        private int userId;
        private int foodId;
        private int quantity;

        public int getUserId() { return userId; }
        public void setUserId(int userId) { this.userId = userId; }
        public int getFoodId() { return foodId; }
        public void setFoodId(int foodId) { this.foodId = foodId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class UpdateCartItemRequest {
        private int quantity;

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}

