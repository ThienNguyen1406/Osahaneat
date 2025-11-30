package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Category;
import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.reponsitory.FoodRepository;
import com.example.food_delivery.reponsitory.RestaurantReponsitory;
import com.example.food_delivery.service.imp.FileServiceImp;
import com.example.food_delivery.service.imp.MenuServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;


@Service
public class MenuService implements MenuServiceImp {
    @Autowired
    FileServiceImp fileServiceImp;
    @Autowired
    FoodRepository foodRepository;
    @Autowired
    private RestaurantReponsitory restaurantReponsitory;

    @Override
    public boolean createMenu(MultipartFile file, String title, String time_ship, String is_freeship, Double price, int cate_id, Double shippingFee) {
        boolean result = false; //check variable

        try{
            boolean isSaveFileSuccess = fileServiceImp.saveFile(file);
            if(isSaveFileSuccess){
                Food food = new Food();
                food.setTitle(title);
                food.setImage(file.getOriginalFilename());
                food.setTime_ship(time_ship);
                food.setPrice(price);
                food.setFreeShip(is_freeship != null && (is_freeship.equals("true") || is_freeship.equals("1")));
                // Set shipping fee (default to 15000 if not provided)
                food.setShippingFee(shippingFee != null && shippingFee >= 0 ? shippingFee : 15000.0);

                Category category = new Category();
                category.setId(cate_id);
                food.setCategory(category);

                foodRepository.save(food);

                result = true;
            }
        }catch(Exception e){
            System.out.println("Error in insert food: " + e.getMessage());
        }

        return result;
    }

    @Override
    public List<Food> getAllMenus() {
        try {
            // Use findAllWithRestaurant to load restaurant address
            return foodRepository.findAllWithRestaurant();
        } catch (Exception e) {
            System.err.println("Error getting all menus: " + e.getMessage());
            e.printStackTrace();
            // Fallback to regular findAll if query fails
            try {
                return foodRepository.findAll();
            } catch (Exception ex) {
                System.err.println("Error in fallback findAll: " + ex.getMessage());
                return List.of();
            }
        }
    }

    @Override
    public Food getMenuById(int id) {
        try {
            Optional<Food> foodOptional = foodRepository.findById(id);
            return foodOptional.orElse(null);
        } catch (Exception e) {
            System.err.println("Error getting menu by id: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public boolean updateMenu(int id, MultipartFile file, String title, String time_ship, String is_freeship, Double price, Integer cate_id, Double shippingFee) {
        try {
            Optional<Food> foodOptional = foodRepository.findById(id);
            if (foodOptional.isEmpty()) {
                System.err.println("Food not found with id: " + id);
                return false;
            }
            
            Food food = foodOptional.get();
            
            // Update file if provided
            if (file != null && !file.isEmpty()) {
                boolean isSaveFileSuccess = fileServiceImp.saveFile(file);
                if (isSaveFileSuccess) {
                    food.setImage(file.getOriginalFilename());
                } else {
                    System.err.println("Failed to save file");
                    return false;
                }
            }
            
            // Update other fields if provided
            if (title != null && !title.trim().isEmpty()) {
                food.setTitle(title.trim());
            }
            
            if (time_ship != null && !time_ship.trim().isEmpty()) {
                food.setTime_ship(time_ship.trim());
            }
            
            if (is_freeship != null) {
                food.setFreeShip(is_freeship.equals("true") || is_freeship.equals("1"));
            }
            
            if (price != null && price > 0) {
                food.setPrice(price);
            }
            
            if (shippingFee != null && shippingFee >= 0) {
                food.setShippingFee(shippingFee);
            }
            
            if (cate_id != null && cate_id > 0) {
                Category category = new Category();
                category.setId(cate_id);
                food.setCategory(category);
            }
            
            foodRepository.save(food);
            return true;
        } catch (Exception e) {
            System.err.println("Error updating menu: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean deleteMenu(int id) {
        try {
            Optional<Food> foodOptional = foodRepository.findById(id);
            if (foodOptional.isEmpty()) {
                System.err.println("Food not found with id: " + id);
                return false;
            }
            
            foodRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            System.err.println("Error deleting menu: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

}
