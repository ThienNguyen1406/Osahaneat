package com.example.food_delivery.controller.restaurant;

import com.example.food_delivery.dto.response.DailyRevenueDTO;
import com.example.food_delivery.dto.response.MenuDTO;
import com.example.food_delivery.dto.response.OrderDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.RestaurantStaffService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/restaurant/staff")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RestaurantStaffController {

    RestaurantStaffService restaurantStaffService;

    /**
     * GET /restaurant/staff/orders - Lấy đơn hàng của nhà hàng
     * Use Case: Receive Order
     */
    @GetMapping("/orders")
    @PreAuthorize("hasRole('RESTAURANT_STAFF')")
    public ResponseEntity<?> getRestaurantOrders(
            @RequestParam(required = false) String status) {
        ResponseData responseData = new ResponseData();
        try {
            List<OrderDTO> orders = restaurantStaffService.getRestaurantOrders(status);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(orders);
            responseData.setDesc("Lấy danh sách đơn hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting restaurant orders: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /restaurant/staff/orders/{orderId}/status - Cập nhật trạng thái đơn hàng
     * Use Case: Update Order Status
     */
    @PutMapping("/orders/{orderId}/status")
    @PreAuthorize("hasRole('RESTAURANT_STAFF')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable int orderId,
            @RequestBody Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (orderId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Order ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            String status = request.get("status");
            if (status == null || status.isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Status không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Validate status values
            List<String> validStatuses = List.of("processing", "ready", "completed", "cancelled");
            if (!validStatuses.contains(status)) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Status không hợp lệ! Chỉ chấp nhận: " + validStatuses);
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            OrderDTO order = restaurantStaffService.updateOrderStatus(orderId, status);
            if (order != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(order);
                responseData.setDesc("Cập nhật trạng thái đơn hàng thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy đơn hàng với ID: " + orderId);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật trạng thái đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /restaurant/staff/menu/{menuId}/toggle - Bật/tắt món
     * Use Case: Manage Menu
     */
    @PutMapping("/menu/{menuId}/toggle")
    @PreAuthorize("hasRole('RESTAURANT_STAFF')")
    public ResponseEntity<?> toggleMenu(
            @PathVariable int menuId,
            @RequestBody Map<String, Boolean> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (menuId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Menu ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            Boolean isAvailable = request.get("isAvailable");
            if (isAvailable == null) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("isAvailable không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            MenuDTO menu = restaurantStaffService.toggleMenuAvailability(menuId, isAvailable);
            if (menu != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(menu);
                responseData.setDesc("Cập nhật trạng thái món ăn thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy món ăn với ID: " + menuId);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error toggling menu: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật trạng thái món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /restaurant/staff/revenue/daily - Doanh thu ngày
     */
    @GetMapping("/revenue/daily")
    @PreAuthorize("hasRole('RESTAURANT_STAFF')")
    public ResponseEntity<?> getDailyRevenue(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {
        ResponseData responseData = new ResponseData();
        try {
            if (date == null) {
                date = new Date();
            }
            
            DailyRevenueDTO revenue = restaurantStaffService.getDailyRevenue(date);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(revenue);
            responseData.setDesc("Lấy doanh thu ngày thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting daily revenue: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy doanh thu ngày: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /restaurant/staff/menu - Lấy menu của nhà hàng
     * Use Case: Manage Menu
     */
    @GetMapping("/menu")
    @PreAuthorize("hasRole('RESTAURANT_STAFF')")
    public ResponseEntity<?> getRestaurantMenu() {
        ResponseData responseData = new ResponseData();
        try {
            List<MenuDTO> menus = restaurantStaffService.getRestaurantMenu();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(menus);
            responseData.setDesc("Lấy danh sách menu thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting restaurant menu: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách menu: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

