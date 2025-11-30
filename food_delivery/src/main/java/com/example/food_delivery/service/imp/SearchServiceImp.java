package com.example.food_delivery.service.imp;

import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.domain.entity.Restaurant;
import com.example.food_delivery.domain.entity.Users;

import java.util.List;
import java.util.Map;

public interface SearchServiceImp {
    // Search all types
    Map<String, Object> searchAll(String keyword);
    
    // Search restaurants
    List<Restaurant> searchRestaurants(String keyword);
    
    // Search foods
    List<Food> searchFoods(String keyword);
    
    // Search users (admin only)
    List<Users> searchUsers(String keyword);
    
    // Advanced search with filters
    List<Restaurant> searchRestaurantsAdvanced(String keyword, String address, Boolean isFreeship);
    
    List<Food> searchFoodsAdvanced(String keyword, Integer categoryId, Double minPrice, Double maxPrice);
    
    // Filtered search with sort, price range, and categories
    List<Food> searchFoodsFiltered(String keyword, String sort, Integer priceRange, List<Integer> categoryIds);
    
    List<Restaurant> searchRestaurantsFiltered(String keyword, String sort, Integer priceRange, List<Integer> categoryIds);
}

