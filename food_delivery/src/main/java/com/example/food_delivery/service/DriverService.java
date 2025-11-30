package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Orders;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.response.DriverStatisticsDTO;
import com.example.food_delivery.dto.response.OrderDTO;
import com.example.food_delivery.reponsitory.OrderRepository;
import com.example.food_delivery.reponsitory.UserReponsitory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class DriverService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserReponsitory userReponsitory;

    @Autowired
    private OrderService orderService;

    /**
     * Lấy ID của driver hiện tại từ SecurityContext
     */
    private int getCurrentDriverId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String username = authentication.getName();
        var userOpt = userReponsitory.findFirstByUserName(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        Users user = userOpt.get();
        return user.getId();
    }

    /**
     * Lấy danh sách đơn hàng có sẵn để nhận (chưa có driver)
     */
    public List<OrderDTO> getAvailableOrders() {
        try {
            // Đơn hàng có status = "created" hoặc "ready" và chưa có driver
            List<String> availableStatuses = List.of("created", "ready");
            List<Orders> orders = orderRepository.findByDriverIdIsNullAndStatusIn(availableStatuses);
            
            // Convert to DTO
            List<OrderDTO> orderDTOs = new ArrayList<>();
            for (Orders order : orders) {
                OrderDTO dto = orderService.getOrderByIdAsDTO(order.getId());
                if (dto != null) {
                    orderDTOs.add(dto);
                }
            }
            return orderDTOs;
        } catch (Exception e) {
            System.err.println("Error getting available orders: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Lấy danh sách đơn hàng đang giao của driver
     */
    public List<OrderDTO> getActiveOrders() {
        try {
            int driverId = getCurrentDriverId();
            // Đơn hàng có status = "accepted", "picked_up" hoặc "delivering"
            List<String> activeStatuses = List.of("accepted", "picked_up", "delivering");
            List<OrderDTO> orderDTOs = new ArrayList<>();
            
            for (String status : activeStatuses) {
                List<Orders> orders = orderRepository.findByDriverIdAndStatus(driverId, status);
                for (Orders order : orders) {
                    OrderDTO dto = orderService.getOrderByIdAsDTO(order.getId());
                    if (dto != null) {
                        orderDTOs.add(dto);
                    }
                }
            }
            return orderDTOs;
        } catch (Exception e) {
            System.err.println("Error getting active orders: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Driver nhận đơn hàng
     */
    @Transactional
    public OrderDTO acceptOrder(int orderId) {
        try {
            int driverId = getCurrentDriverId();
            
            Optional<Orders> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                throw new RuntimeException("Order not found: " + orderId);
            }
            
            Orders order = orderOpt.get();
            
            // Kiểm tra đơn hàng đã có driver chưa
            if (order.getDriver() != null) {
                throw new RuntimeException("Order already has a driver");
            }
            
            // Kiểm tra status hợp lệ
            if (!order.getStatus().equals("created") && !order.getStatus().equals("ready")) {
                throw new RuntimeException("Order status is not available for acceptance: " + order.getStatus());
            }
            
            // Set driver
            Users driver = userReponsitory.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Driver not found: " + driverId));
            order.setDriver(driver);
            order.setStatus("accepted");
            order.setAcceptedAt(new Date());
            
            order = orderRepository.save(order);
            
            return orderService.getOrderByIdAsDTO(order.getId());
        } catch (Exception e) {
            System.err.println("Error accepting order: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    @Transactional
    public OrderDTO updateOrderStatus(int orderId, String status) {
        try {
            int driverId = getCurrentDriverId();
            
            Optional<Orders> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                throw new RuntimeException("Order not found: " + orderId);
            }
            
            Orders order = orderOpt.get();
            
            // Kiểm tra driver có quyền cập nhật đơn này không
            if (order.getDriver() == null || order.getDriver().getId() != driverId) {
                throw new RuntimeException("Driver does not have permission to update this order");
            }
            
            // Cập nhật status và timestamp tương ứng
            order.setStatus(status);
            Date now = new Date();
            
            switch (status) {
                case "picked_up":
                    order.setPickedUpAt(now);
                    break;
                case "delivered":
                    order.setDeliveredAt(now);
                    break;
                default:
                    // Không cần cập nhật timestamp cho các status khác
                    break;
            }
            
            order = orderRepository.save(order);
            
            return orderService.getOrderByIdAsDTO(order.getId());
        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Lịch sử giao hàng của driver
     */
    public Page<OrderDTO> getDeliveryHistory(Pageable pageable) {
        try {
            int driverId = getCurrentDriverId();
            Page<Orders> ordersPage = orderRepository.findByDriverIdOrderByCreateDateDesc(driverId, pageable);
            
            // Convert Page<Orders> to Page<OrderDTO>
            List<OrderDTO> orderDTOs = new ArrayList<>();
            for (Orders order : ordersPage.getContent()) {
                try {
                    OrderDTO dto = orderService.getOrderByIdAsDTO(order.getId());
                    if (dto != null) {
                        orderDTOs.add(dto);
                    }
                } catch (Exception e) {
                    System.err.println("Error converting order " + order.getId() + " to DTO: " + e.getMessage());
                }
            }
            
            return new PageImpl<>(orderDTOs, pageable, ordersPage.getTotalElements());
        } catch (Exception e) {
            System.err.println("Error getting delivery history: " + e.getMessage());
            e.printStackTrace();
            return Page.empty();
        }
    }

    /**
     * Thống kê của driver
     */
    public DriverStatisticsDTO getStatistics(Date date) {
        try {
            int driverId = getCurrentDriverId();
            if (date == null) {
                date = new Date();
            }
            
            DriverStatisticsDTO stats = new DriverStatisticsDTO();
            
            // Đếm đơn hàng hôm nay
            long todayOrdersCount = orderRepository.countOrdersByDriverAndDate(driverId, date);
            stats.setTodayOrders((int) todayOrdersCount);
            
            // Đếm đơn hàng đang giao
            List<String> activeStatuses = List.of("accepted", "picked_up", "delivering");
            int activeCount = 0;
            for (String status : activeStatuses) {
                activeCount += orderRepository.findByDriverIdAndStatus(driverId, status).size();
            }
            stats.setActiveOrders(activeCount);
            
            // Tính thu nhập hôm nay (từ shipping_fee - phí ship cho shipper)
            Long todayEarnings = orderRepository.sumShippingFeeByDriverAndDate(driverId, date);
            stats.setTodayEarnings(todayEarnings != null ? todayEarnings : 0L);
            
            // Tổng số đơn đã giao
            List<Orders> deliveredOrders = orderRepository.findByDriverIdAndStatus(driverId, "delivered");
            stats.setTotalDeliveries(deliveredOrders.size());
            
            // Average rating - tính từ orders (nếu có rating field trong orders)
            // Hiện tại chưa có rating_driver table, nên tạm thời tính từ số đơn đã giao thành công
            // Có thể cải thiện sau bằng cách tạo RatingDriver entity
            if (deliveredOrders.size() > 0) {
                // Tạm thời: rating = 4.5 nếu có > 10 đơn, 4.0 nếu có > 5 đơn, 3.5 nếu có > 0 đơn
                // Hoặc có thể tính từ feedback/rating từ users (cần implement RatingDriver)
                double rating = deliveredOrders.size() >= 10 ? 4.5 : 
                               deliveredOrders.size() >= 5 ? 4.0 : 3.5;
                stats.setAverageRating(rating);
            } else {
                stats.setAverageRating(0.0);
            }
            
            return stats;
        } catch (Exception e) {
            System.err.println("Error getting driver statistics: " + e.getMessage());
            e.printStackTrace();
            return new DriverStatisticsDTO();
        }
    }
}

