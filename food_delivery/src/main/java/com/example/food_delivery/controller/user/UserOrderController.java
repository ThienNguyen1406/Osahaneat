package com.example.food_delivery.controller.user;

import com.example.food_delivery.dto.request.OrderRequest;
import com.example.food_delivery.dto.response.OrderDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.OrderServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController("userOrderController")
@RequestMapping("/order")
public class UserOrderController {

    @Autowired
    OrderServiceImp orderServiceImp;
    
    // Note: orderServiceImp is the interface, but we need to cast to OrderService to call checkoutFromCart
    // Or we can add checkoutFromCart to OrderServiceImp interface (which we did)

    /**
     * POST /order - Tạo đơn hàng mới
     * Yêu cầu authentication (user)
     */
    @PostMapping()
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        ResponseData responseData = new ResponseData();
        
        try {
            // Validate input
            if (orderRequest.getUserId() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (orderRequest.getResId() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (orderRequest.getFoodIds() == null || orderRequest.getFoodIds().length == 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Danh sách món ăn không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Create order
            boolean result = orderServiceImp.insertOrder(orderRequest);
            
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Tạo đơn hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Tạo đơn hàng thất bại!");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi tạo đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /order - Lấy danh sách đơn hàng của user hiện tại
     * Yêu cầu authentication (user)
     * Query params: userId (optional) - nếu không có, cần lấy từ token
     */
    @GetMapping()
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getOrders(@RequestParam(required = false) Integer userId) {
        ResponseData responseData = new ResponseData();
        try {
            List<OrderDTO> orders;
            
            if (userId != null && userId > 0) {
                // Lấy orders theo userId as DTOs (to avoid circular reference)
                orders = orderServiceImp.getOrdersByUserIdAsDTO(userId);
            } else {
                // Lấy tất cả orders (tạm thời, sau này sẽ lấy từ token)
                // For now, return empty list or get from token
                orders = new ArrayList<>();
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(orders);
            responseData.setDesc("Lấy danh sách đơn hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting orders: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy danh sách đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /order/{id} - Lấy đơn hàng theo ID
     * Yêu cầu authentication (user)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getOrderById(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            System.out.println("=== GET /order/" + id + " called ===");
            System.out.println("Request received at: " + new java.util.Date());
            System.out.println("Order ID parameter: " + id);
            
            // Validate order ID
            if (id <= 0) {
                System.err.println("Invalid order ID: " + id);
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Order ID không hợp lệ! Order ID phải lớn hơn 0.");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            System.out.println("Calling orderServiceImp.getOrderByIdAsDTO(" + id + ")...");
            OrderDTO orderDTO = orderServiceImp.getOrderByIdAsDTO(id);
            
            if (orderDTO == null) {
                System.out.println("Order not found with ID: " + id);
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy đơn hàng với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            System.out.println("Found order: " + orderDTO.getId() + " with " + (orderDTO.getItems() != null ? orderDTO.getItems().size() : 0) + " items");
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(orderDTO);
            responseData.setDesc("Lấy đơn hàng thành công!");
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
     * GET /order/user/{userId} - Lấy đơn hàng theo user ID
     * Yêu cầu authentication (user hoặc admin)
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable int userId) {
        ResponseData responseData = new ResponseData();
        try {
            System.out.println("=== GET /order/user/" + userId + " called ===");
            System.out.println("Request received at: " + new java.util.Date());
            System.out.println("User ID parameter: " + userId);
            
            // Validate userId
            if (userId <= 0) {
                System.err.println("Invalid userId: " + userId);
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ! User ID phải lớn hơn 0.");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            System.out.println("Calling orderServiceImp.getOrdersByUserIdAsDTO(" + userId + ")...");
            List<OrderDTO> orders = orderServiceImp.getOrdersByUserIdAsDTO(userId);
            System.out.println("Found " + (orders != null ? orders.size() : 0) + " orders for user " + userId);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(orders != null ? orders : new ArrayList<>());
            responseData.setDesc("Lấy danh sách đơn hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Thông tin không hợp lệ: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
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
    
    /**
     * POST /order/checkout - Checkout from cart (tạo order từ cart và clear cart)
     * Yêu cầu authentication (user)
     * Body: { userId: int }
     * Trả về orderId để có thể gọi payment API
     */
    @PostMapping("/checkout")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkoutFromCart(@RequestBody CheckoutRequest request) {
        ResponseData responseData = new ResponseData();
        
        try {
            // Validate input
            if (request.getUserId() <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Checkout from cart and get orderId
            int orderId = orderServiceImp.checkoutFromCartWithOrderId(
                request.getUserId(),
                request.getDeliveryAddress(),
                request.getUserLat(),
                request.getUserLng()
            );
            
            if (orderId > 0) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(orderId); // Return orderId
                responseData.setDesc("Đặt hàng thành công! Order ID: " + orderId);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Đặt hàng thất bại! Vui lòng kiểm tra giỏ hàng của bạn.");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in checkout from cart: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi đặt hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Inner class for checkout request
    public static class CheckoutRequest {
        private int userId;
        private String deliveryAddress;
        private Double userLat;
        private Double userLng;
        
        public int getUserId() {
            return userId;
        }
        
        public void setUserId(int userId) {
            this.userId = userId;
        }
        
        public String getDeliveryAddress() {
            return deliveryAddress;
        }
        
        public void setDeliveryAddress(String deliveryAddress) {
            this.deliveryAddress = deliveryAddress;
        }
        
        public Double getUserLat() {
            return userLat;
        }
        
        public void setUserLat(Double userLat) {
            this.userLat = userLat;
        }
        
        public Double getUserLng() {
            return userLng;
        }
        
        public void setUserLng(Double userLng) {
            this.userLng = userLng;
        }
    }
    
    /**
     * PUT /order/{id}/cancel - User hủy đơn hàng
     * Yêu cầu authentication (user)
     * Chỉ cho phép hủy nếu đơn hàng chưa được xác nhận (status = "created" hoặc "new")
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelOrder(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            System.out.println("=== PUT /order/" + id + "/cancel called ===");
            
            // Validate order ID
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Order ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Get order to check status
            OrderDTO orderDTO = orderServiceImp.getOrderByIdAsDTO(id);
            if (orderDTO == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không tìm thấy đơn hàng với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            // Check if order can be cancelled (only if status is "created" or "new")
            String currentStatus = orderDTO.getStatus() != null ? orderDTO.getStatus().toLowerCase() : "";
            if (!currentStatus.equals("created") && !currentStatus.equals("new")) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không thể hủy đơn hàng này. Đơn hàng đã được xác nhận hoặc đang được xử lý.");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Cancel order (set status to "cancelled")
            boolean result = orderServiceImp.updateOrder(id, "cancelled");
            
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Hủy đơn hàng thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Hủy đơn hàng thất bại!");
            }
            
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error cancelling order: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi hủy đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

