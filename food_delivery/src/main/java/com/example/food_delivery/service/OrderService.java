package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.*;
import com.example.food_delivery.domain.entity.keys.KeyOrderItem;
import com.example.food_delivery.dto.request.OrderRequest;
import com.example.food_delivery.dto.response.CartDTO;
import com.example.food_delivery.dto.response.CartItemDTO;
import com.example.food_delivery.dto.response.OrderDTO;
import com.example.food_delivery.dto.response.OrderItemDTO;
import com.example.food_delivery.reponsitory.*;
import com.example.food_delivery.service.imp.CartServiceImp;
import com.example.food_delivery.service.imp.OrderServiceImp;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class OrderService implements OrderServiceImp {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    OrderItemRepository orderItemRepository;
    
    @Autowired
    CartServiceImp cartService;
    
    @Autowired
    FoodRepository foodRepository;
    
    @Autowired
    CategoryRepository categoryRepository;

    @Transactional
    @Override
    public boolean insertOrder(OrderRequest orderRequest) {

        try {

            Restaurant restaurant = new Restaurant();
            restaurant.setId(orderRequest.getResId());

            Users users = new Users();
            users.setId(orderRequest.getUserId());

            // Calculate total price and shipping fee from food items
            long totalPrice = 0L;
            long totalShippingFee = 0L;
            for (int foodId : orderRequest.getFoodIds()) {
                Optional<Food> foodOpt = foodRepository.findById(foodId);
                if (foodOpt.isPresent()) {
                    Food food = foodOpt.get();
                    totalPrice += food.getPrice();
                    totalShippingFee += (long)food.getShippingFee(); // Add shipping fee for each item
                }
            }

            Orders orders = new Orders();
            orders.setUsers(users);
            orders.setRestaurant(restaurant);
            orders.setCreateDate(new Date());
            orders.setStatus("created"); // Set default status
            orders.setTotalPrice(totalPrice); // Set total price
            orders.setShippingFee(totalShippingFee); // Set total shipping fee for shipper
            orders.setPaymentMethod(null); // Will be set when payment is processed
            orders.setPaymentStatus("PENDING"); // Default payment status
            orderRepository.save(orders);

            List<OrderItem> orderItems = new ArrayList<>();
            for (int foodId : orderRequest.getFoodIds()) {

                Food food = new Food();
                food.setId(foodId);

                OrderItem orderItem = new OrderItem();
                KeyOrderItem keyOrderItem = new KeyOrderItem(orders.getId(), foodId);
                orderItem.setKeyOrderItem(keyOrderItem);
                orderItem.setCreateDate(new Date());
                orderItems.add(orderItem);
            }
            orderItemRepository.saveAll(orderItems);

            return true;
        } catch (Exception e) {
            System.out.println("Error insert order" + e);
            return false;
        }
    }

    @Override
    public List<Orders> getAllOrders() {
        try {
            return orderRepository.findAll();
        } catch (Exception e) {
            System.err.println("Error getting all orders: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Transactional
    @Override
    public List<OrderDTO> getAllOrdersAsDTO() {
        try {
            System.out.println("=== getAllOrdersAsDTO() called ===");
            
            // Get all orders with eagerly loaded relationships
            List<Orders> orders = orderRepository.findAllWithRelations();
            System.out.println("Found " + orders.size() + " total orders");
            
            // Convert to DTOs
            List<OrderDTO> orderDTOs = new ArrayList<>();
            for (Orders order : orders) {
                try {
                    OrderDTO orderDTO = new OrderDTO();
                    orderDTO.setId(order.getId());
                    orderDTO.setCreateDate(order.getCreateDate());
                orderDTO.setStatus(order.getStatus());
                orderDTO.setTotalPrice(order.getTotalPrice());
                orderDTO.setPaymentMethod(order.getPaymentMethod());
                orderDTO.setPaymentStatus(order.getPaymentStatus());
                orderDTO.setPaymentIntentId(order.getPaymentIntentId());
                orderDTO.setTransactionId(order.getTransactionId());
                    
                    // User info
                    if (order.getUsers() != null) {
                        orderDTO.setUserId(order.getUsers().getId());
                        orderDTO.setUserName(order.getUsers().getUserName() != null ? order.getUsers().getUserName() : "");
                        orderDTO.setUserFullName(order.getUsers().getFullName() != null ? order.getUsers().getFullName() : "");
                        orderDTO.setUserEmail(order.getUsers().getEmail() != null ? order.getUsers().getEmail() : "");
                        orderDTO.setUserAvatar(order.getUsers().getAvatar() != null ? order.getUsers().getAvatar() : "");
                        orderDTO.setUserPhoneNumber(order.getUsers().getPhoneNumber() != null ? order.getUsers().getPhoneNumber() : "");
                    } else {
                        orderDTO.setUserId(0);
                        orderDTO.setUserName("");
                        orderDTO.setUserFullName("");
                        orderDTO.setUserEmail("");
                        orderDTO.setUserAvatar("");
                        orderDTO.setUserPhoneNumber("");
                    }
                    
                    // Delivery info
                    orderDTO.setDeliveryAddress(order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "");
                    orderDTO.setDeliveryFee(order.getDeliveryFee() != null ? order.getDeliveryFee() : 0L);
                    orderDTO.setShippingFee(order.getShippingFee() != null ? order.getShippingFee() : 0L);
                    
                    // Location info
                    orderDTO.setUserLat(order.getUserLat());
                    orderDTO.setUserLng(order.getUserLng());
                    orderDTO.setShipperLat(order.getShipperLat());
                    orderDTO.setShipperLng(order.getShipperLng());
                    
                    // Restaurant info
                    if (order.getRestaurant() != null) {
                        orderDTO.setRestaurantId(order.getRestaurant().getId());
                        orderDTO.setRestaurantTitle(order.getRestaurant().getTitle() != null ? order.getRestaurant().getTitle() : "");
                    } else {
                        orderDTO.setRestaurantId(0);
                        orderDTO.setRestaurantTitle("");
                    }
                    
                    // Order items - fetch from OrderItemRepository
                    List<OrderItemDTO> itemDTOs = new ArrayList<>();
                    try {
                        // Get order items by order ID using key
                        List<OrderItem> orderItems = orderItemRepository.findAll().stream()
                                .filter(item -> item.getKeyOrderItem() != null && 
                                        item.getKeyOrderItem().getOrderId() == order.getId())
                                .toList();
                        
                        System.out.println("Order " + order.getId() + " has " + orderItems.size() + " items");
                        
                        // Group by foodId and count quantity
                        Map<Integer, Integer> foodQuantityMap = new HashMap<>();
                        Map<Integer, OrderItem> foodItemMap = new HashMap<>();
                        
                        for (OrderItem orderItem : orderItems) {
                            if (orderItem.getFood() != null) {
                                int foodId = orderItem.getFood().getId();
                                foodQuantityMap.put(foodId, foodQuantityMap.getOrDefault(foodId, 0) + 1);
                                if (!foodItemMap.containsKey(foodId)) {
                                    foodItemMap.put(foodId, orderItem);
                                }
                            }
                        }
                        
                        // Create DTOs from grouped items
                        for (Map.Entry<Integer, Integer> entry : foodQuantityMap.entrySet()) {
                            int foodId = entry.getKey();
                            int quantity = entry.getValue();
                            OrderItem orderItem = foodItemMap.get(foodId);
                            
                            OrderItemDTO itemDTO = new OrderItemDTO();
                            itemDTO.setOrderId(order.getId());
                            itemDTO.setCreateDate(orderItem.getCreateDate());
                            
                            Food food = orderItem.getFood();
                            itemDTO.setFoodId(food.getId());
                            itemDTO.setFoodTitle(food.getTitle());
                            itemDTO.setFoodPrice(food.getPrice());
                            itemDTO.setQuantity(quantity);
                            
                            // Convert image filename to full URL
                            if (food.getImage() != null && !food.getImage().isEmpty()) {
                                // If image path starts with "images/", serve directly from /images/
                                if (food.getImage().startsWith("images/")) {
                                    itemDTO.setFoodImage("/" + food.getImage());
                                } else {
                                    itemDTO.setFoodImage("/menu/file/" + food.getImage());
                                }
                            } else {
                                itemDTO.setFoodImage(food.getImage());
                            }
                            
                            itemDTOs.add(itemDTO);
                        }
                    } catch (Exception e) {
                        System.err.println("Error fetching order items for order " + order.getId() + ": " + e.getMessage());
                        e.printStackTrace();
                    }
                    orderDTO.setItems(itemDTOs);
                    // Set total quantity
                    orderDTO.setTotalQuantity(itemDTOs.size());
                    
                    orderDTOs.add(orderDTO);
                } catch (Exception e) {
                    System.err.println("Error converting order " + order.getId() + " to DTO: " + e.getMessage());
                    e.printStackTrace();
                    // Continue with next order instead of failing completely
                }
            }
            
            System.out.println("Converted to " + orderDTOs.size() + " OrderDTOs");
            return orderDTOs;
        } catch (Exception e) {
            System.err.println("Error getting all orders as DTO: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to let controller handle it properly
        }
    }

    @Override
    public Optional<Orders> getOrderById(int id) {
        try {
            return orderRepository.findById(id);
        } catch (Exception e) {
            System.err.println("Error getting order by id: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }

    @Override
    @Transactional
    public OrderDTO getOrderByIdAsDTO(int id) {
        try {
            System.out.println("=== getOrderByIdAsDTO() called ===");
            System.out.println("Order ID: " + id);
            
            Optional<Orders> orderOptional = orderRepository.findById(id);
            if (!orderOptional.isPresent()) {
                System.out.println("Order not found with ID: " + id);
                return null;
            }
            
            Orders order = orderOptional.get();
            System.out.println("Found order: " + order.getId());
            
            // Convert to DTO
            OrderDTO orderDTO = new OrderDTO();
            orderDTO.setId(order.getId());
            orderDTO.setCreateDate(order.getCreateDate());
            orderDTO.setStatus(order.getStatus());
            orderDTO.setTotalPrice(order.getTotalPrice());
            orderDTO.setPaymentMethod(order.getPaymentMethod());
            orderDTO.setPaymentStatus(order.getPaymentStatus());
            orderDTO.setPaymentIntentId(order.getPaymentIntentId());
            orderDTO.setTransactionId(order.getTransactionId());
            
            // User info
            if (order.getUsers() != null) {
                orderDTO.setUserId(order.getUsers().getId());
                orderDTO.setUserName(order.getUsers().getUserName() != null ? order.getUsers().getUserName() : "");
                orderDTO.setUserFullName(order.getUsers().getFullName() != null ? order.getUsers().getFullName() : "");
                orderDTO.setUserEmail(order.getUsers().getEmail() != null ? order.getUsers().getEmail() : "");
                orderDTO.setUserAvatar(order.getUsers().getAvatar() != null ? order.getUsers().getAvatar() : "");
                orderDTO.setUserPhoneNumber(order.getUsers().getPhoneNumber() != null ? order.getUsers().getPhoneNumber() : "");
            } else {
                orderDTO.setUserId(0);
                orderDTO.setUserName("");
                orderDTO.setUserFullName("");
                orderDTO.setUserEmail("");
                orderDTO.setUserAvatar("");
                orderDTO.setUserPhoneNumber("");
            }
            
            // Delivery info
            orderDTO.setDeliveryAddress(order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "");
            orderDTO.setDeliveryFee(order.getDeliveryFee() != null ? order.getDeliveryFee() : 0L);
            orderDTO.setShippingFee(order.getShippingFee() != null ? order.getShippingFee() : 0L);
            
            // Location info
            orderDTO.setUserLat(order.getUserLat());
            orderDTO.setUserLng(order.getUserLng());
            orderDTO.setShipperLat(order.getShipperLat());
            orderDTO.setShipperLng(order.getShipperLng());
            
            // Restaurant info
            if (order.getRestaurant() != null) {
                orderDTO.setRestaurantId(order.getRestaurant().getId());
                orderDTO.setRestaurantTitle(order.getRestaurant().getTitle() != null ? order.getRestaurant().getTitle() : "");
            } else {
                orderDTO.setRestaurantId(0);
                orderDTO.setRestaurantTitle("");
            }
            
            // Order items - fetch from OrderItemRepository
            List<OrderItemDTO> itemDTOs = new ArrayList<>();
            try {
                // Get order items by order ID using key
                List<OrderItem> orderItems = orderItemRepository.findAll().stream()
                        .filter(item -> item.getKeyOrderItem() != null && 
                                item.getKeyOrderItem().getOrderId() == order.getId())
                        .toList();
                
                System.out.println("Order " + order.getId() + " has " + orderItems.size() + " items");
                
                // Group by foodId and count quantity
                Map<Integer, Integer> foodQuantityMap = new HashMap<>();
                Map<Integer, OrderItem> foodItemMap = new HashMap<>();
                
                for (OrderItem orderItem : orderItems) {
                    if (orderItem.getFood() != null) {
                        int foodId = orderItem.getFood().getId();
                        foodQuantityMap.put(foodId, foodQuantityMap.getOrDefault(foodId, 0) + 1);
                        if (!foodItemMap.containsKey(foodId)) {
                            foodItemMap.put(foodId, orderItem);
                        }
                    }
                }
                
                // Create DTOs from grouped items
                for (Map.Entry<Integer, Integer> entry : foodQuantityMap.entrySet()) {
                    int foodId = entry.getKey();
                    int quantity = entry.getValue();
                    OrderItem orderItem = foodItemMap.get(foodId);
                    
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setOrderId(order.getId());
                    itemDTO.setCreateDate(orderItem.getCreateDate());
                    
                    Food food = orderItem.getFood();
                    itemDTO.setFoodId(food.getId());
                    itemDTO.setFoodTitle(food.getTitle());
                    itemDTO.setFoodPrice(food.getPrice());
                    itemDTO.setQuantity(quantity);
                    
                    // Convert image filename to full URL
                    if (food.getImage() != null && !food.getImage().isEmpty()) {
                        itemDTO.setFoodImage("/menu/file/" + food.getImage());
                    } else {
                        itemDTO.setFoodImage(food.getImage());
                    }
                    
                    itemDTOs.add(itemDTO);
                }
            } catch (Exception e) {
                System.err.println("Error fetching order items for order " + order.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
            orderDTO.setItems(itemDTOs);
            // Set total quantity
            orderDTO.setTotalQuantity(itemDTOs.size());
            
            System.out.println("Converted order " + id + " to OrderDTO successfully");
            return orderDTO;
        } catch (Exception e) {
            System.err.println("Error getting order by id as DTO: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<Orders> getOrdersByUserId(int userId) {
        try {
            // Note: Cần thêm method findByUserId vào OrderRepository nếu muốn filter theo user
            // Hiện tại trả về tất cả orders và filter ở service
            List<Orders> allOrders = orderRepository.findAll();
            return allOrders.stream()
                    .filter(order -> order.getUsers() != null && order.getUsers().getId() == userId)
                    .toList();
        } catch (Exception e) {
            System.err.println("Error getting orders by user id: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    @Override
    public List<OrderDTO> getOrdersByUserIdAsDTO(int userId) {
        try {
            System.out.println("=== getOrdersByUserIdAsDTO() called ===");
            System.out.println("UserId: " + userId);
            
            // Get orders as entities
            List<Orders> orders = getOrdersByUserId(userId);
            System.out.println("Found " + orders.size() + " orders for user " + userId);
            
            // Convert to DTOs
            List<OrderDTO> orderDTOs = new ArrayList<>();
            for (Orders order : orders) {
                OrderDTO orderDTO = new OrderDTO();
                orderDTO.setId(order.getId());
                orderDTO.setCreateDate(order.getCreateDate());
                orderDTO.setStatus(order.getStatus() != null ? order.getStatus() : "created");
                orderDTO.setTotalPrice(order.getTotalPrice() != null ? order.getTotalPrice() : 0L);
                
                // User info
                if (order.getUsers() != null) {
                    orderDTO.setUserId(order.getUsers().getId());
                    orderDTO.setUserName(order.getUsers().getUserName() != null ? order.getUsers().getUserName() : "");
                    orderDTO.setUserFullName(order.getUsers().getFullName() != null ? order.getUsers().getFullName() : "");
                    orderDTO.setUserEmail(order.getUsers().getEmail() != null ? order.getUsers().getEmail() : "");
                    orderDTO.setUserAvatar(order.getUsers().getAvatar() != null ? order.getUsers().getAvatar() : "");
                    orderDTO.setUserPhoneNumber(order.getUsers().getPhoneNumber() != null ? order.getUsers().getPhoneNumber() : "");
                } else {
                    orderDTO.setUserId(0);
                    orderDTO.setUserName("");
                    orderDTO.setUserFullName("");
                    orderDTO.setUserEmail("");
                    orderDTO.setUserAvatar("");
                    orderDTO.setUserPhoneNumber("");
                }
                
                // Delivery info
                orderDTO.setDeliveryAddress(order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "");
                orderDTO.setDeliveryFee(order.getDeliveryFee() != null ? order.getDeliveryFee() : 0L);
                orderDTO.setShippingFee(order.getShippingFee() != null ? order.getShippingFee() : 0L);
                
                // Location info
                orderDTO.setUserLat(order.getUserLat());
                orderDTO.setUserLng(order.getUserLng());
                orderDTO.setShipperLat(order.getShipperLat());
                orderDTO.setShipperLng(order.getShipperLng());
                
                // Restaurant info
                if (order.getRestaurant() != null) {
                    orderDTO.setRestaurantId(order.getRestaurant().getId());
                    orderDTO.setRestaurantTitle(order.getRestaurant().getTitle() != null ? order.getRestaurant().getTitle() : "");
                } else {
                    orderDTO.setRestaurantId(0);
                    orderDTO.setRestaurantTitle("");
                }
                
                // Payment info
                orderDTO.setPaymentMethod(order.getPaymentMethod());
                orderDTO.setPaymentStatus(order.getPaymentStatus());
                orderDTO.setPaymentIntentId(order.getPaymentIntentId());
                orderDTO.setTransactionId(order.getTransactionId());
                
                // Order items - fetch from OrderItemRepository
                List<OrderItemDTO> itemDTOs = new ArrayList<>();
                try {
                    // Get order items by order ID using key
                    List<OrderItem> orderItems = orderItemRepository.findAll().stream()
                            .filter(item -> item.getKeyOrderItem() != null && 
                                    item.getKeyOrderItem().getOrderId() == order.getId())
                            .toList();
                    
                    System.out.println("Order " + order.getId() + " has " + orderItems.size() + " items");
                    
                    // Group by foodId and count quantity
                    Map<Integer, Integer> foodQuantityMap = new HashMap<>();
                    Map<Integer, OrderItem> foodItemMap = new HashMap<>();
                    
                    for (OrderItem orderItem : orderItems) {
                        if (orderItem.getFood() != null) {
                            int foodId = orderItem.getFood().getId();
                            foodQuantityMap.put(foodId, foodQuantityMap.getOrDefault(foodId, 0) + 1);
                            if (!foodItemMap.containsKey(foodId)) {
                                foodItemMap.put(foodId, orderItem);
                            }
                        }
                    }
                    
                    // Create DTOs from grouped items
                    for (Map.Entry<Integer, Integer> entry : foodQuantityMap.entrySet()) {
                        int foodId = entry.getKey();
                        int quantity = entry.getValue();
                        OrderItem orderItem = foodItemMap.get(foodId);
                        
                        OrderItemDTO itemDTO = new OrderItemDTO();
                        itemDTO.setOrderId(order.getId());
                        itemDTO.setCreateDate(orderItem.getCreateDate());
                        
                        Food food = orderItem.getFood();
                        itemDTO.setFoodId(food.getId());
                        itemDTO.setFoodTitle(food.getTitle());
                        itemDTO.setFoodPrice(food.getPrice());
                        itemDTO.setQuantity(quantity);
                        
                        // Convert image filename to full URL
                        if (food.getImage() != null && !food.getImage().isEmpty()) {
                            itemDTO.setFoodImage("/menu/file/" + food.getImage());
                        } else {
                            itemDTO.setFoodImage(food.getImage());
                        }
                        
                        itemDTOs.add(itemDTO);
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching order items for order " + order.getId() + ": " + e.getMessage());
                    e.printStackTrace();
                }
                orderDTO.setItems(itemDTOs);
                
                orderDTOs.add(orderDTO);
            }
            
            System.out.println("Converted to " + orderDTOs.size() + " OrderDTOs");
            return orderDTOs;
        } catch (Exception e) {
            System.err.println("Error getting orders by user id as DTO: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public boolean updateOrder(int id, String status) {
        try {
            System.out.println("=== OrderService.updateOrder() called ===");
            System.out.println("Order ID: " + id);
            System.out.println("Status: " + status);
            
            if (status == null || status.trim().isEmpty()) {
                System.err.println("Status is null or empty");
                return false;
            }
            
            Optional<Orders> orderOptional = orderRepository.findById(id);
            if (orderOptional.isEmpty()) {
                System.err.println("Order not found with ID: " + id);
                return false;
            }
            
            Orders order = orderOptional.get();
            if (order == null) {
                System.err.println("Order object is null");
                return false;
            }
            
            // Validate status value
            String validStatus = status.trim().toLowerCase();
            if (!validStatus.equals("created") && !validStatus.equals("processing") && 
                !validStatus.equals("delivered") && !validStatus.equals("cancelled")) {
                System.err.println("Invalid status value: " + status + " (valid values: created, processing, delivered, cancelled)");
                return false;
            }
            
            // Update status
            order.setStatus(validStatus);
            orderRepository.save(order);
            
            System.out.println("✅ Order " + id + " status updated to: " + validStatus);
            return true;
        } catch (Exception e) {
            System.err.println("❌ Error updating order: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    @Transactional
    public boolean deleteOrder(int id) {
        try {
            Optional<Orders> orderOptional = orderRepository.findById(id);
            if (orderOptional.isPresent()) {
                // Xóa order items trước
                Orders order = orderOptional.get();
                if (order != null && order.getListOrderItems() != null && !order.getListOrderItems().isEmpty()) {
                    List<OrderItem> orderItems = new ArrayList<>(order.getListOrderItems());
                    orderItemRepository.deleteAll(orderItems);
                }
                // Sau đó xóa order
                if (order != null) {
                    orderRepository.delete(order);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error deleting order: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Checkout from cart - Tạo order từ cart và clear cart
     * @param userId - User ID
     * @return true nếu thành công, false nếu thất bại
     */
    @Override
    @Transactional
    public boolean checkoutFromCart(int userId) {
        try {
            System.out.println("=== checkoutFromCart() called ===");
            System.out.println("UserId: " + userId);
            
            // Validate userId
            if (userId <= 0) {
                System.err.println("❌ Invalid userId: " + userId);
                return false;
            }
            
            // Get cart from userId
            CartDTO cart = cartService.getCartByUserId(userId);
            if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                System.err.println("❌ Cart is empty or null for user: " + userId);
                return false;
            }
            
            System.out.println("✅ Cart found with " + cart.getItems().size() + " items");
            
            // Get restaurant ID from first cart item
            // Food → Category → MenuRestaurant → Restaurant
            int restaurantId = 1; // Default restaurant ID
            if (!cart.getItems().isEmpty()) {
                CartItemDTO firstItem = cart.getItems().get(0);
                int foodId = firstItem.getFoodId();
                
                // Find restaurant ID from food
                Optional<Food> foodOpt = foodRepository.findById(foodId);
                if (foodOpt.isPresent()) {
                    Food food = foodOpt.get();
                    if (food.getCategory() != null) {
                        Category category = food.getCategory();
                        // Find restaurant from category's menu_restaurant
                        if (category.getLisMenuRestaurant() != null && !category.getLisMenuRestaurant().isEmpty()) {
                            MenuRestaurant menuRestaurant = category.getLisMenuRestaurant().iterator().next();
                            if (menuRestaurant != null && menuRestaurant.getRestaurant() != null) {
                                restaurantId = menuRestaurant.getRestaurant().getId();
                                System.out.println("✅ Restaurant ID found: " + restaurantId);
                            }
                        }
                    }
                }
            }
            
            // Build foodIds array with quantity
            List<Integer> foodIdsList = new ArrayList<>();
            for (CartItemDTO item : cart.getItems()) {
                for (int i = 0; i < item.getQuantity(); i++) {
                    foodIdsList.add(item.getFoodId());
                }
            }
            int[] foodIds = foodIdsList.stream().mapToInt(i -> i).toArray();
            
            System.out.println("✅ Building order request - Restaurant ID: " + restaurantId + ", Food IDs count: " + foodIds.length);
            
            // Create order request
            OrderRequest orderRequest = new OrderRequest();
            orderRequest.setUserId(userId);
            orderRequest.setResId(restaurantId);
            orderRequest.setFoodIds(foodIds);
            
            // Create order
            boolean orderCreated = insertOrder(orderRequest);
            
            if (orderCreated) {
                System.out.println("✅ Order created successfully");
                
                // Clear cart after successful order
                boolean cartCleared = cartService.clearCart(userId);
                if (cartCleared) {
                    System.out.println("✅ Cart cleared after order");
                } else {
                    System.out.println("⚠️ Failed to clear cart after order");
                }
                
                return true;
            } else {
                System.err.println("❌ Failed to create order");
                return false;
            }
        } catch (Exception e) {
            System.err.println("❌ Error in checkoutFromCart: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    @Override
    @Transactional
    public int checkoutFromCartWithOrderId(int userId, String deliveryAddress, Double userLat, Double userLng) {
        try {
            System.out.println("=== checkoutFromCartWithOrderId() called ===");
            System.out.println("UserId: " + userId);
            System.out.println("DeliveryAddress: " + deliveryAddress);
            System.out.println("UserLat: " + userLat);
            System.out.println("UserLng: " + userLng);
            
            // Validate userId
            if (userId <= 0) {
                System.err.println("❌ Invalid userId: " + userId);
                return -1;
            }
            
            // Get cart from userId
            CartDTO cart = cartService.getCartByUserId(userId);
            if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                System.err.println("❌ Cart is empty or null for user: " + userId);
                return -1;
            }
            
            System.out.println("✅ Cart found with " + cart.getItems().size() + " items");
            
            // Get restaurant ID from cart items
            // Important: All items in cart should belong to the same restaurant
            int restaurantId = -1; // Use -1 to indicate not found
            Set<Integer> restaurantIds = new HashSet<>();
            
            for (CartItemDTO item : cart.getItems()) {
                int foodId = item.getFoodId();
                Optional<Food> foodOpt = foodRepository.findById(foodId);
                if (foodOpt.isPresent()) {
                    Food food = foodOpt.get();
                    if (food.getCategory() != null) {
                        Category category = food.getCategory();
                        if (category.getLisMenuRestaurant() != null && !category.getLisMenuRestaurant().isEmpty()) {
                            // Get all restaurants that have this category
                            for (MenuRestaurant menuRestaurant : category.getLisMenuRestaurant()) {
                                if (menuRestaurant != null && menuRestaurant.getRestaurant() != null) {
                                    restaurantIds.add(menuRestaurant.getRestaurant().getId());
                                }
                            }
                        }
                    }
                }
            }
            
            // If we found restaurants, use the first one (or validate all are same)
            if (!restaurantIds.isEmpty()) {
                if (restaurantIds.size() == 1) {
                    restaurantId = restaurantIds.iterator().next();
                    System.out.println("✅ Restaurant ID found (unique): " + restaurantId);
                } else {
                    // Multiple restaurants found - use first one but log warning
                    restaurantId = restaurantIds.iterator().next();
                    System.err.println("⚠️ WARNING: Cart contains items from multiple restaurants: " + restaurantIds);
                    System.err.println("⚠️ Using first restaurant ID: " + restaurantId);
                }
            } else {
                System.err.println("❌ ERROR: Could not determine restaurant ID from cart items!");
                System.err.println("❌ Using default restaurant ID: 1");
                restaurantId = 1; // Fallback to default
            }
            
            // Build foodIds array with quantity
            List<Integer> foodIdsList = new ArrayList<>();
            for (CartItemDTO item : cart.getItems()) {
                for (int i = 0; i < item.getQuantity(); i++) {
                    foodIdsList.add(item.getFoodId());
                }
            }
            int[] foodIds = foodIdsList.stream().mapToInt(i -> i).toArray();
            
            System.out.println("✅ Building order request - Restaurant ID: " + restaurantId + ", Food IDs count: " + foodIds.length);
            
            // Create order request
            OrderRequest orderRequest = new OrderRequest();
            orderRequest.setUserId(userId);
            orderRequest.setResId(restaurantId);
            orderRequest.setFoodIds(foodIds);
            
            // Create order and get orderId
            Restaurant restaurant = new Restaurant();
            restaurant.setId(restaurantId);
            
            Users users = new Users();
            users.setId(userId);
            
            // Calculate total price
            long totalPrice = cart.getTotal();
            
            // Calculate total shipping fee (revenue for shipper)
            long totalShippingFee = 0L;
            for (CartItemDTO item : cart.getItems()) {
                Optional<Food> foodOpt = foodRepository.findById(item.getFoodId());
                if (foodOpt.isPresent()) {
                    Food food = foodOpt.get();
                    // Add shipping fee for each quantity
                    totalShippingFee += (long)(food.getShippingFee() * item.getQuantity());
                }
            }
            
            Orders orders = new Orders();
            orders.setUsers(users);
            orders.setRestaurant(restaurant);
            orders.setCreateDate(new Date());
            orders.setStatus("created");
            orders.setTotalPrice(totalPrice);
            orders.setShippingFee(totalShippingFee); // Set total shipping fee for shipper
            orders.setPaymentMethod(null);
            orders.setPaymentStatus("PENDING");
            // Set delivery address and coordinates
            orders.setDeliveryAddress(deliveryAddress != null ? deliveryAddress : "");
            orders.setUserLat(userLat);
            orders.setUserLng(userLng);
            orderRepository.save(orders);
            
            int orderId = orders.getId();
            
            // Create order items
            List<OrderItem> orderItems = new ArrayList<>();
            for (CartItemDTO item : cart.getItems()) {
                for (int i = 0; i < item.getQuantity(); i++) {
                    Food food = new Food();
                    food.setId(item.getFoodId());
                    
                    OrderItem orderItem = new OrderItem();
                    KeyOrderItem keyOrderItem = new KeyOrderItem(orderId, item.getFoodId());
                    orderItem.setKeyOrderItem(keyOrderItem);
                    orderItem.setCreateDate(new Date());
                    orderItems.add(orderItem);
                }
            }
            orderItemRepository.saveAll(orderItems);
            
            System.out.println("✅ Order created with ID: " + orderId);
            
            // Clear cart after successful order
            boolean cartCleared = cartService.clearCart(userId);
            if (cartCleared) {
                System.out.println("✅ Cart cleared after order");
            } else {
                System.out.println("⚠️ Failed to clear cart after order");
            }
            
            return orderId;
        } catch (Exception e) {
            System.err.println("❌ Error in checkoutFromCartWithOrderId: " + e.getMessage());
            e.printStackTrace();
            return -1;
        }
    }
}
