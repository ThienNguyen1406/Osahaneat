package com.example.food_delivery.controller;

import com.example.food_delivery.dto.response.PromoDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.PromoServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/voucher")
public class VoucherController {
    
    @Autowired
    PromoServiceImp promoService;
    
    /**
     * POST /voucher/apply - Áp dụng voucher code
     * Body: { "code": "GIAM50K", "restaurantId": 1, "cartTotal": 100000 }
     * Public endpoint - cần authentication để lấy userId (nếu cần)
     */
    @PostMapping("/apply")
    public ResponseEntity<?> applyVoucher(@RequestBody Map<String, Object> request) {
        ResponseData responseData = new ResponseData();
        try {
            String code = (String) request.get("voucherCode");
            if (code == null) {
                code = (String) request.get("code"); // Fallback
            }
            
            if (code == null || code.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Mã voucher không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            Integer restaurantId = null;
            if (request.containsKey("restaurantId")) {
                Object restaurantIdObj = request.get("restaurantId");
                if (restaurantIdObj instanceof Number) {
                    restaurantId = ((Number) restaurantIdObj).intValue();
                }
            }
            
            Long cartTotal = null;
            if (request.containsKey("cartTotal")) {
                Object cartTotalObj = request.get("cartTotal");
                if (cartTotalObj instanceof Number) {
                    cartTotal = ((Number) cartTotalObj).longValue();
                }
            }
            
            // Validate voucher
            PromoDTO voucher = promoService.validateVoucherByCode(code, restaurantId, cartTotal);
            
            if (voucher != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(voucher);
                responseData.setDesc("Áp dụng voucher thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Mã voucher không hợp lệ, đã hết hạn hoặc đã hết lượt sử dụng!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("Error applying voucher: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi áp dụng voucher: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

