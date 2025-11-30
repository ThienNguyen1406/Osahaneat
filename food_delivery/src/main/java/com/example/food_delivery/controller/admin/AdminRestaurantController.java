package com.example.food_delivery.controller.admin;

import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.RestaurantServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "*")
@RestController("adminRestaurantController")
@RequestMapping("/admin/restaurant")
public class AdminRestaurantController {
    @Autowired
    RestaurantServiceImp restaurantServiceImp;

    /**
     * GET /admin/restaurant - Lấy danh sách tất cả restaurants
     * Yêu cầu quyền ADMIN
     */
    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllRestaurants() {
        ResponseData responseData = new ResponseData();
        try {
            var restaurants = restaurantServiceImp.getAllRestaurants();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(restaurants);
            responseData.setDesc("Lấy danh sách nhà hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting all restaurants: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /admin/restaurant/{id} - Lấy restaurant theo ID
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRestaurantById(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            var restaurant = restaurantServiceImp.getRestaurantById(id);
            if (restaurant == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy nhà hàng với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(restaurant);
            responseData.setDesc("Lấy thông tin nhà hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting restaurant by id: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy thông tin nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /admin/restaurant - Tạo restaurant mới
     * Yêu cầu quyền ADMIN
     */
    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createRestaurant(
            @RequestParam MultipartFile file,
            @RequestParam String title,
            @RequestParam String subtitle,
            @RequestParam String description,
            @RequestParam boolean is_freeship,
            @RequestParam String address,
            @RequestParam String open_date) {

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
                responseData.setDesc("Tên nhà hàng không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Create restaurant
            boolean isSuccess = restaurantServiceImp.insertRestaurant(file, title, subtitle, description, is_freeship, address, open_date);
            
            if (isSuccess) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Tạo nhà hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Tạo nhà hàng thất bại!");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error creating restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi tạo nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /admin/restaurant/{id} - Cập nhật restaurant
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRestaurant(
            @PathVariable int id,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String subtitle,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Boolean is_freeship,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String open_date) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Update restaurant
            boolean isSuccess = restaurantServiceImp.updateRestaurant(id, file, title, subtitle, description, is_freeship, address, open_date);
            
            if (isSuccess) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Cập nhật nhà hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Cập nhật nhà hàng thất bại! Có thể nhà hàng không tồn tại.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error updating restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi cập nhật nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /admin/restaurant/{id} - Xóa restaurant
     * Yêu cầu quyền ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRestaurant(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Delete restaurant
            boolean isSuccess = restaurantServiceImp.deleteRestaurant(id);
            
            if (isSuccess) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa nhà hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Xóa nhà hàng thất bại! Có thể nhà hàng không tồn tại hoặc đang được sử dụng.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi xóa nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /admin/restaurant/{id}/approve - Duyệt nhà hàng
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> approveRestaurant(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Approve restaurant
            boolean isSuccess = restaurantServiceImp.approveRestaurant(id);
            
            if (isSuccess) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Duyệt nhà hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Duyệt nhà hàng thất bại! Có thể nhà hàng không tồn tại.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error approving restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi duyệt nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /admin/restaurant/{id}/reject - Từ chối nhà hàng
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> rejectRestaurant(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Reject restaurant (set isApproved = false)
            boolean isSuccess = restaurantServiceImp.rejectRestaurant(id);
            
            if (isSuccess) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Từ chối nhà hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Từ chối nhà hàng thất bại! Có thể nhà hàng không tồn tại.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error rejecting restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi từ chối nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

