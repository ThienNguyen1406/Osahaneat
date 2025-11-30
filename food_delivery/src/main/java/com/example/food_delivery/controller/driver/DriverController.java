package com.example.food_delivery.controller.driver;

import com.example.food_delivery.dto.response.DriverStatisticsDTO;
import com.example.food_delivery.dto.response.OrderDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.DriverService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/driver")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DriverController {

    DriverService driverService;

    /**
     * GET /driver/orders/available - Lấy đơn hàng có sẵn để nhận
     * Use Case: Accept Delivery
     */
    @GetMapping("/orders/available")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> getAvailableOrders() {
        ResponseData responseData = new ResponseData();
        try {
            List<OrderDTO> orders = driverService.getAvailableOrders();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(orders);
            responseData.setDesc("Lấy danh sách đơn hàng có sẵn thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting available orders: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách đơn hàng có sẵn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /driver/orders/active - Lấy đơn hàng đang giao
     * Use Case: Pickup Order, Deliver Order
     */
    @GetMapping("/orders/active")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> getActiveOrders() {
        ResponseData responseData = new ResponseData();
        try {
            List<OrderDTO> orders = driverService.getActiveOrders();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(orders);
            responseData.setDesc("Lấy danh sách đơn hàng đang giao thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting active orders: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách đơn hàng đang giao: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /driver/orders/{orderId}/accept - Nhận đơn hàng
     * Use Case: Accept Delivery
     */
    @PostMapping("/orders/{orderId}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> acceptOrder(@PathVariable int orderId) {
        ResponseData responseData = new ResponseData();
        try {
            if (orderId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Order ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            OrderDTO order = driverService.acceptOrder(orderId);
            if (order != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(order);
                responseData.setDesc("Nhận đơn hàng thành công!");
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
            System.err.println("Error accepting order: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi nhận đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /driver/orders/{orderId}/status - Cập nhật trạng thái đơn hàng
     * Use Case: Pickup Order, Deliver Order, Update Location
     */
    @PutMapping("/orders/{orderId}/status")
    @PreAuthorize("hasRole('DRIVER')")
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
            List<String> validStatuses = List.of("picked_up", "delivered");
            if (!validStatuses.contains(status)) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Status không hợp lệ! Chỉ chấp nhận: " + validStatuses);
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            OrderDTO order = driverService.updateOrderStatus(orderId, status);
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
     * GET /driver/orders/history - Lịch sử giao hàng
     */
    @GetMapping("/orders/history")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> getDeliveryHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ResponseData responseData = new ResponseData();
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<OrderDTO> ordersPage = driverService.getDeliveryHistory(pageable);
            
            Map<String, Object> result = new HashMap<>();
            result.put("orders", ordersPage.getContent());
            result.put("totalElements", ordersPage.getTotalElements());
            result.put("totalPages", ordersPage.getTotalPages());
            result.put("currentPage", page);
            result.put("pageSize", size);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(result);
            responseData.setDesc("Lấy lịch sử giao hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting delivery history: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy lịch sử giao hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /driver/statistics - Thống kê
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {
        ResponseData responseData = new ResponseData();
        try {
            if (date == null) {
                date = new Date();
            }
            
            DriverStatisticsDTO stats = driverService.getStatistics(date);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(stats);
            responseData.setDesc("Lấy thống kê thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting statistics: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy thống kê: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

