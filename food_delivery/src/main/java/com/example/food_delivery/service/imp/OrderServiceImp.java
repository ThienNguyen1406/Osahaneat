package com.example.food_delivery.service.imp;

import com.example.food_delivery.domain.entity.Orders;
import com.example.food_delivery.dto.request.OrderRequest;
import com.example.food_delivery.dto.response.OrderDTO;

import java.util.List;
import java.util.Optional;

public interface OrderServiceImp {
    boolean insertOrder(OrderRequest orderRequest);
    
    List<Orders> getAllOrders();
    
    /**
     * Get all orders as DTOs (to avoid circular reference)
     */
    List<OrderDTO> getAllOrdersAsDTO();
    
    Optional<Orders> getOrderById(int id);
    
    /**
     * Get order by ID as DTO (to avoid circular reference)
     */
    OrderDTO getOrderByIdAsDTO(int id);
    
    List<Orders> getOrdersByUserId(int userId);
    
    /**
     * Get orders by user ID as DTOs (to avoid circular reference)
     */
    List<OrderDTO> getOrdersByUserIdAsDTO(int userId);
    
    boolean updateOrder(int id, String status);
    
    boolean deleteOrder(int id);
    
    /**
     * Checkout from cart - Tạo order từ cart và clear cart
     */
    boolean checkoutFromCart(int userId);
    
    /**
     * Checkout from cart và trả về orderId
     * @param userId User ID
     * @param deliveryAddress Delivery address
     * @param userLat User latitude
     * @param userLng User longitude
     * @return orderId nếu thành công, -1 nếu thất bại
     */
    int checkoutFromCartWithOrderId(int userId, String deliveryAddress, Double userLat, Double userLng);
}
