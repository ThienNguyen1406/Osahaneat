package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.Promo;
import com.example.food_delivery.domain.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromoRepository extends JpaRepository<Promo, Integer> {
    /**
     * Tìm promo theo restaurant
     */
    List<Promo> findByRestaurant(Restaurant restaurant);
    
    /**
     * Tìm promo theo restaurant ID
     */
    List<Promo> findByRestaurantId(Integer restaurantId);
    
    /**
     * Tìm promo đang active (trong khoảng thời gian startDate và endDate)
     * Bao gồm cả promo áp dụng cho tất cả nhà hàng (restaurant = null)
     */
    @Query("SELECT p FROM promo p WHERE (p.restaurant.id = :restaurantId OR p.restaurant IS NULL) " +
           "AND p.isActive = true " +
           "AND p.startDate <= :currentDate AND p.endDate >= :currentDate")
    List<Promo> findActivePromosByRestaurant(@Param("restaurantId") Integer restaurantId, 
                                              @Param("currentDate") Date currentDate);
    
    /**
     * Tìm tất cả promo đang active (bao gồm cả promo áp dụng cho tất cả nhà hàng)
     */
    @Query("SELECT p FROM promo p WHERE p.isActive = true " +
           "AND p.startDate <= :currentDate AND p.endDate >= :currentDate")
    List<Promo> findAllActivePromos(@Param("currentDate") Date currentDate);
    
    /**
     * Tìm promo theo code
     */
    Optional<Promo> findByCode(String code);
    
    /**
     * Tìm promo đang active theo code
     */
    @Query("SELECT p FROM promo p WHERE p.code = :code " +
           "AND p.isActive = true " +
           "AND p.startDate <= :currentDate AND p.endDate >= :currentDate")
    Optional<Promo> findActivePromoByCode(@Param("code") String code, @Param("currentDate") Date currentDate);
    
    /**
     * Tìm promo theo restaurant ID và code
     */
    @Query("SELECT p FROM promo p WHERE p.restaurant.id = :restaurantId AND p.code = :code")
    Optional<Promo> findByRestaurantIdAndCode(@Param("restaurantId") Integer restaurantId, @Param("code") String code);
}

