package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.domain.entity.Restaurant;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.reponsitory.FoodRepository;
import com.example.food_delivery.reponsitory.RestaurantReponsitory;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.service.imp.SearchServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchService implements SearchServiceImp {

    @Autowired
    RestaurantReponsitory restaurantRepository;

    @Autowired
    FoodRepository foodRepository;

    @Autowired
    UserReponsitory userRepository;

    @Override
    public Map<String, Object> searchAll(String keyword) {
        Map<String, Object> results = new HashMap<>();
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                results.put("restaurants", new ArrayList<>());
                results.put("foods", new ArrayList<>());
                results.put("users", new ArrayList<>());
                return results;
            }

            String searchKeyword = keyword.trim();
            results.put("restaurants", searchRestaurants(searchKeyword));
            results.put("foods", searchFoods(searchKeyword));
            results.put("users", searchUsers(searchKeyword));
            return results;
        } catch (Exception e) {
            System.err.println("Error in searchAll: " + e.getMessage());
            e.printStackTrace();
            results.put("restaurants", new ArrayList<>());
            results.put("foods", new ArrayList<>());
            results.put("users", new ArrayList<>());
            return results;
        }
    }

    @Override
    public List<Restaurant> searchRestaurants(String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return new ArrayList<>();
            }
            return restaurantRepository.searchRestaurants(keyword.trim());
        } catch (Exception e) {
            System.err.println("Error searching restaurants: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Food> searchFoods(String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return new ArrayList<>();
            }
            return foodRepository.searchFoods(keyword.trim());
        } catch (Exception e) {
            System.err.println("Error searching foods: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Users> searchUsers(String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return new ArrayList<>();
            }
            return userRepository.searchUsers(keyword.trim());
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Restaurant> searchRestaurantsAdvanced(String keyword, String address, Boolean isFreeship) {
        try {
            List<Restaurant> restaurants = searchRestaurants(keyword);
            
            // Apply filters
            if (address != null && !address.trim().isEmpty()) {
                restaurants.removeIf(r -> r.getAddress() == null || 
                    !r.getAddress().toLowerCase().contains(address.toLowerCase()));
            }
            
            if (isFreeship != null) {
                restaurants.removeIf(r -> r.isFreeship() != isFreeship);
            }
            
            return restaurants;
        } catch (Exception e) {
            System.err.println("Error in advanced restaurant search: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Food> searchFoodsAdvanced(String keyword, Integer categoryId, Double minPrice, Double maxPrice) {
        try {
            List<Food> foods = searchFoods(keyword);
            
            // Apply filters
            if (categoryId != null && categoryId > 0) {
                foods.removeIf(f -> f.getCategory() == null || f.getCategory().getId() != categoryId);
            }
            
            if (minPrice != null && minPrice > 0) {
                foods.removeIf(f -> f.getPrice() < minPrice);
            }
            
            if (maxPrice != null && maxPrice > 0) {
                foods.removeIf(f -> f.getPrice() > maxPrice);
            }
            
            return foods;
        } catch (Exception e) {
            System.err.println("Error in advanced food search: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Food> searchFoodsFiltered(String keyword, String sort, Integer priceRange, List<Integer> categoryIds) {
        try {
            List<Food> foods;
            
            // Start with keyword search or all foods
            if (keyword != null && !keyword.trim().isEmpty()) {
                foods = new ArrayList<>(searchFoods(keyword.trim()));
            } else {
                foods = new ArrayList<>(foodRepository.findAll());
            }
            
            // Filter by categories (multiple)
            if (categoryIds != null && !categoryIds.isEmpty()) {
                foods.removeIf(f -> f.getCategory() == null || !categoryIds.contains(f.getCategory().getId()));
            }
            
            // Filter by price range
            if (priceRange != null) {
                double minPrice = 0;
                double maxPrice = Double.MAX_VALUE;
                
                switch (priceRange) {
                    case 1: // $
                        maxPrice = 50000; // Under 50k VND
                        break;
                    case 2: // $$
                        minPrice = 50000;
                        maxPrice = 150000; // 50k - 150k VND
                        break;
                    case 3: // $$$
                        minPrice = 150000; // Over 150k VND
                        break;
                }
                
                final double finalMinPrice = minPrice;
                final double finalMaxPrice = maxPrice;
                foods.removeIf(f -> f.getPrice() < finalMinPrice || f.getPrice() > finalMaxPrice);
            }
            
            // Sort
            if (sort != null) {
                switch (sort.toLowerCase()) {
                    case "delivery":
                        // Sort by delivery time (time_ship) - ascending
                        foods.sort((f1, f2) -> {
                            String time1 = f1.getTime_ship() != null ? f1.getTime_ship() : "999";
                            String time2 = f2.getTime_ship() != null ? f2.getTime_ship() : "999";
                            try {
                                int t1 = Integer.parseInt(time1.replaceAll("[^0-9]", ""));
                                int t2 = Integer.parseInt(time2.replaceAll("[^0-9]", ""));
                                return Integer.compare(t1, t2);
                            } catch (Exception e) {
                                return time1.compareTo(time2);
                            }
                        });
                        break;
                    case "rating":
                        // Sort by rating - would need to calculate from RatingFood
                        // For now, keep original order
                        break;
                    case "popular":
                    default:
                        // Most popular - keep original order (or sort by ID descending for newest first)
                        foods.sort((f1, f2) -> Integer.compare(f2.getId(), f1.getId()));
                        break;
                }
            }
            
            return foods;
        } catch (Exception e) {
            System.err.println("Error in filtered food search: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Restaurant> searchRestaurantsFiltered(String keyword, String sort, Integer priceRange, List<Integer> categoryIds) {
        try {
            List<Restaurant> restaurants;
            
            // Start with keyword search or all restaurants
            if (keyword != null && !keyword.trim().isEmpty()) {
                restaurants = new ArrayList<>(searchRestaurants(keyword.trim()));
            } else {
                restaurants = new ArrayList<>(restaurantRepository.findAll());
            }
            
            // Filter by categories (restaurants that have foods in these categories)
            if (categoryIds != null && !categoryIds.isEmpty()) {
                restaurants.removeIf(r -> {
                    if (r.getLisMenuRestaurant() == null || r.getLisMenuRestaurant().isEmpty()) {
                        return true; // Remove restaurants with no menu
                    }
                    // Check if restaurant has any food in the selected categories
                    return r.getLisMenuRestaurant().stream()
                            .noneMatch(mr -> mr.getCategory() != null && categoryIds.contains(mr.getCategory().getId()));
                });
            }
            
            // Filter by price range (based on average food price in restaurant)
            if (priceRange != null) {
                double minPrice = 0;
                double maxPrice = Double.MAX_VALUE;
                
                switch (priceRange) {
                    case 1: // $
                        maxPrice = 50000;
                        break;
                    case 2: // $$
                        minPrice = 50000;
                        maxPrice = 150000;
                        break;
                    case 3: // $$$
                        minPrice = 150000;
                        break;
                }
                
                final double finalMinPrice = minPrice;
                final double finalMaxPrice = maxPrice;
                restaurants.removeIf(r -> {
                    // Calculate average price of foods in restaurant
                    if (r.getLisMenuRestaurant() == null || r.getLisMenuRestaurant().isEmpty()) {
                        return true;
                    }
                    double avgPrice = r.getLisMenuRestaurant().stream()
                            .filter(mr -> mr.getCategory() != null && mr.getCategory().getLisFood() != null)
                            .flatMap(mr -> mr.getCategory().getLisFood().stream())
                            .mapToDouble(f -> f.getPrice() > 0 ? f.getPrice() : 0.0)
                            .average()
                            .orElse(0.0);
                    return avgPrice < finalMinPrice || avgPrice > finalMaxPrice;
                });
            }
            
            // Sort
            if (sort != null) {
                switch (sort.toLowerCase()) {
                    case "delivery":
                        // Sort by delivery time - would need delivery time field
                        // For now, keep original order
                        break;
                    case "rating":
                        // Sort by rating - descending
                        restaurants.sort((r1, r2) -> {
                            double rating1 = calculateRestaurantRating(r1);
                            double rating2 = calculateRestaurantRating(r2);
                            return Double.compare(rating2, rating1);
                        });
                        break;
                    case "popular":
                    default:
                        // Most popular - sort by ID descending for newest first
                        restaurants.sort((r1, r2) -> Integer.compare(r2.getId(), r1.getId()));
                        break;
                }
            }
            
            return restaurants;
        } catch (Exception e) {
            System.err.println("Error in filtered restaurant search: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private double calculateRestaurantRating(com.example.food_delivery.domain.entity.Restaurant restaurant) {
        if (restaurant.getLisRatingRestaurant() == null || restaurant.getLisRatingRestaurant().isEmpty()) {
            return 0.0;
        }
        return restaurant.getLisRatingRestaurant().stream()
                .mapToDouble(r -> r.getRatePoint() > 0 ? (double) r.getRatePoint() : 0.0)
                .average()
                .orElse(0.0);
    }
}

