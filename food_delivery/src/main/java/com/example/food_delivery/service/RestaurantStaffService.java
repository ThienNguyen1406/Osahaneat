package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.domain.entity.Orders;
import com.example.food_delivery.domain.entity.RestaurantStaff;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.response.DailyRevenueDTO;
import com.example.food_delivery.dto.response.MenuDTO;
import com.example.food_delivery.dto.response.OrderDTO;
import com.example.food_delivery.reponsitory.FoodRepository;
import com.example.food_delivery.reponsitory.OrderRepository;
import com.example.food_delivery.reponsitory.RestaurantStaffRepository;
import com.example.food_delivery.reponsitory.UserReponsitory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class RestaurantStaffService {

    @Autowired
    private RestaurantStaffRepository restaurantStaffRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private UserReponsitory userReponsitory;

    @Autowired
    private OrderService orderService;

    @Autowired
    private com.example.food_delivery.mapper.FoodMapper foodMapper;

    /**
     * Lấy ID của staff hiện tại từ SecurityContext
     */
    private int getCurrentStaffId() {
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
     * Lấy restaurant_id của staff
     */
    private int getRestaurantIdByStaffId(int staffId) {
        System.out.println("=== getRestaurantIdByStaffId ===");
        System.out.println("Staff ID: " + staffId);
        
        Optional<RestaurantStaff> staffOpt = restaurantStaffRepository.findByUserId(staffId);
        if (staffOpt.isEmpty()) {
            System.err.println("❌ Staff not found in restaurant_staff table for user ID: " + staffId);
            throw new RuntimeException("Staff not found or not assigned to any restaurant. User ID: " + staffId);
        }
        
        RestaurantStaff staff = staffOpt.get();
        System.out.println("✅ Staff found - ID: " + staff.getId() + ", Active: " + staff.isActive());
        
        if (!staff.isActive()) {
            System.err.println("❌ Staff is not active");
            throw new RuntimeException("Staff is not active");
        }
        
        if (staff.getRestaurant() == null) {
            System.err.println("❌ Staff has no restaurant assigned");
            throw new RuntimeException("Staff has no restaurant assigned");
        }
        
        int restaurantId = staff.getRestaurant().getId();
        System.out.println("✅ Restaurant ID: " + restaurantId + " (Title: " + 
                         (staff.getRestaurant().getTitle() != null ? staff.getRestaurant().getTitle() : "N/A") + ")");
        return restaurantId;
    }

    /**
     * Lấy đơn hàng của nhà hàng mà staff thuộc về
     * Đảm bảo staff chỉ thấy đơn hàng của nhà hàng mà họ thuộc về
     */
    public List<OrderDTO> getRestaurantOrders(String status) {
        try {
            int staffId = getCurrentStaffId();
            int restaurantId = getRestaurantIdByStaffId(staffId);
            
            System.out.println("=== getRestaurantOrders ===");
            System.out.println("Staff ID: " + staffId);
            System.out.println("Restaurant ID: " + restaurantId);
            System.out.println("Status filter: " + status);
            
            List<Orders> orders;
            if (status != null && !status.trim().isEmpty()) {
                orders = orderRepository.findByRestaurantIdAndStatus(restaurantId, status.trim());
            } else {
                orders = orderRepository.findByRestaurantId(restaurantId);
            }
            
            System.out.println("Found " + orders.size() + " orders for restaurant " + restaurantId);
            
            // Convert to DTO và đảm bảo đơn hàng thuộc về nhà hàng đúng
            List<OrderDTO> orderDTOs = new ArrayList<>();
            for (Orders order : orders) {
                // Double check: đảm bảo đơn hàng thuộc về nhà hàng của staff
                if (order.getRestaurant() == null) {
                    System.err.println("Warning: Order " + order.getId() + " has no restaurant!");
                    continue;
                }
                
                if (order.getRestaurant().getId() != restaurantId) {
                    System.err.println("Warning: Order " + order.getId() + " belongs to restaurant " + 
                                     order.getRestaurant().getId() + " but staff belongs to restaurant " + restaurantId);
                    continue;
                }
                
                OrderDTO dto = orderService.getOrderByIdAsDTO(order.getId());
                if (dto != null) {
                    orderDTOs.add(dto);
                }
            }
            
            System.out.println("Returning " + orderDTOs.size() + " order DTOs");
            return orderDTOs;
        } catch (Exception e) {
            System.err.println("Error getting restaurant orders: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng
     * Đảm bảo staff chỉ có thể cập nhật đơn hàng của nhà hàng mà họ thuộc về
     */
    @Transactional
    public OrderDTO updateOrderStatus(int orderId, String status) {
        try {
            int staffId = getCurrentStaffId();
            int restaurantId = getRestaurantIdByStaffId(staffId);
            
            System.out.println("=== updateOrderStatus ===");
            System.out.println("Staff ID: " + staffId);
            System.out.println("Restaurant ID: " + restaurantId);
            System.out.println("Order ID: " + orderId);
            System.out.println("New Status: " + status);
            
            Optional<Orders> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                throw new RuntimeException("Order not found: " + orderId);
            }
            
            Orders order = orderOpt.get();
            
            // Kiểm tra đơn hàng có thuộc về nhà hàng không
            if (order.getRestaurant() == null) {
                throw new RuntimeException("Order " + orderId + " does not belong to any restaurant");
            }
            
            // Kiểm tra đơn hàng thuộc về nhà hàng của staff
            if (order.getRestaurant().getId() != restaurantId) {
                throw new RuntimeException("Order " + orderId + " does not belong to staff's restaurant. " +
                                         "Order belongs to restaurant " + order.getRestaurant().getId() + 
                                         " but staff belongs to restaurant " + restaurantId);
            }
            
            // Validate status
            List<String> validStatuses = List.of("created", "processing", "ready", "completed", "cancelled");
            if (!validStatuses.contains(status)) {
                throw new RuntimeException("Invalid status: " + status + ". Valid statuses: " + validStatuses);
            }
            
            // Cập nhật status và timestamp tương ứng
            String oldStatus = order.getStatus();
            order.setStatus(status);
            Date now = new Date();
            
            switch (status) {
                case "processing":
                    if (order.getProcessingStartedAt() == null) {
                        order.setProcessingStartedAt(now);
                    }
                    break;
                case "ready":
                    if (order.getReadyAt() == null) {
                        order.setReadyAt(now);
                    }
                    break;
                case "completed":
                    if (order.getDeliveredAt() == null) {
                        order.setDeliveredAt(now);
                    }
                    break;
                case "cancelled":
                    // Có thể thêm cancelledAt nếu cần
                    break;
                default:
                    break;
            }
            
            order = orderRepository.save(order);
            
            System.out.println("Order " + orderId + " status updated from " + oldStatus + " to " + status);
            
            return orderService.getOrderByIdAsDTO(order.getId());
        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Bật/tắt món ăn
     */
    @Transactional
    public MenuDTO toggleMenuAvailability(int menuId, boolean isAvailable) {
        try {
            int staffId = getCurrentStaffId();
            int restaurantId = getRestaurantIdByStaffId(staffId);
            
            Optional<Food> foodOpt = foodRepository.findById(menuId);
            if (foodOpt.isEmpty()) {
                throw new RuntimeException("Menu not found: " + menuId);
            }
            
            Food food = foodOpt.get();
            
            // Kiểm tra món thuộc về nhà hàng của staff (kiểm tra qua MenuRestaurant)
            // Food -> Category -> MenuRestaurant -> Restaurant
            boolean belongsToRestaurant = false;
            if (food.getCategory() != null && food.getCategory().getLisMenuRestaurant() != null) {
                for (com.example.food_delivery.domain.entity.MenuRestaurant menuRestaurant : 
                        food.getCategory().getLisMenuRestaurant()) {
                    if (menuRestaurant.getRestaurant() != null && 
                        menuRestaurant.getRestaurant().getId() == restaurantId) {
                        belongsToRestaurant = true;
                        break;
                    }
                }
            }
            
            if (!belongsToRestaurant) {
                throw new RuntimeException("Menu does not belong to staff's restaurant");
            }
            
            food.setAvailable(isAvailable);
            food = foodRepository.save(food);
            
            // Convert to MenuDTO
            MenuDTO menuDTO = foodMapper.toDTO(food);
            
            // Ensure isAvailable is set in MenuDTO (MapStruct might not map it automatically)
            menuDTO.setAvailable(food.isAvailable());
            
            return menuDTO;
        } catch (Exception e) {
            System.err.println("Error toggling menu availability: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Doanh thu ngày
     */
    public DailyRevenueDTO getDailyRevenue(Date date) {
        try {
            int staffId = getCurrentStaffId();
            int restaurantId = getRestaurantIdByStaffId(staffId);
            
            if (date == null) {
                date = new Date();
            }
            
            System.out.println("=== getDailyRevenue ===");
            System.out.println("Staff ID: " + staffId);
            System.out.println("Restaurant ID: " + restaurantId);
            System.out.println("Date: " + date);
            
            // Tính doanh thu từ đơn hàng đã giao trong ngày
            Long revenue = orderRepository.sumRevenueByRestaurantAndDate(restaurantId, date);
            if (revenue == null) {
                revenue = 0L;
            }
            System.out.println("Revenue from query: " + revenue);
            
            // Đếm số đơn hàng đã delivered trong ngày (để match với revenue)
            List<Orders> allOrders = orderRepository.findOrdersByRestaurantAndDate(restaurantId, date);
            System.out.println("Total orders in date: " + allOrders.size());
            
            // Lọc các đơn hàng đã delivered hoặc completed
            List<Orders> deliveredOrders = allOrders.stream()
                .filter(o -> "delivered".equalsIgnoreCase(o.getStatus()) || 
                            "completed".equalsIgnoreCase(o.getStatus()))
                .collect(java.util.stream.Collectors.toList());
            
            int orderCount = deliveredOrders.size();
            System.out.println("Delivered/Completed orders: " + orderCount);
            
            // Nếu không có đơn hàng delivered, tính từ tất cả đơn hàng trong ngày
            if (orderCount == 0 && allOrders.size() > 0) {
                System.out.println("No delivered orders, calculating from all orders");
                revenue = 0L;
                for (Orders order : allOrders) {
                    if (order.getTotalPrice() != null) {
                        revenue += order.getTotalPrice();
                    }
                }
                orderCount = allOrders.size();
            }
            
            // Tính giá trị đơn hàng trung bình
            long averageOrderValue = orderCount > 0 ? revenue / orderCount : 0L;
            
            System.out.println("Final revenue: " + revenue);
            System.out.println("Final order count: " + orderCount);
            System.out.println("Average order value: " + averageOrderValue);
            
            return new DailyRevenueDTO(revenue, orderCount, averageOrderValue);
        } catch (Exception e) {
            System.err.println("Error getting daily revenue: " + e.getMessage());
            e.printStackTrace();
            return new DailyRevenueDTO(0L, 0, 0L);
        }
    }

    /**
     * Lấy menu của nhà hàng mà staff thuộc về
     */
    public List<MenuDTO> getRestaurantMenu() {
        try {
            int staffId = getCurrentStaffId();
            int restaurantId = getRestaurantIdByStaffId(staffId);
            
            // Lấy tất cả foods thuộc về restaurant qua MenuRestaurant
            // Food -> Category -> MenuRestaurant -> Restaurant
            List<Food> allFoods = foodRepository.findAll();
            List<MenuDTO> menuDTOs = new ArrayList<>();
            
            for (Food food : allFoods) {
                // Kiểm tra food có thuộc về restaurant của staff không
                if (food.getCategory() != null && food.getCategory().getLisMenuRestaurant() != null) {
                    for (com.example.food_delivery.domain.entity.MenuRestaurant menuRestaurant : 
                            food.getCategory().getLisMenuRestaurant()) {
                        if (menuRestaurant.getRestaurant() != null && 
                            menuRestaurant.getRestaurant().getId() == restaurantId) {
                            // Food thuộc về restaurant của staff
                            MenuDTO menuDTO = foodMapper.toDTO(food);
                            
                            // Set isAvailable field from Food entity (MapStruct might not map it automatically)
                            menuDTO.setAvailable(food.isAvailable());
                            
                            menuDTOs.add(menuDTO);
                            break; // Chỉ thêm một lần
                        }
                    }
                }
            }
            
            return menuDTOs;
        } catch (Exception e) {
            System.err.println("Error getting restaurant menu: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}

