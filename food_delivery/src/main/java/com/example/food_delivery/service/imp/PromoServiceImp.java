package com.example.food_delivery.service.imp;

import com.example.food_delivery.domain.entity.Promo;
import com.example.food_delivery.dto.response.PromoDTO;

import java.util.List;
import java.util.Map;

public interface PromoServiceImp {
    /**
     * Lấy tất cả promo codes đang active
     */
    List<PromoDTO> getAllActivePromos();
    
    /**
     * Lấy promo codes theo restaurant ID đang active
     */
    List<PromoDTO> getActivePromosByRestaurant(Integer restaurantId);
    
    /**
     * Validate và lấy thông tin promo code
     * @param restaurantId - Restaurant ID
     * @param promoId - Promo ID
     * @return PromoDTO nếu hợp lệ, null nếu không hợp lệ
     */
    PromoDTO validatePromo(Integer restaurantId, Integer promoId);
    
    /**
     * Tính discount amount từ promo
     * @param totalPrice - Tổng tiền
     * @param promo - Promo object
     * @return Số tiền được giảm
     */
    long calculateDiscount(long totalPrice, Promo promo);
    
    /**
     * Validate và lấy thông tin voucher theo code
     * @param code - Voucher code
     * @param restaurantId - Restaurant ID (optional)
     * @param cartTotal - Tổng tiền giỏ hàng (để validate min_order_value)
     * @return PromoDTO nếu hợp lệ, null nếu không hợp lệ
     */
    PromoDTO validateVoucherByCode(String code, Integer restaurantId, Long cartTotal);
    
    /**
     * Tạo promo mới
     * @param restaurantId - Restaurant ID
     * @param promoData - Dữ liệu promo
     * @return PromoDTO
     */
    PromoDTO createPromo(Integer restaurantId, Map<String, Object> promoData);
    
    /**
     * Xóa promo
     * @param promoId - Promo ID
     * @return true nếu thành công
     */
    boolean deletePromo(Integer promoId);
    
    /**
     * Lấy danh sách promo theo restaurant ID
     * @param restaurantId - Restaurant ID
     * @return List<PromoDTO>
     */
    List<PromoDTO> getPromosByRestaurant(Integer restaurantId);
}

