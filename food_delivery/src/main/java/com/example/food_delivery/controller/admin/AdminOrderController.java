package com.example.food_delivery.controller.admin;

import com.example.food_delivery.domain.entity.Orders;
import com.example.food_delivery.dto.response.OrderDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.OrderServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController("adminOrderController")
@RequestMapping("/admin/order")
public class AdminOrderController {

    @Autowired
    OrderServiceImp orderServiceImp;

    /**
     * GET /admin/order - Lấy danh sách tất cả đơn hàng
     * Yêu cầu quyền ADMIN
     */
    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders() {
        ResponseData responseData = new ResponseData();
        try {
            System.out.println("=== AdminOrderController.getAllOrders() called ===");
            // Use DTO to avoid circular reference issues
            List<OrderDTO> orders = orderServiceImp.getAllOrdersAsDTO();
            System.out.println("Successfully retrieved " + orders.size() + " orders as DTOs");
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(orders);
            responseData.setDesc("Lấy danh sách đơn hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("=== ERROR in AdminOrderController.getAllOrders() ===");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /admin/order/{id} - Lấy đơn hàng theo ID
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrderById(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Order ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            Optional<Orders> orderOptional = orderServiceImp.getOrderById(id);
            
            if (orderOptional.isPresent()) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(orderOptional.get());
                responseData.setDesc("Lấy đơn hàng thành công!");
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy đơn hàng với ID: " + id);
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting order by id: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /admin/order/{id} - Cập nhật đơn hàng (status)
     * Yêu cầu quyền ADMIN
     * Body: { status: "delivered" | "cancelled" | "processing" }
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrder(@PathVariable int id, @RequestParam(required = false) String status) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Order ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Validate status
            if (status == null || status.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Status không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            System.out.println("=== Updating order ===");
            System.out.println("Order ID: " + id);
            System.out.println("Status: " + status);
            
            boolean result = orderServiceImp.updateOrder(id, status);
            
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Cập nhật đơn hàng thành công!");
                System.out.println("✅ Order " + id + " updated successfully to status: " + status);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Cập nhật đơn hàng thất bại! Có thể đơn hàng không tồn tại hoặc status không hợp lệ.");
                System.err.println("❌ Failed to update order " + id + " to status: " + status);
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error updating order: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi cập nhật đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /admin/order/{id} - Xóa đơn hàng
     * Yêu cầu quyền ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOrder(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Order ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            boolean result = orderServiceImp.deleteOrder(id);
            
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa đơn hàng thành công!");
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không tìm thấy đơn hàng với ID: " + id);
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting order: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi xóa đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /admin/order/user/{userId} - Lấy đơn hàng theo user ID
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable int userId) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            List<Orders> orders = orderServiceImp.getOrdersByUserId(userId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(orders);
            responseData.setDesc("Lấy danh sách đơn hàng theo user thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting orders by user id: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

