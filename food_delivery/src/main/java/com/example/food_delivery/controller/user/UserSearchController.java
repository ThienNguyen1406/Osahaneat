package com.example.food_delivery.controller.user;

import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.domain.entity.Restaurant;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.SearchServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController("userSearchController")
@RequestMapping("/search")
public class UserSearchController {

    @Autowired
    SearchServiceImp searchServiceImp;

    /**
     * GET /search/all?keyword={keyword} - Tìm kiếm tất cả (restaurants, foods)
     * Public endpoint
     */
    @GetMapping("/all")
    public ResponseEntity<?> searchAll(@RequestParam String keyword) {
        ResponseData responseData = new ResponseData();
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Từ khóa tìm kiếm không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            Map<String, Object> results = searchServiceImp.searchAll(keyword);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(results);
            responseData.setDesc("Tìm kiếm thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error searching all: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /search/restaurant?keyword={keyword} - Tìm kiếm nhà hàng
     * Public endpoint
     */
    @GetMapping("/restaurant")
    public ResponseEntity<?> searchRestaurants(@RequestParam String keyword) {
        ResponseData responseData = new ResponseData();
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Từ khóa tìm kiếm không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            List<Restaurant> restaurants = searchServiceImp.searchRestaurants(keyword);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(restaurants);
            responseData.setDesc("Tìm kiếm nhà hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error searching restaurants: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /search/food?keyword={keyword} - Tìm kiếm món ăn
     * Public endpoint
     */
    @GetMapping("/food")
    public ResponseEntity<?> searchFoods(@RequestParam String keyword) {
        ResponseData responseData = new ResponseData();
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Từ khóa tìm kiếm không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            List<Food> foods = searchServiceImp.searchFoods(keyword);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(foods);
            responseData.setDesc("Tìm kiếm món ăn thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error searching foods: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /search/restaurant/advanced - Tìm kiếm nhà hàng nâng cao
     * Public endpoint
     */
    @GetMapping("/restaurant/advanced")
    public ResponseEntity<?> searchRestaurantsAdvanced(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Boolean isFreeship) {
        ResponseData responseData = new ResponseData();
        try {
            List<Restaurant> restaurants = searchServiceImp.searchRestaurantsAdvanced(keyword, address, isFreeship);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(restaurants);
            responseData.setDesc("Tìm kiếm nhà hàng nâng cao thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in advanced restaurant search: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /search/food/advanced - Tìm kiếm món ăn nâng cao
     * Public endpoint
     */
    @GetMapping("/food/advanced")
    public ResponseEntity<?> searchFoodsAdvanced(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        ResponseData responseData = new ResponseData();
        try {
            List<Food> foods = searchServiceImp.searchFoodsAdvanced(keyword, categoryId, minPrice, maxPrice);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(foods);
            responseData.setDesc("Tìm kiếm món ăn nâng cao thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in advanced food search: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /search/food/filtered - Tìm kiếm món ăn với filter đầy đủ
     * Public endpoint
     * Supports: sort (popular, delivery, rating), priceRange (1, 2, 3), categoryIds (multiple)
     */
    @GetMapping("/food/filtered")
    public ResponseEntity<?> searchFoodsFiltered(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort, // "popular", "delivery", "rating"
            @RequestParam(required = false) Integer priceRange, // 1, 2, 3
            @RequestParam(required = false) List<Integer> categoryIds) { // Multiple category IDs
        ResponseData responseData = new ResponseData();
        try {
            List<Food> foods = searchServiceImp.searchFoodsFiltered(keyword, sort, priceRange, categoryIds);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(foods);
            responseData.setDesc("Tìm kiếm món ăn với filter thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in filtered food search: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /search/restaurant/filtered - Tìm kiếm nhà hàng với filter đầy đủ
     * Public endpoint
     * Supports: sort (popular, delivery, rating), priceRange (1, 2, 3), categoryIds (multiple)
     */
    @GetMapping("/restaurant/filtered")
    public ResponseEntity<?> searchRestaurantsFiltered(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort, // "popular", "delivery", "rating"
            @RequestParam(required = false) Integer priceRange, // 1, 2, 3
            @RequestParam(required = false) List<Integer> categoryIds) { // Multiple category IDs
        ResponseData responseData = new ResponseData();
        try {
            List<Restaurant> restaurants = searchServiceImp.searchRestaurantsFiltered(keyword, sort, priceRange, categoryIds);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(restaurants);
            responseData.setDesc("Tìm kiếm nhà hàng với filter thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in filtered restaurant search: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

