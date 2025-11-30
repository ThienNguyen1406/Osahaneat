package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.MenuRestaurant;
import com.example.food_delivery.domain.entity.keys.KeyMenuRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRestaurantRepository extends JpaRepository<MenuRestaurant, KeyMenuRestaurant> {
    
    /**
     * Tìm MenuRestaurant theo category ID và restaurant ID
     */
    Optional<MenuRestaurant> findByKeys_CateIdAndKeys_ResId(int cateId, int resId);
    
    /**
     * Tìm tất cả MenuRestaurant theo restaurant ID
     */
    List<MenuRestaurant> findByKeys_ResId(int resId);
    
    /**
     * Tìm tất cả MenuRestaurant theo category ID
     */
    List<MenuRestaurant> findByKeys_CateId(int cateId);
}

