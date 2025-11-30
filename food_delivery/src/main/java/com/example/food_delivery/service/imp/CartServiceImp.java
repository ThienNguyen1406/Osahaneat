package com.example.food_delivery.service.imp;

import com.example.food_delivery.dto.response.CartDTO;

public interface CartServiceImp {
    /**
     * Lấy giỏ hàng của user
     */
    CartDTO getCartByUserId(int userId);
    
    /**
     * Thêm món ăn vào giỏ hàng
     */
    boolean addItemToCart(int userId, int foodId, int quantity);
    
    /**
     * Cập nhật số lượng món trong giỏ hàng
     */
    boolean updateCartItemQuantity(int itemId, int quantity);
    
    /**
     * Xóa món khỏi giỏ hàng
     */
    boolean removeCartItem(int itemId);
    
    /**
     * Xóa toàn bộ giỏ hàng
     */
    boolean clearCart(int userId);
    
    /**
     * Tính tổng tiền giỏ hàng
     */
    long calculateCartTotal(int cartId);
}

