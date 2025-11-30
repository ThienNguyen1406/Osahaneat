package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Cart;
import com.example.food_delivery.domain.entity.CartItem;
import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.response.CartDTO;
import com.example.food_delivery.dto.response.CartItemDTO;
import com.example.food_delivery.reponsitory.CartItemRepository;
import com.example.food_delivery.reponsitory.CartRepository;
import com.example.food_delivery.reponsitory.FoodRepository;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.service.imp.CartServiceImp;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService implements CartServiceImp {

    @Autowired
    CartRepository cartRepository;

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    UserReponsitory userRepository;

    @Autowired
    FoodRepository foodRepository;

    @Override
    public CartDTO getCartByUserId(int userId) {
        try {
            // Tìm cart của user
            Optional<Cart> cartOpt = cartRepository.findByCustomerId(userId);
            
            CartDTO cartDTO = new CartDTO();
            cartDTO.setUserId(userId);
            
            if (cartOpt.isEmpty()) {
                // Nếu chưa có cart, trả về cart rỗng
                cartDTO.setId(0);
                cartDTO.setTotal(0);
                cartDTO.setItemCount(0);
                cartDTO.setItems(new ArrayList<>());
                
                // Lấy user name
                Users user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    cartDTO.setUserName(user.getUserName());
                }
                
                return cartDTO;
            }
            
            Cart cart = cartOpt.get();
            cartDTO.setId(cart.getId());
            cartDTO.setTotal(cart.getTotal() != null ? cart.getTotal() : 0);
            
            // Lấy user name
            if (cart.getCustomer() != null) {
                cartDTO.setUserName(cart.getCustomer().getUserName());
            }
            
            // Lấy danh sách items
            List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
            List<CartItemDTO> itemDTOs = new ArrayList<>();
            
            for (CartItem cartItem : cartItems) {
                CartItemDTO itemDTO = new CartItemDTO();
                itemDTO.setId(cartItem.getId());
                itemDTO.setQuantity(cartItem.getQuantity());
                itemDTO.setTotalPrice(cartItem.getTotalPrice() != null ? cartItem.getTotalPrice() : 0);
                
                if (cartItem.getFood() != null) {
                    Food food = cartItem.getFood();
                    itemDTO.setFoodId(food.getId());
                    itemDTO.setFoodTitle(food.getTitle());
                    itemDTO.setFoodPrice(food.getPrice());
                    itemDTO.setFreeShip(food.isFreeShip());
                    
                    // Convert image filename to full URL
                    if (food.getImage() != null && !food.getImage().isEmpty()) {
                        itemDTO.setFoodImage("/menu/file/" + food.getImage());
                    } else {
                        itemDTO.setFoodImage(food.getImage());
                    }
                }
                
                itemDTOs.add(itemDTO);
            }
            
            cartDTO.setItems(itemDTOs);
            cartDTO.setItemCount(itemDTOs.size());
            
            return cartDTO;
        } catch (Exception e) {
            System.err.println("Error getting cart by user id: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Transactional
    @Override
    public boolean addItemToCart(int userId, int foodId, int quantity) {
        try {
            System.out.println("=== addItemToCart() called ===");
            System.out.println("userId: " + userId + " (type: int)");
            System.out.println("foodId: " + foodId);
            System.out.println("quantity: " + quantity);
            
            // Validate input
            if (userId <= 0 || foodId <= 0 || quantity <= 0) {
                System.err.println("❌ Invalid input: userId=" + userId + ", foodId=" + foodId + ", quantity=" + quantity);
                return false;
            }
            
            // Tìm user
            Optional<Users> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                System.err.println("❌ User not found: " + userId);
                return false;
            }
            Users user = userOpt.get();
            System.out.println("✅ User found: " + user.getId() + " - " + user.getUserName());
            
            // Tìm food
            Optional<Food> foodOpt = foodRepository.findById(foodId);
            if (foodOpt.isEmpty()) {
                System.err.println("❌ Food not found: " + foodId);
                return false;
            }
            Food food = foodOpt.get();
            System.out.println("✅ Food found: " + food.getId() + " - " + food.getTitle() + " - Price: " + food.getPrice());
            
            // Tìm hoặc tạo cart
            Cart cart;
            Optional<Cart> cartOpt = cartRepository.findByCustomer(user);
            if (cartOpt.isEmpty()) {
                // Tạo cart mới
                cart = Cart.builder()
                        .customer(user)
                        .total(0L)
                        .item(new ArrayList<>())
                        .build();
                cart = cartRepository.save(cart);
                System.out.println("✅ Created new cart for user: " + userId + ", Cart ID: " + cart.getId());
            } else {
                cart = cartOpt.get();
                System.out.println("✅ Found existing cart: " + cart.getId() + " for user: " + userId);
            }
            
            // Kiểm tra xem item đã có trong cart chưa
            System.out.println("🔍 Checking for existing cart item - Cart ID: " + cart.getId() + ", Food ID: " + foodId);
            CartItem existingItem = cartItemRepository.findByCartIdAndFoodId(cart.getId(), foodId);
            
            if (existingItem != null) {
                // Cập nhật quantity và totalPrice
                System.out.println("⚠️ Found existing cart item - ID: " + existingItem.getId() + ", Current quantity: " + existingItem.getQuantity() + ", Food: " + existingItem.getFood().getTitle());
                int oldQuantity = existingItem.getQuantity();
                existingItem.setQuantity(existingItem.getQuantity() + quantity);
                long itemTotal = (long) (food.getPrice() * existingItem.getQuantity());
                existingItem.setTotalPrice(itemTotal);
                cartItemRepository.save(existingItem);
                System.out.println("✅ Updated existing cart item: " + existingItem.getId() + " (quantity: " + oldQuantity + " -> " + existingItem.getQuantity() + ")");
            } else {
                // Tạo cart item mới
                System.out.println("✅ No existing item found, creating new cart item for Food ID: " + foodId + ", Title: " + food.getTitle());
                long itemTotal = (long) (food.getPrice() * quantity);
                CartItem cartItem = CartItem.builder()
                        .cart(cart)
                        .food(food)
                        .quantity(quantity)
                        .totalPrice(itemTotal)
                        .build();
                cartItem = cartItemRepository.save(cartItem);
                // Add to cart's item list
                cart.getItem().add(cartItem);
                System.out.println("✅ Added new cart item - Cart Item ID: " + cartItem.getId() + ", Food ID: " + foodId + ", Food Title: " + food.getTitle() + ", Quantity: " + quantity);
            }
            
            // Cập nhật tổng tiền cart
            long cartTotal = calculateCartTotal(cart.getId());
            cart.setTotal(cartTotal);
            cartRepository.save(cart);
            System.out.println("✅ Cart total updated: " + cartTotal + " for cart ID: " + cart.getId());
            
            // Verify cart items count
            List<CartItem> allItems = cartItemRepository.findByCartId(cart.getId());
            System.out.println("✅ Cart now has " + allItems.size() + " items");
            
            return true;
        } catch (Exception e) {
            System.err.println("Error adding item to cart: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    @Override
    public boolean updateCartItemQuantity(int itemId, int quantity) {
        try {
            if (quantity <= 0) {
                System.err.println("Invalid quantity: " + quantity);
                return false;
            }
            
            Optional<CartItem> itemOpt = cartItemRepository.findById(itemId);
            if (itemOpt.isEmpty()) {
                System.err.println("Cart item not found: " + itemId);
                return false;
            }
            
            CartItem cartItem = itemOpt.get();
            cartItem.setQuantity(quantity);
            
            // Tính lại totalPrice
            if (cartItem.getFood() != null) {
                long itemTotal = (long) (cartItem.getFood().getPrice() * quantity);
                cartItem.setTotalPrice(itemTotal);
            }
            
            cartItemRepository.save(cartItem);
            
            // Cập nhật tổng tiền cart
            if (cartItem.getCart() != null) {
                long cartTotal = calculateCartTotal(cartItem.getCart().getId());
                cartItem.getCart().setTotal(cartTotal);
                cartRepository.save(cartItem.getCart());
            }
            
            return true;
        } catch (Exception e) {
            System.err.println("Error updating cart item quantity: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    @Override
    public boolean removeCartItem(int itemId) {
        try {
            Optional<CartItem> itemOpt = cartItemRepository.findById(itemId);
            if (itemOpt.isEmpty()) {
                System.err.println("Cart item not found: " + itemId);
                return false;
            }
            
            CartItem cartItem = itemOpt.get();
            int cartId = cartItem.getCart().getId();
            
            // Xóa cart item
            cartItemRepository.delete(cartItem);
            
            // Cập nhật tổng tiền cart
            long cartTotal = calculateCartTotal(cartId);
            Optional<Cart> cartOpt = cartRepository.findById(cartId);
            if (cartOpt.isPresent()) {
                Cart cart = cartOpt.get();
                cart.setTotal(cartTotal);
                cartRepository.save(cart);
            }
            
            return true;
        } catch (Exception e) {
            System.err.println("Error removing cart item: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    @Override
    public boolean clearCart(int userId) {
        try {
            Optional<Cart> cartOpt = cartRepository.findByCustomerId(userId);
            if (cartOpt.isEmpty()) {
                System.err.println("Cart not found for user: " + userId);
                return false;
            }
            
            Cart cart = cartOpt.get();
            
            // Xóa tất cả cart items
            cartItemRepository.deleteByCartId(cart.getId());
            
            // Reset cart total
            cart.setTotal(0L);
            cartRepository.save(cart);
            
            return true;
        } catch (Exception e) {
            System.err.println("Error clearing cart: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public long calculateCartTotal(int cartId) {
        try {
            List<CartItem> cartItems = cartItemRepository.findByCartId(cartId);
            long total = 0;
            
            for (CartItem item : cartItems) {
                if (item.getTotalPrice() != null) {
                    total += item.getTotalPrice();
                } else if (item.getFood() != null) {
                    // Tính lại nếu totalPrice chưa có
                    long itemTotal = (long) (item.getFood().getPrice() * item.getQuantity());
                    total += itemTotal;
                }
            }
            
            return total;
        } catch (Exception e) {
            System.err.println("Error calculating cart total: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }
}

