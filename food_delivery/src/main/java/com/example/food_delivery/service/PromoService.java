package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Promo;
import com.example.food_delivery.domain.entity.Restaurant;
import com.example.food_delivery.dto.response.PromoDTO;
import com.example.food_delivery.reponsitory.PromoRepository;
import com.example.food_delivery.reponsitory.RestaurantReponsitory;
import com.example.food_delivery.service.imp.PromoServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PromoService implements PromoServiceImp {
    
    @Autowired
    PromoRepository promoRepository;
    
    @Autowired
    RestaurantReponsitory restaurantRepository;
    
    @Override
    public List<PromoDTO> getAllActivePromos() {
        Date currentDate = new Date();
        List<Promo> promos = promoRepository.findAllActivePromos(currentDate);
        return convertToDTOList(promos);
    }
    
    @Override
    public List<PromoDTO> getActivePromosByRestaurant(Integer restaurantId) {
        Date currentDate = new Date();
        List<Promo> promos = promoRepository.findActivePromosByRestaurant(restaurantId, currentDate);
        return convertToDTOList(promos);
    }
    
    @Override
    public PromoDTO validatePromo(Integer restaurantId, Integer promoId) {
        if (promoId == null || promoId <= 0) {
            return null;
        }
        
        Optional<Promo> promoOpt = promoRepository.findById(promoId);
        if (!promoOpt.isPresent()) {
            return null;
        }
        
        Promo promo = promoOpt.get();
        Date currentDate = new Date();
        
        // Check if promo is active (within date range)
        if (promo.getStartDate().after(currentDate) || promo.getEndDate().before(currentDate)) {
            return null;
        }
        
        // Check if promo belongs to restaurant (if restaurantId is provided)
        if (restaurantId != null && restaurantId > 0) {
            if (promo.getRestaurant() == null || promo.getRestaurant().getId() != restaurantId) {
                return null;
            }
        }
        
        return convertToDTO(promo);
    }
    
    @Override
    public long calculateDiscount(long totalPrice, Promo promo) {
        if (promo == null || totalPrice <= 0) {
            return 0;
        }
        
        // Nếu có value (giảm giá cố định), ưu tiên dùng value
        if (promo.getValue() != null && promo.getValue() > 0) {
            return promo.getValue();
        }
        
        // Nếu có percent, tính theo phần trăm
        if (promo.getPercent() != null && promo.getPercent() > 0 && promo.getPercent() <= 100) {
            return (totalPrice * promo.getPercent()) / 100;
        }
        
        return 0;
    }
    
    @Override
    public PromoDTO validateVoucherByCode(String code, Integer restaurantId, Long cartTotal) {
        if (code == null || code.trim().isEmpty()) {
            return null;
        }
        
        Date currentDate = new Date();
        Optional<Promo> promoOpt;
        
        // Tìm promo theo code
        if (restaurantId != null && restaurantId > 0) {
            promoOpt = promoRepository.findByRestaurantIdAndCode(restaurantId, code.toUpperCase());
        } else {
            promoOpt = promoRepository.findActivePromoByCode(code.toUpperCase(), currentDate);
        }
        
        if (!promoOpt.isPresent()) {
            return null;
        }
        
        Promo promo = promoOpt.get();
        
        // Kiểm tra isActive
        if (promo.getIsActive() == null || !promo.getIsActive()) {
            return null;
        }
        
        // Kiểm tra thời gian
        if (promo.getStartDate() != null && promo.getStartDate().after(currentDate)) {
            return null; // Chưa đến ngày bắt đầu
        }
        if (promo.getEndDate() != null && promo.getEndDate().before(currentDate)) {
            return null; // Đã hết hạn
        }
        
        // Kiểm tra maxUsage
        if (promo.getMaxUsage() != null && promo.getMaxUsage() > 0) {
            int usedCount = promo.getUsedCount() != null ? promo.getUsedCount() : 0;
            if (usedCount >= promo.getMaxUsage()) {
                return null; // Đã hết lượt sử dụng
            }
        }
        
        // Kiểm tra restaurant (nếu có yêu cầu)
        if (restaurantId != null && restaurantId > 0) {
            if (promo.getRestaurant() == null || promo.getRestaurant().getId() != restaurantId) {
                return null;
            }
        }
        
        return convertToDTO(promo);
    }
    
    @Override
    public PromoDTO createPromo(Integer restaurantId, Map<String, Object> promoData) {
        // Kiểm tra xem có áp dụng cho tất cả nhà hàng không
        boolean applyToAll = false;
        if (promoData.containsKey("applyToAll")) {
            Object applyToAllObj = promoData.get("applyToAll");
            if (applyToAllObj instanceof Boolean) {
                applyToAll = (Boolean) applyToAllObj;
            } else if (applyToAllObj instanceof String) {
                applyToAll = Boolean.parseBoolean((String) applyToAllObj);
            }
        }
        
        Promo promo = new Promo();
        
        // Nếu áp dụng cho tất cả nhà hàng, set restaurant = null
        if (applyToAll) {
            promo.setRestaurant(null);
        } else {
            // Nếu không, yêu cầu restaurantId hợp lệ
            if (restaurantId == null || restaurantId <= 0) {
                throw new IllegalArgumentException("Restaurant ID không hợp lệ!");
            }
            
            Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
            if (!restaurantOpt.isPresent()) {
                throw new IllegalArgumentException("Không tìm thấy restaurant với ID: " + restaurantId);
            }
            
            promo.setRestaurant(restaurantOpt.get());
        }
        
        // Set các trường từ promoData
        if (promoData.containsKey("code")) {
            String code = (String) promoData.get("code");
            if (code != null && !code.trim().isEmpty()) {
                // Kiểm tra code đã tồn tại chưa
                Optional<Promo> existingPromo = promoRepository.findByCode(code.toUpperCase());
                if (existingPromo.isPresent()) {
                    throw new IllegalArgumentException("Mã voucher đã tồn tại: " + code);
                }
                promo.setCode(code.toUpperCase());
            }
        }
        
        if (promoData.containsKey("name")) {
            promo.setName((String) promoData.get("name"));
        }
        
        if (promoData.containsKey("type")) {
            promo.setType((String) promoData.get("type"));
        }
        
        if (promoData.containsKey("value")) {
            Object valueObj = promoData.get("value");
            if (valueObj instanceof Number) {
                promo.setValue(((Number) valueObj).longValue());
            }
        }
        
        if (promoData.containsKey("percent")) {
            Object percentObj = promoData.get("percent");
            if (percentObj instanceof Number) {
                promo.setPercent(((Number) percentObj).intValue());
            }
        }
        
        if (promoData.containsKey("startDate")) {
            Object startDateObj = promoData.get("startDate");
            if (startDateObj instanceof Date) {
                promo.setStartDate((Date) startDateObj);
            } else if (startDateObj instanceof String) {
                try {
                    // Parse date string (format: yyyy-MM-dd or yyyy-MM-dd HH:mm:ss)
                    String dateStr = (String) startDateObj;
                    java.text.SimpleDateFormat sdf;
                    if (dateStr.contains(" ")) {
                        // Format: "yyyy-MM-dd HH:mm:ss"
                        sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    } else {
                        // Format: "yyyy-MM-dd"
                        sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                    }
                    promo.setStartDate(sdf.parse(dateStr));
                } catch (Exception e) {
                    System.err.println("Error parsing startDate: " + e.getMessage());
                }
            }
        }
        
        if (promoData.containsKey("endDate")) {
            Object endDateObj = promoData.get("endDate");
            if (endDateObj instanceof Date) {
                promo.setEndDate((Date) endDateObj);
            } else if (endDateObj instanceof String) {
                try {
                    // Parse date string (format: yyyy-MM-dd or yyyy-MM-dd HH:mm:ss)
                    String dateStr = (String) endDateObj;
                    java.text.SimpleDateFormat sdf;
                    if (dateStr.contains(" ")) {
                        // Format: "yyyy-MM-dd HH:mm:ss"
                        sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    } else {
                        // Format: "yyyy-MM-dd"
                        sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                    }
                    promo.setEndDate(sdf.parse(dateStr));
                } catch (Exception e) {
                    System.err.println("Error parsing endDate: " + e.getMessage());
                }
            }
        }
        
        if (promoData.containsKey("maxUsage")) {
            Object maxUsageObj = promoData.get("maxUsage");
            if (maxUsageObj instanceof Number) {
                promo.setMaxUsage(((Number) maxUsageObj).intValue());
            }
        }
        
        if (promoData.containsKey("description")) {
            promo.setDescription((String) promoData.get("description"));
        }
        
        // Mặc định
        promo.setUsedCount(0);
        promo.setIsActive(true);
        
        promo = promoRepository.save(promo);
        return convertToDTO(promo);
    }
    
    @Override
    public boolean deletePromo(Integer promoId) {
        if (promoId == null || promoId <= 0) {
            return false;
        }
        
        Optional<Promo> promoOpt = promoRepository.findById(promoId);
        if (!promoOpt.isPresent()) {
            return false;
        }
        
        promoRepository.delete(promoOpt.get());
        return true;
    }
    
    @Override
    public List<PromoDTO> getPromosByRestaurant(Integer restaurantId) {
        // Nếu restaurantId = null hoặc <= 0, trả về tất cả promo (bao gồm promo áp dụng cho tất cả)
        if (restaurantId == null || restaurantId <= 0) {
            List<Promo> allPromos = promoRepository.findAll();
            return convertToDTOList(allPromos);
        }
        
        // Lấy promo của restaurant cụ thể + promo áp dụng cho tất cả (restaurant = null)
        List<Promo> restaurantPromos = promoRepository.findByRestaurantId(restaurantId);
        List<Promo> globalPromos = promoRepository.findByRestaurant(null); // Promo áp dụng cho tất cả
        
        // Merge và loại bỏ duplicate
        List<Promo> allPromos = new ArrayList<>(restaurantPromos);
        for (Promo globalPromo : globalPromos) {
            if (!allPromos.contains(globalPromo)) {
                allPromos.add(globalPromo);
            }
        }
        
        return convertToDTOList(allPromos);
    }
    
    /**
     * Convert Promo entity to PromoDTO
     */
    private PromoDTO convertToDTO(Promo promo) {
        if (promo == null) {
            return null;
        }
        
        PromoDTO dto = new PromoDTO();
        dto.setId(promo.getId());
        dto.setCode(promo.getCode());
        dto.setName(promo.getName());
        dto.setType(promo.getType());
        dto.setPercent(promo.getPercent());
        dto.setValue(promo.getValue());
        dto.setStartDate(promo.getStartDate());
        dto.setEndDate(promo.getEndDate());
        dto.setMaxUsage(promo.getMaxUsage());
        dto.setUsedCount(promo.getUsedCount());
        dto.setDescription(promo.getDescription());
        dto.setIsActive(promo.getIsActive());
        
        if (promo.getRestaurant() != null) {
            dto.setRestaurantId(promo.getRestaurant().getId());
            dto.setRestaurantName(promo.getRestaurant().getTitle());
        }
        
        return dto;
    }
    
    /**
     * Convert list of Promo entities to list of PromoDTO
     */
    private List<PromoDTO> convertToDTOList(List<Promo> promos) {
        List<PromoDTO> dtoList = new ArrayList<>();
        for (Promo promo : promos) {
            PromoDTO dto = convertToDTO(promo);
            if (dto != null) {
                dtoList.add(dto);
            }
        }
        return dtoList;
    }
}

