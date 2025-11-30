package com.example.food_delivery.controller;

import com.example.food_delivery.dto.response.PromoDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.PromoServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/promo")
public class PromoController {
    
    @Autowired
    PromoServiceImp promoService;
    
    /**
     * GET /promo - Lấy tất cả promo codes đang active
     * Public endpoint - không cần authentication
     */
    @GetMapping
    public ResponseEntity<?> getAllActivePromos() {
        ResponseData responseData = new ResponseData();
        try {
            List<PromoDTO> promos = promoService.getAllActivePromos();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(promos);
            responseData.setDesc("Lấy danh sách promo codes thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting all promos: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách promo codes: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * GET /promo/restaurant/{restaurantId} - Lấy promo codes theo restaurant ID đang active
     * Public endpoint - không cần authentication
     */
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getActivePromosByRestaurant(@PathVariable Integer restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId == null || restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            List<PromoDTO> promos = promoService.getActivePromosByRestaurant(restaurantId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(promos);
            responseData.setDesc("Lấy danh sách promo codes theo restaurant thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting promos by restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách promo codes: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * GET /promo/validate?restaurantId={restaurantId}&promoId={promoId} - Validate promo code
     * Public endpoint - không cần authentication
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validatePromo(
            @RequestParam(required = false) Integer restaurantId,
            @RequestParam Integer promoId) {
        ResponseData responseData = new ResponseData();
        try {
            if (promoId == null || promoId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Promo ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            PromoDTO promo = promoService.validatePromo(restaurantId, promoId);
            
            if (promo != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(promo);
                responseData.setDesc("Promo code hợp lệ!");
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Promo code không hợp lệ hoặc đã hết hạn!");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error validating promo: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi validate promo code: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

