package com.example.food_delivery.reponsitory;

import com.example.food_delivery.domain.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantReponsitory extends JpaRepository<Restaurant, Integer> {
    // Search restaurants by title
    List<Restaurant> findByTitleContainingIgnoreCase(String keyword);
    
    // Search restaurants by title or subtitle or description
    @Query("SELECT r FROM restaurant r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.subtitle) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Restaurant> searchRestaurants(@Param("keyword") String keyword);
    
    // Find restaurants by owner ID
    @Query("SELECT r FROM restaurant r WHERE r.owner.id = :ownerId")
    List<Restaurant> findByOwnerId(@Param("ownerId") int ownerId);
}
