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
    
    // Search restaurants by title or subtitle or description (supports Vietnamese)
    @Query("SELECT r FROM restaurant r WHERE " +
           "(r.title IS NOT NULL AND r.title LIKE CONCAT('%', :keyword, '%')) " +
           "OR (r.subtitle IS NOT NULL AND r.subtitle LIKE CONCAT('%', :keyword, '%')) " +
           "OR (r.description IS NOT NULL AND r.description LIKE CONCAT('%', :keyword, '%')) " +
           "OR (r.address IS NOT NULL AND r.address LIKE CONCAT('%', :keyword, '%'))")
    List<Restaurant> searchRestaurants(@Param("keyword") String keyword);
    
    // Find restaurants by owner ID
    @Query("SELECT r FROM restaurant r WHERE r.owner.id = :ownerId")
    List<Restaurant> findByOwnerId(@Param("ownerId") int ownerId);
    
    // Find restaurants that are approved (for public display)
    @Query("SELECT r FROM restaurant r WHERE r.isApproved = true AND r.isActive = true")
    List<Restaurant> findApprovedAndActiveRestaurants();
    
    // Find approved restaurants with pagination (for homepage)
    @Query("SELECT r FROM restaurant r WHERE r.isApproved = true AND r.isActive = true")
    org.springframework.data.domain.Page<Restaurant> findApprovedAndActiveRestaurants(org.springframework.data.domain.Pageable pageable);
}
