package com.example.food_delivery.controller.admin;

import com.example.food_delivery.domain.entity.Category;
import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.domain.entity.MenuRestaurant;
import com.example.food_delivery.domain.entity.Restaurant;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.MenuServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController("adminMenuController")
@RequestMapping("/admin/menu")
public class AdminMenuController {

    @Autowired
    MenuServiceImp menuServiceImp;

    /**
     * GET /admin/menu - Lấy danh sách tất cả món ăn
     * Yêu cầu quyền ADMIN
     */
    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllMenus() {
        ResponseData responseData = new ResponseData();
        try {
            List<Food> menus = menuServiceImp.getAllMenus();
            
            // Map Food to include restaurant address
            List<Map<String, Object>> menuList = new ArrayList<>();
            for (Food menu : menus) {
                Map<String, Object> menuMap = new HashMap<>();
                menuMap.put("id", menu.getId());
                menuMap.put("title", menu.getTitle());
                menuMap.put("image", menu.getImage());
                menuMap.put("price", menu.getPrice());
                menuMap.put("isFreeShip", menu.isFreeShip());
                menuMap.put("is_freeship", menu.isFreeShip());
                menuMap.put("time_ship", menu.getTime_ship());
                menuMap.put("timeShip", menu.getTime_ship());
                menuMap.put("desc", menu.getDesc());
                menuMap.put("description", menu.getDesc());
                
                // Add category
                if (menu.getCategory() != null) {
                    Category category = menu.getCategory();
                    Map<String, Object> categoryMap = new HashMap<>();
                    categoryMap.put("id", category.getId());
                    categoryMap.put("nameCate", category.getNameCate());
                    categoryMap.put("name", category.getNameCate());
                    menuMap.put("category", categoryMap);
                    
                    // Get restaurant address from MenuRestaurant
                    String restaurantAddress = "N/A";
                    if (category.getLisMenuRestaurant() != null && !category.getLisMenuRestaurant().isEmpty()) {
                        MenuRestaurant menuRestaurant = category.getLisMenuRestaurant().iterator().next();
                        if (menuRestaurant != null && menuRestaurant.getRestaurant() != null) {
                            Restaurant restaurant = menuRestaurant.getRestaurant();
                            restaurantAddress = restaurant.getAddress() != null ? restaurant.getAddress() : "N/A";
                            
                            // Also add restaurant object
                            Map<String, Object> restaurantMap = new HashMap<>();
                            restaurantMap.put("id", restaurant.getId());
                            restaurantMap.put("title", restaurant.getTitle());
                            restaurantMap.put("address", restaurant.getAddress());
                            menuMap.put("restaurant", restaurantMap);
                        }
                    }
                    menuMap.put("restaurantAddress", restaurantAddress);
                } else {
                    menuMap.put("category", null);
                    menuMap.put("restaurant", null);
                    menuMap.put("restaurantAddress", "N/A");
                }
                
                menuList.add(menuMap);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(menuList);
            responseData.setDesc("Lấy danh sách món ăn thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting all menus: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /admin/menu/{id} - Lấy món ăn theo ID
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMenuById(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Menu ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            com.example.food_delivery.domain.entity.Food menu = menuServiceImp.getMenuById(id);
            if (menu == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy món ăn với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(menu);
            responseData.setDesc("Lấy thông tin món ăn thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting menu by id: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy thông tin món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /admin/menu - Tạo menu mới
     * Yêu cầu quyền ADMIN
     */
    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createMenu(
            @RequestParam MultipartFile file,
            @RequestParam String title,
            @RequestParam String time_ship,
            @RequestParam String is_freeship,
            @RequestParam double price,
            @RequestParam int cate_id,
            @RequestParam(required = false, defaultValue = "15000") Double shippingFee) {

        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (file == null || file.isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("File ảnh không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (title == null || title.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Tên món ăn không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (price <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Giá phải lớn hơn 0!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (cate_id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Category ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Create menu
            boolean isSuccess = menuServiceImp.createMenu(file, title, time_ship, is_freeship, price, cate_id, shippingFee);
            
            if (isSuccess) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Tạo món ăn thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Tạo món ăn thất bại!");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error creating menu: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi tạo món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /admin/menu/{id} - Cập nhật menu
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMenu(
            @PathVariable int id,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String time_ship,
            @RequestParam(required = false) String is_freeship,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) Integer cate_id,
            @RequestParam(required = false) Double shippingFee) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Menu ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (price != null && price <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Giá phải lớn hơn 0!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Update menu
            boolean isSuccess = menuServiceImp.updateMenu(id, file, title, time_ship, is_freeship, price, cate_id, shippingFee);
            
            if (isSuccess) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Cập nhật món ăn thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Cập nhật món ăn thất bại! Có thể món ăn không tồn tại.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error updating menu: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi cập nhật món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /admin/menu/{id} - Xóa menu
     * Yêu cầu quyền ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMenu(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Menu ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Delete menu
            boolean isSuccess = menuServiceImp.deleteMenu(id);
            
            if (isSuccess) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa món ăn thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Xóa món ăn thất bại! Có thể món ăn không tồn tại hoặc đang được sử dụng.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting menu: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi xóa món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

