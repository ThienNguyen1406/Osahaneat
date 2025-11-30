package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.domain.entity.MenuRestaurant;
import com.example.food_delivery.domain.entity.Orders;
import com.example.food_delivery.domain.entity.Restaurant;
import com.example.food_delivery.domain.entity.RestaurantStaff;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.response.DashboardStatsDTO;
import com.example.food_delivery.dto.response.MenuDTO;
import com.example.food_delivery.dto.response.OrderDTO;
import com.example.food_delivery.dto.response.RestaurantDTO;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.reponsitory.*;
import com.example.food_delivery.service.imp.RestaurantServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RestaurantOwnerService {

    @Autowired
    private RestaurantReponsitory restaurantReponsitory;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private RestaurantStaffRepository restaurantStaffRepository;

    @Autowired
    private UserReponsitory userReponsitory;

    @Autowired
    private OrderService orderService;

    @Autowired
    private RestaurantServiceImp restaurantServiceImp;

    @Autowired
    private com.example.food_delivery.mapper.FoodMapper foodMapper;

    @Autowired
    private com.example.food_delivery.service.imp.FileServiceImp fileServiceImp;

    @Autowired
    private com.example.food_delivery.service.imp.MenuServiceImp menuServiceImp;

    @Autowired
    private com.example.food_delivery.reponsitory.CategoryRepository categoryRepository;

    @Autowired
    private com.example.food_delivery.reponsitory.MenuRestaurantRepository menuRestaurantRepository;

    @Autowired
    private com.example.food_delivery.service.UserService userService;

    @Autowired
    private com.example.food_delivery.reponsitory.RoleRepository roleRepository;

    /**
     * Lấy ID của owner hiện tại từ SecurityContext
     */
    private int getCurrentOwnerId() {
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
     * Lấy danh sách cửa hàng của owner
     */
    public List<RestaurantDTO> getMyRestaurants() {
        try {
            int ownerId = getCurrentOwnerId();
            System.out.println("=== getMyRestaurants() called ===");
            System.out.println("Owner ID: " + ownerId);
            
            // Use findByOwnerId instead of findAll + filter for better performance
            List<Restaurant> restaurants = restaurantReponsitory.findByOwnerId(ownerId);
            System.out.println("Restaurants found for owner " + ownerId + ": " + restaurants.size());
            
            if (restaurants.isEmpty()) {
                System.out.println("⚠️ No restaurants found for owner ID: " + ownerId);
                System.out.println("Checking if owner exists in database...");
                var userOpt = userReponsitory.findById(ownerId);
                if (userOpt.isPresent()) {
                    Users user = userOpt.get();
                    System.out.println("Owner user exists: " + user.getUserName() + " (ID: " + user.getId() + ")");
                    System.out.println("Role: " + (user.getRoles() != null ? user.getRoles().getRoleName() : "null"));
                } else {
                    System.err.println("❌ Owner user not found in database!");
                }
                
                // Check total restaurants in DB
                List<Restaurant> allRestaurants = restaurantReponsitory.findAll();
                System.out.println("Total restaurants in DB: " + allRestaurants.size());
                for (Restaurant r : allRestaurants) {
                    if (r.getOwner() == null) {
                        System.out.println("  - Restaurant " + r.getId() + " (" + r.getTitle() + ") has NO owner");
                    } else {
                        System.out.println("  - Restaurant " + r.getId() + " (" + r.getTitle() + ") owner: " + r.getOwner().getId() + " (" + r.getOwner().getUserName() + ")");
                    }
                }
            }
            
            List<RestaurantDTO> restaurantDTOs = new ArrayList<>();
            Date today = new Date();
            
            for (Restaurant restaurant : restaurants) {
                try {
                    RestaurantDTO dto = restaurantServiceImp.getRestaurantById(restaurant.getId());
                    if (dto != null) {
                        // Tính toán thống kê cho mỗi nhà hàng
                        List<Orders> todayOrdersList = orderRepository.findOrdersByRestaurantAndDate(restaurant.getId(), today);
                        dto.setTodayOrders(todayOrdersList.size());
                        
                        Long todayRevenue = orderRepository.sumRevenueByRestaurantAndDate(restaurant.getId(), today);
                        dto.setTodayRevenue(todayRevenue != null ? todayRevenue : 0L);
                        
                        List<Orders> allOrders = orderRepository.findByRestaurantId(restaurant.getId());
                        dto.setTotalOrders(allOrders.size());
                        
                        restaurantDTOs.add(dto);
                        System.out.println("✅ Added restaurant DTO: " + dto.getId() + " - " + dto.getTitle() + 
                            " (Today Orders: " + dto.getTodayOrders() + ", Today Revenue: " + dto.getTodayRevenue() + ")");
                    } else {
                        System.out.println("⚠️ Warning: RestaurantDTO is null for restaurant ID: " + restaurant.getId());
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error converting restaurant " + restaurant.getId() + " to DTO: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            System.out.println("Returning " + restaurantDTOs.size() + " restaurant DTOs");
            return restaurantDTOs;
        } catch (Exception e) {
            System.err.println("❌ Error getting my restaurants: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Tạo cửa hàng mới cho owner (với file upload)
     */
    @Transactional
    public RestaurantDTO createRestaurantWithFile(
            org.springframework.web.multipart.MultipartFile file,
            String title, String subtitle, String description,
            String address, String open_date,
            boolean is_freeship, boolean is_active) {
        try {
            int ownerId = getCurrentOwnerId();
            Users owner = userReponsitory.findById(ownerId)
                    .orElseThrow(() -> new RuntimeException("Owner not found: " + ownerId));
            
            // Save image file if provided
            String imageFilename = null;
            if (file != null && !file.isEmpty()) {
                boolean isFileSaved = fileServiceImp.saveFile(file);
                if (isFileSaved) {
                    imageFilename = file.getOriginalFilename();
                } else {
                    throw new RuntimeException("Không thể lưu file ảnh!");
                }
            }
            
            Restaurant restaurant = new Restaurant();
            restaurant.setTitle(title);
            restaurant.setSubtitle(subtitle);
            restaurant.setDescription(description);
            restaurant.setAddress(address);
            restaurant.setImage(imageFilename);
            restaurant.setFreeship(is_freeship);
            restaurant.setOwner(owner);
            restaurant.setActive(is_active);
            // Khi owner tạo nhà hàng mới, trạng thái là "đang chờ" (pending) - cần admin duyệt
            // Set isApproved = null để phân biệt với "bị hủy" (isApproved = false)
            restaurant.setIsApproved(null);
            
            // Parse open_date
            if (open_date != null && !open_date.trim().isEmpty()) {
                try {
                    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
                    Date openDate = sdf.parse(open_date);
                    restaurant.setOpenDate(openDate);
                } catch (Exception e) {
                    // If parsing fails, use current date
                    restaurant.setOpenDate(new Date());
                }
            } else {
                restaurant.setOpenDate(new Date());
            }
            
            restaurant = restaurantReponsitory.save(restaurant);
            
            return restaurantServiceImp.getRestaurantById(restaurant.getId());
        } catch (Exception e) {
            System.err.println("Error creating restaurant: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Tạo cửa hàng mới cho owner (không có file - deprecated, dùng createRestaurantWithFile)
     */
    @Transactional
    public RestaurantDTO createRestaurant(RestaurantDTO restaurantDTO) {
        try {
            int ownerId = getCurrentOwnerId();
            Users owner = userReponsitory.findById(ownerId)
                    .orElseThrow(() -> new RuntimeException("Owner not found: " + ownerId));
            
            Restaurant restaurant = new Restaurant();
            restaurant.setTitle(restaurantDTO.getTitle());
            restaurant.setSubtitle(restaurantDTO.getSubtitle());
            restaurant.setDescription(restaurantDTO.getDescription());
            restaurant.setAddress(restaurantDTO.getAddress());
            restaurant.setImage(restaurantDTO.getImage());
            restaurant.setFreeship(restaurantDTO.isFreeShip());
            restaurant.setOwner(owner);
            restaurant.setActive(restaurantDTO.getIsActive() != null ? restaurantDTO.getIsActive() : true);
            // Khi owner tạo nhà hàng mới, trạng thái là "đang chờ" (pending) - cần admin duyệt
            // Set isApproved = null để phân biệt với "bị hủy" (isApproved = false)
            restaurant.setIsApproved(null);
            restaurant.setOpenDate(new Date());
            
            restaurant = restaurantReponsitory.save(restaurant);
            
            return restaurantServiceImp.getRestaurantById(restaurant.getId());
        } catch (Exception e) {
            System.err.println("Error creating restaurant: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Thống kê dashboard
     */
    public DashboardStatsDTO getDashboardStats(Integer restaurantId) {
        try {
            int ownerId = getCurrentOwnerId();
            Date today = new Date();
            Calendar cal = Calendar.getInstance();
            cal.setTime(today);
            // Start of month
            cal.set(Calendar.DAY_OF_MONTH, 1);
            Date startOfMonth = cal.getTime();
            
            DashboardStatsDTO stats = new DashboardStatsDTO();
            
            List<Restaurant> myRestaurants;
            if (restaurantId != null) {
                Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
                if (restaurantOpt.isEmpty() || restaurantOpt.get().getOwner().getId() != ownerId) {
                    throw new RuntimeException("Restaurant not found or not owned by user");
                }
                myRestaurants = List.of(restaurantOpt.get());
            } else {
                myRestaurants = restaurantReponsitory.findAll()
                        .stream()
                        .filter(r -> r.getOwner() != null && r.getOwner().getId() == ownerId)
                        .collect(Collectors.toList());
            }
            
            // Tính tổng doanh thu hôm nay
            long todayRevenue = 0;
            int todayOrders = 0;
            for (Restaurant restaurant : myRestaurants) {
                Long revenue = orderRepository.sumRevenueByRestaurantAndDate(restaurant.getId(), today);
                if (revenue != null) {
                    todayRevenue += revenue;
                }
                List<Orders> orders = orderRepository.findOrdersByRestaurantAndDate(restaurant.getId(), today);
                todayOrders += orders.size();
            }
            stats.setTodayRevenue(todayRevenue);
            stats.setTodayOrders(todayOrders);
            
            // Tính doanh thu tháng này
            long monthRevenue = 0;
            for (Restaurant restaurant : myRestaurants) {
                List<Orders> monthOrders = orderRepository.findByRestaurantIdAndCreateDateBetween(
                        restaurant.getId(), startOfMonth, today);
                for (Orders order : monthOrders) {
                    if (order.getTotalPrice() != null && "delivered".equals(order.getStatus())) {
                        monthRevenue += order.getTotalPrice();
                    }
                }
            }
            stats.setMonthRevenue(monthRevenue);
            
            // Tổng số cửa hàng
            stats.setTotalRestaurants(myRestaurants.size());
            
            // Tính % thay đổi so với ngày/tháng trước
            Calendar calYesterday = Calendar.getInstance();
            calYesterday.setTime(today);
            calYesterday.add(Calendar.DAY_OF_YEAR, -1);
            calYesterday.set(Calendar.HOUR_OF_DAY, 0);
            calYesterday.set(Calendar.MINUTE, 0);
            calYesterday.set(Calendar.SECOND, 0);
            calYesterday.set(Calendar.MILLISECOND, 0);
            Date yesterday = calYesterday.getTime();
            
            // Doanh thu hôm qua
            long yesterdayRevenue = 0;
            int yesterdayOrders = 0;
            for (Restaurant restaurant : myRestaurants) {
                Long revenue = orderRepository.sumRevenueByRestaurantAndDate(restaurant.getId(), yesterday);
                if (revenue != null) {
                    yesterdayRevenue += revenue;
                }
                List<Orders> orders = orderRepository.findOrdersByRestaurantAndDate(restaurant.getId(), yesterday);
                yesterdayOrders += orders.size();
            }
            
            // Tính % thay đổi doanh thu hôm nay
            if (yesterdayRevenue > 0) {
                double revenueChange = ((double)(todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
                stats.setTodayRevenueChange(Math.round(revenueChange * 100.0) / 100.0); // Round to 2 decimals
            } else {
                stats.setTodayRevenueChange(todayRevenue > 0 ? 100.0 : 0.0);
            }
            
            // Tính % thay đổi số đơn hôm nay
            if (yesterdayOrders > 0) {
                int ordersChange = todayOrders - yesterdayOrders;
                stats.setTodayOrdersChange(ordersChange);
            } else {
                stats.setTodayOrdersChange(todayOrders);
            }
            
            // Doanh thu tháng trước
            Calendar calLastMonth = Calendar.getInstance();
            calLastMonth.setTime(today);
            calLastMonth.add(Calendar.MONTH, -1);
            calLastMonth.set(Calendar.DAY_OF_MONTH, 1);
            calLastMonth.set(Calendar.HOUR_OF_DAY, 0);
            calLastMonth.set(Calendar.MINUTE, 0);
            calLastMonth.set(Calendar.SECOND, 0);
            calLastMonth.set(Calendar.MILLISECOND, 0);
            Date startOfLastMonth = calLastMonth.getTime();
            
            Calendar calEndLastMonth = Calendar.getInstance();
            calEndLastMonth.setTime(today);
            calEndLastMonth.set(Calendar.DAY_OF_MONTH, 1);
            calEndLastMonth.add(Calendar.DAY_OF_YEAR, -1);
            calEndLastMonth.set(Calendar.HOUR_OF_DAY, 23);
            calEndLastMonth.set(Calendar.MINUTE, 59);
            calEndLastMonth.set(Calendar.SECOND, 59);
            calEndLastMonth.set(Calendar.MILLISECOND, 999);
            Date endOfLastMonth = calEndLastMonth.getTime();
            
            long lastMonthRevenue = 0;
            for (Restaurant restaurant : myRestaurants) {
                List<Orders> lastMonthOrders = orderRepository.findByRestaurantIdAndCreateDateBetween(
                        restaurant.getId(), startOfLastMonth, endOfLastMonth);
                for (Orders order : lastMonthOrders) {
                    if (order.getTotalPrice() != null && "delivered".equals(order.getStatus())) {
                        lastMonthRevenue += order.getTotalPrice();
                    }
                }
            }
            
            // Tính % thay đổi doanh thu tháng này
            if (lastMonthRevenue > 0) {
                double monthRevenueChange = ((double)(monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
                stats.setMonthRevenueChange(Math.round(monthRevenueChange * 100.0) / 100.0); // Round to 2 decimals
            } else {
                stats.setMonthRevenueChange(monthRevenue > 0 ? 100.0 : 0.0);
            }
            
            return stats;
        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            return new DashboardStatsDTO();
        }
    }

    /**
     * Doanh thu theo ngày
     */
    public Map<String, Long> getDailyRevenue(int days, Integer restaurantId) {
        try {
            int ownerId = getCurrentOwnerId();
            Map<String, Long> revenueMap = new LinkedHashMap<>();
            
            Calendar cal = Calendar.getInstance();
            for (int i = days - 1; i >= 0; i--) {
                cal.setTime(new Date());
                cal.add(Calendar.DAY_OF_YEAR, -i);
                cal.set(Calendar.HOUR_OF_DAY, 0);
                cal.set(Calendar.MINUTE, 0);
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                Date date = cal.getTime();
                
                String dateKey = String.format("%04d-%02d-%02d", 
                        cal.get(Calendar.YEAR), 
                        cal.get(Calendar.MONTH) + 1, 
                        cal.get(Calendar.DAY_OF_MONTH));
                
                if (restaurantId != null) {
                    Long revenue = orderRepository.sumRevenueByRestaurantAndDate(restaurantId, date);
                    revenueMap.put(dateKey, revenue != null ? revenue : 0L);
                } else {
                    // Tổng hợp tất cả cửa hàng
                    List<Restaurant> myRestaurants = restaurantReponsitory.findAll()
                            .stream()
                            .filter(r -> r.getOwner() != null && r.getOwner().getId() == ownerId)
                            .collect(Collectors.toList());
                    
                    long totalRevenue = 0;
                    for (Restaurant restaurant : myRestaurants) {
                        Long revenue = orderRepository.sumRevenueByRestaurantAndDate(restaurant.getId(), date);
                        if (revenue != null) {
                            totalRevenue += revenue;
                        }
                    }
                    revenueMap.put(dateKey, totalRevenue);
                }
            }
            
            return revenueMap;
        } catch (Exception e) {
            System.err.println("Error getting daily revenue: " + e.getMessage());
            e.printStackTrace();
            return new HashMap<>();
        }
    }

    /**
     * Đơn hàng theo trạng thái
     */
    public Map<String, Integer> getOrdersByStatus(Integer restaurantId) {
        try {
            int ownerId = getCurrentOwnerId();
            Map<String, Integer> statusMap = new HashMap<>();
            
            List<Restaurant> myRestaurants;
            if (restaurantId != null) {
                Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
                if (restaurantOpt.isEmpty() || restaurantOpt.get().getOwner().getId() != ownerId) {
                    throw new RuntimeException("Restaurant not found or not owned by user");
                }
                myRestaurants = List.of(restaurantOpt.get());
            } else {
                myRestaurants = restaurantReponsitory.findAll()
                        .stream()
                        .filter(r -> r.getOwner() != null && r.getOwner().getId() == ownerId)
                        .collect(Collectors.toList());
            }
            
            List<String> statuses = List.of("created", "processing", "ready", "completed", "cancelled", "delivered");
            
            for (String status : statuses) {
                int count = 0;
                for (Restaurant restaurant : myRestaurants) {
                    count += orderRepository.findByRestaurantIdAndStatus(restaurant.getId(), status).size();
                }
                statusMap.put(status, count);
            }
            
            return statusMap;
        } catch (Exception e) {
            System.err.println("Error getting orders by status: " + e.getMessage());
            e.printStackTrace();
            return new HashMap<>();
        }
    }

    /**
     * Cập nhật cửa hàng (với file upload)
     */
    @Transactional
    public RestaurantDTO updateRestaurantWithFile(
            int restaurantId,
            org.springframework.web.multipart.MultipartFile file,
            String title, String subtitle, String description,
            String address, boolean is_freeship, boolean is_active) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty()) {
                throw new RuntimeException("Restaurant not found: " + restaurantId);
            }
            
            Restaurant restaurant = restaurantOpt.get();
            
            // Kiểm tra owner
            if (restaurant.getOwner() == null || restaurant.getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant not owned by user");
            }
            
            // Cập nhật file ảnh nếu có
            if (file != null && !file.isEmpty()) {
                boolean isFileSaved = fileServiceImp.saveFile(file);
                if (isFileSaved) {
                    restaurant.setImage(file.getOriginalFilename());
                } else {
                    throw new RuntimeException("Không thể lưu file ảnh!");
                }
            }
            
            // Cập nhật thông tin
            if (title != null && !title.trim().isEmpty()) {
                restaurant.setTitle(title.trim());
            }
            if (subtitle != null) {
                restaurant.setSubtitle(subtitle.trim());
            }
            if (description != null) {
                restaurant.setDescription(description.trim());
            }
            if (address != null && !address.trim().isEmpty()) {
                restaurant.setAddress(address.trim());
            }
            restaurant.setFreeship(is_freeship);
            restaurant.setActive(is_active);
            
            restaurant = restaurantReponsitory.save(restaurant);
            
            return restaurantServiceImp.getRestaurantById(restaurant.getId());
        } catch (Exception e) {
            System.err.println("Error updating restaurant with file: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Cập nhật cửa hàng (không có file)
     */
    @Transactional
    public RestaurantDTO updateRestaurant(int restaurantId, RestaurantDTO restaurantDTO) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty()) {
                throw new RuntimeException("Restaurant not found: " + restaurantId);
            }
            
            Restaurant restaurant = restaurantOpt.get();
            
            // Kiểm tra owner
            if (restaurant.getOwner() == null || restaurant.getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant not owned by user");
            }
            
            // Cập nhật thông tin
            if (restaurantDTO.getTitle() != null) {
                restaurant.setTitle(restaurantDTO.getTitle());
            }
            if (restaurantDTO.getSubtitle() != null) {
                restaurant.setSubtitle(restaurantDTO.getSubtitle());
            }
            if (restaurantDTO.getDescription() != null) {
                restaurant.setDescription(restaurantDTO.getDescription());
            }
            if (restaurantDTO.getAddress() != null) {
                restaurant.setAddress(restaurantDTO.getAddress());
            }
            // isFreeShip là boolean primitive, luôn có giá trị
            restaurant.setFreeship(restaurantDTO.isFreeShip());
            if (restaurantDTO.getIsActive() != null) {
                restaurant.setActive(restaurantDTO.getIsActive());
            }
            
            restaurant = restaurantReponsitory.save(restaurant);
            
            return restaurantServiceImp.getRestaurantById(restaurant.getId());
        } catch (Exception e) {
            System.err.println("Error updating restaurant: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Tạo món ăn cho cửa hàng
     */
    @Transactional
    public MenuDTO createMenu(int restaurantId, 
                              org.springframework.web.multipart.MultipartFile file,
                              String title, String description, String time_ship,
                              Double price, int cate_id, boolean is_freeship, Double shippingFee) {
        try {
            int ownerId = getCurrentOwnerId();
            
            // Kiểm tra restaurant thuộc về owner
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty()) {
                throw new RuntimeException("Restaurant not found: " + restaurantId);
            }
            Restaurant restaurant = restaurantOpt.get();
            if (restaurant.getOwner() == null || restaurant.getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant does not belong to the current owner");
            }
            
            // Kiểm tra category tồn tại
            Optional<com.example.food_delivery.domain.entity.Category> categoryOpt = 
                    categoryRepository.findById(cate_id);
            if (categoryOpt.isEmpty()) {
                throw new RuntimeException("Category not found: " + cate_id);
            }
            
            // Lưu file ảnh
            String imageFilename = null;
            if (file != null && !file.isEmpty()) {
                boolean isFileSaved = fileServiceImp.saveFile(file);
                if (isFileSaved) {
                    imageFilename = file.getOriginalFilename();
                } else {
                    throw new RuntimeException("Không thể lưu file ảnh!");
                }
            }
            
            // Tạo Food
            Food food = new Food();
            food.setTitle(title);
            food.setDesc(description);
            food.setTime_ship(time_ship);
            food.setPrice(price);
            food.setFreeShip(is_freeship);
            food.setImage(imageFilename);
            food.setAvailable(true); // Mặc định có sẵn
            food.setCategory(categoryOpt.get());
            // Set shipping fee (default to 15000 if not provided)
            food.setShippingFee(shippingFee != null && shippingFee >= 0 ? shippingFee : 15000.0);
            
            food = foodRepository.save(food);
            
            // Tạo MenuRestaurant để liên kết category với restaurant
            com.example.food_delivery.domain.entity.keys.KeyMenuRestaurant key = 
                    new com.example.food_delivery.domain.entity.keys.KeyMenuRestaurant(cate_id, restaurantId);
            
            // Kiểm tra xem đã có MenuRestaurant chưa
            Optional<MenuRestaurant> existingMenuRestaurant = 
                    menuRestaurantRepository.findByKeys_CateIdAndKeys_ResId(cate_id, restaurantId);
            
            if (existingMenuRestaurant.isEmpty()) {
                // Tạo mới MenuRestaurant
                MenuRestaurant menuRestaurant = MenuRestaurant.builder()
                        .keys(key)
                        .category(categoryOpt.get())
                        .restaurant(restaurant)
                        .createDate(new Date())
                        .build();
                menuRestaurantRepository.save(menuRestaurant);
            }
            
            return foodMapper.toDTO(food);
        } catch (Exception e) {
            System.err.println("Error creating menu: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Tạo tài khoản nhân viên cho cửa hàng
     */
    @Transactional
    public UserDTO createStaffAccount(int restaurantId, String userName, String password, String fullName, String phoneNumber) {
        try {
            int ownerId = getCurrentOwnerId();
            
            // Kiểm tra restaurant thuộc về owner
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty()) {
                throw new RuntimeException("Restaurant not found: " + restaurantId);
            }
            Restaurant restaurant = restaurantOpt.get();
            if (restaurant.getOwner() == null || restaurant.getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant does not belong to the current owner");
            }
            
            // Kiểm tra username đã tồn tại chưa
            var existingUserOpt = userReponsitory.findFirstByUserName(userName);
            if (existingUserOpt.isPresent()) {
                throw new RuntimeException("Username đã tồn tại: " + userName);
            }
            
            // Tạo user mới
            com.example.food_delivery.dto.request.SignupRequest signupRequest = 
                    com.example.food_delivery.dto.request.SignupRequest.builder()
                            .userName(userName)
                            .password(password)
                            .fullname(fullName)
                            .build();
            
            UserDTO userDTO = userService.addUser(signupRequest);
            
            if (userDTO == null) {
                throw new RuntimeException("Không thể tạo tài khoản nhân viên");
            }
            
            // Gán role RESTAURANT_STAFF
            var createdUserOpt = userReponsitory.findFirstByUserName(userName);
            if (createdUserOpt.isPresent()) {
                Users createdUser = createdUserOpt.get();
                // Cập nhật thông tin bổ sung
                if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
                    createdUser.setPhoneNumber(phoneNumber);
                }
                
                // Gán role
                userService.assignRoleToUser(createdUser.getId(), "RESTAURANT_STAFF");
                
                // Gán nhân viên vào restaurant
                RestaurantStaff restaurantStaff = RestaurantStaff.builder()
                        .user(createdUser)
                        .restaurant(restaurant)
                        .createdDate(new Date())
                        .isActive(true)
                        .status("WORKING")
                        .build();
                restaurantStaffRepository.save(restaurantStaff);
                
                // Refresh user để lấy role mới
                createdUser = userReponsitory.findById(createdUser.getId()).orElse(createdUser);
                UserDTO result = new UserDTO();
                result.setId(createdUser.getId());
                result.setUserName(createdUser.getUserName());
                result.setFullName(createdUser.getFullName());
                result.setEmail(createdUser.getEmail());
                result.setPhoneNumber(createdUser.getPhoneNumber());
                result.setAvatar(createdUser.getAvatar());
                result.setRoleName(createdUser.getRoles() != null ? createdUser.getRoles().getRoleName() : null);
                return result;
            }
            
            return userDTO;
        } catch (Exception e) {
            System.err.println("Error creating staff account: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Lấy menu của cửa hàng
     */
    public List<MenuDTO> getRestaurantMenu(int restaurantId) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty() || restaurantOpt.get().getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant not found or not owned by user");
            }
            
            // Lấy foods thuộc về restaurant qua MenuRestaurant
            // Food -> Category -> MenuRestaurant -> Restaurant
            Restaurant restaurant = restaurantOpt.get();
            List<MenuDTO> menuDTOs = new ArrayList<>();
            
            if (restaurant.getLisMenuRestaurant() != null && !restaurant.getLisMenuRestaurant().isEmpty()) {
                // Lấy tất cả categories của restaurant
                Set<Integer> categoryIds = new HashSet<>();
                for (com.example.food_delivery.domain.entity.MenuRestaurant menuRestaurant : 
                        restaurant.getLisMenuRestaurant()) {
                    if (menuRestaurant.getCategory() != null) {
                        categoryIds.add(menuRestaurant.getCategory().getId());
                    }
                }
                
                // Lấy tất cả foods của các categories này
                List<Food> allFoods = foodRepository.findAll();
                for (Food food : allFoods) {
                    if (food.getCategory() != null && categoryIds.contains(food.getCategory().getId())) {
                        MenuDTO menuDTO = foodMapper.toDTO(food);
                        
                        // Set isAvailable field from Food entity
                        menuDTO.setAvailable(food.isAvailable());
                        
                        // Format image path giống như các service khác
                        String imagePath = menuDTO.getImage();
                        System.out.println("🔍 Processing food ID: " + food.getId() + ", Original image path: " + imagePath);
                        
                        if (imagePath != null && !imagePath.trim().isEmpty()) {
                            imagePath = imagePath.trim();
                            
                            // Nếu đã là URL đầy đủ (http/https), giữ nguyên
                            if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
                                menuDTO.setImage(imagePath);
                                System.out.println("✅ Image is full URL: " + imagePath);
                            }
                            // Nếu đã bắt đầu với "/" (đã được format), giữ nguyên
                            else if (imagePath.startsWith("/")) {
                                menuDTO.setImage(imagePath);
                                System.out.println("✅ Image already formatted: " + imagePath);
                            }
                            // Nếu bắt đầu với "images/", thêm "/" ở đầu
                            else if (imagePath.startsWith("images/")) {
                                menuDTO.setImage("/" + imagePath);
                                System.out.println("✅ Image formatted from images/: /" + imagePath);
                            }
                            // Nếu chỉ là filename (có extension như .jpg, .png, .jpeg), thêm "/menu/file/"
                            else if (imagePath.contains(".") && !imagePath.contains("/")) {
                                menuDTO.setImage("/menu/file/" + imagePath);
                                System.out.println("✅ Image formatted as filename: /menu/file/" + imagePath);
                            }
                            // Nếu có chứa "menu" hoặc "file" nhưng chưa đúng format, extract filename
                            else if (imagePath.contains("menu") || imagePath.contains("file")) {
                                String fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
                                menuDTO.setImage("/menu/file/" + fileName);
                                System.out.println("✅ Image extracted filename: /menu/file/" + fileName);
                            }
                            // Mặc định: thêm "/menu/file/"
                            else {
                                menuDTO.setImage("/menu/file/" + imagePath);
                                System.out.println("✅ Image formatted as default: /menu/file/" + imagePath);
                            }
                        } else {
                            // Nếu không có image, set null để frontend hiển thị placeholder
                            menuDTO.setImage(null);
                            System.out.println("⚠️ Food ID " + food.getId() + " has no image");
                        }
                        
                        menuDTOs.add(menuDTO);
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

    /**
     * Cập nhật món ăn
     */
    @Transactional
    public MenuDTO updateMenu(int restaurantId, int menuId,
                              org.springframework.web.multipart.MultipartFile file,
                              String title, String description, String time_ship,
                              Double price, Integer cate_id, Boolean is_freeship, Double shippingFee) {
        try {
            int ownerId = getCurrentOwnerId();
            
            // Kiểm tra restaurant thuộc về owner
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty()) {
                throw new RuntimeException("Restaurant not found: " + restaurantId);
            }
            Restaurant restaurant = restaurantOpt.get();
            if (restaurant.getOwner() == null || restaurant.getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant does not belong to the current owner");
            }
            
            // Kiểm tra menu tồn tại và thuộc về restaurant
            Optional<Food> foodOpt = foodRepository.findById(menuId);
            if (foodOpt.isEmpty()) {
                throw new RuntimeException("Menu not found: " + menuId);
            }
            Food food = foodOpt.get();
            
            // Kiểm tra menu thuộc về restaurant (qua Category -> MenuRestaurant)
            boolean belongsToRestaurant = false;
            if (food.getCategory() != null && food.getCategory().getLisMenuRestaurant() != null) {
                for (MenuRestaurant menuRestaurant : food.getCategory().getLisMenuRestaurant()) {
                    if (menuRestaurant.getRestaurant() != null && 
                        menuRestaurant.getRestaurant().getId() == restaurantId) {
                        belongsToRestaurant = true;
                        break;
                    }
                }
            }
            
            if (!belongsToRestaurant) {
                throw new RuntimeException("Menu does not belong to the restaurant");
            }
            
            // Cập nhật file ảnh nếu có
            if (file != null && !file.isEmpty()) {
                boolean isFileSaved = fileServiceImp.saveFile(file);
                if (isFileSaved) {
                    food.setImage(file.getOriginalFilename());
                } else {
                    throw new RuntimeException("Không thể lưu file ảnh!");
                }
            }
            
            // Cập nhật các trường khác
            if (title != null && !title.trim().isEmpty()) {
                food.setTitle(title.trim());
            }
            if (description != null) {
                food.setDesc(description);
            }
            if (time_ship != null && !time_ship.trim().isEmpty()) {
                food.setTime_ship(time_ship.trim());
            }
            if (price != null && price > 0) {
                food.setPrice(price);
            }
            if (is_freeship != null) {
                food.setFreeShip(is_freeship);
            }
            if (shippingFee != null && shippingFee >= 0) {
                food.setShippingFee(shippingFee);
            }
            if (cate_id != null && cate_id > 0) {
                Optional<com.example.food_delivery.domain.entity.Category> categoryOpt = 
                        categoryRepository.findById(cate_id);
                if (categoryOpt.isPresent()) {
                    food.setCategory(categoryOpt.get());
                }
            }
            
            food = foodRepository.save(food);
            MenuDTO menuDTO = foodMapper.toDTO(food);
            
            // Ensure isAvailable is set in MenuDTO (MapStruct might not map it automatically)
            menuDTO.setAvailable(food.isAvailable());
            
            return menuDTO;
        } catch (Exception e) {
            System.err.println("Error updating menu: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Bật/tắt món ăn (ẩn/hiện)
     */
    @Transactional
    public MenuDTO toggleMenuAvailability(int restaurantId, int menuId, boolean isAvailable) {
        try {
            int ownerId = getCurrentOwnerId();
            
            // Kiểm tra restaurant thuộc về owner
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty()) {
                throw new RuntimeException("Restaurant not found: " + restaurantId);
            }
            Restaurant restaurant = restaurantOpt.get();
            if (restaurant.getOwner() == null || restaurant.getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant does not belong to the current owner");
            }
            
            // Kiểm tra menu tồn tại và thuộc về restaurant
            Optional<Food> foodOpt = foodRepository.findById(menuId);
            if (foodOpt.isEmpty()) {
                throw new RuntimeException("Menu not found: " + menuId);
            }
            Food food = foodOpt.get();
            
            // Kiểm tra menu thuộc về restaurant
            boolean belongsToRestaurant = false;
            if (food.getCategory() != null && food.getCategory().getLisMenuRestaurant() != null) {
                for (MenuRestaurant menuRestaurant : food.getCategory().getLisMenuRestaurant()) {
                    if (menuRestaurant.getRestaurant() != null && 
                        menuRestaurant.getRestaurant().getId() == restaurantId) {
                        belongsToRestaurant = true;
                        break;
                    }
                }
            }
            
            if (!belongsToRestaurant) {
                throw new RuntimeException("Menu does not belong to the restaurant");
            }
            
            food.setAvailable(isAvailable);
            food = foodRepository.save(food);
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
     * Xóa món ăn
     */
    @Transactional
    public boolean deleteMenu(int restaurantId, int menuId) {
        try {
            int ownerId = getCurrentOwnerId();
            
            // Kiểm tra restaurant thuộc về owner
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty()) {
                throw new RuntimeException("Restaurant not found: " + restaurantId);
            }
            Restaurant restaurant = restaurantOpt.get();
            if (restaurant.getOwner() == null || restaurant.getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant does not belong to the current owner");
            }
            
            // Kiểm tra menu tồn tại và thuộc về restaurant
            Optional<Food> foodOpt = foodRepository.findById(menuId);
            if (foodOpt.isEmpty()) {
                throw new RuntimeException("Menu not found: " + menuId);
            }
            Food food = foodOpt.get();
            
            // Kiểm tra menu thuộc về restaurant
            boolean belongsToRestaurant = false;
            if (food.getCategory() != null && food.getCategory().getLisMenuRestaurant() != null) {
                for (MenuRestaurant menuRestaurant : food.getCategory().getLisMenuRestaurant()) {
                    if (menuRestaurant.getRestaurant() != null && 
                        menuRestaurant.getRestaurant().getId() == restaurantId) {
                        belongsToRestaurant = true;
                        break;
                    }
                }
            }
            
            if (!belongsToRestaurant) {
                throw new RuntimeException("Menu does not belong to the restaurant");
            }
            
            // Xóa menu
            return menuServiceImp.deleteMenu(menuId);
        } catch (Exception e) {
            System.err.println("Error deleting menu: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Đơn hàng của cửa hàng
     */
    public Page<OrderDTO> getRestaurantOrders(int restaurantId, Pageable pageable) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty() || restaurantOpt.get().getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant not found or not owned by user");
            }
            
            Page<Orders> ordersPage = orderRepository.findByRestaurantIdOrderByCreateDateDesc(restaurantId, pageable);
            
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
            System.err.println("Error getting restaurant orders: " + e.getMessage());
            e.printStackTrace();
            return Page.empty();
        }
    }

    /**
     * Quản lý nhân viên - Lấy tất cả nhân viên của owner (tất cả cửa hàng)
     */
    public List<com.example.food_delivery.dto.response.RestaurantStaffDTO> getAllStaff() {
        try {
            int ownerId = getCurrentOwnerId();
            
            // Lấy tất cả restaurants của owner
            List<Restaurant> restaurants = restaurantReponsitory.findByOwnerId(ownerId);
            if (restaurants.isEmpty()) {
                return new ArrayList<>();
            }
            
            List<Integer> restaurantIds = restaurants.stream()
                    .map(Restaurant::getId)
                    .collect(java.util.stream.Collectors.toList());
            
            // Lấy tất cả staff của các restaurants
            List<RestaurantStaff> staffList = restaurantStaffRepository.findByRestaurantIdIn(restaurantIds);
            List<com.example.food_delivery.dto.response.RestaurantStaffDTO> staffDTOs = new ArrayList<>();
            
            for (RestaurantStaff staff : staffList) {
                if (staff.getUser() != null && staff.getRestaurant() != null) {
                    com.example.food_delivery.dto.response.RestaurantStaffDTO staffDTO = new com.example.food_delivery.dto.response.RestaurantStaffDTO();
                    staffDTO.setId(staff.getId());
                    staffDTO.setUserId(staff.getUser().getId());
                    staffDTO.setUserName(staff.getUser().getUserName());
                    staffDTO.setFullName(staff.getUser().getFullName());
                    staffDTO.setEmail(staff.getUser().getEmail());
                    staffDTO.setPhoneNumber(staff.getUser().getPhoneNumber());
                    staffDTO.setAvatar(staff.getUser().getAvatar());
                    staffDTO.setRestaurantId(staff.getRestaurant().getId());
                    staffDTO.setRestaurantName(staff.getRestaurant().getTitle());
                    staffDTO.setCreatedDate(staff.getCreatedDate());
                    staffDTO.setActive(staff.isActive());
                    staffDTO.setStatus(staff.getStatus() != null ? staff.getStatus() : "WORKING");
                    staffDTOs.add(staffDTO);
                }
            }
            
            return staffDTOs;
        } catch (Exception e) {
            System.err.println("Error getting all staff: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Quản lý nhân viên - Lấy danh sách staff
     */
    public List<com.example.food_delivery.dto.response.RestaurantStaffDTO> getRestaurantStaff(int restaurantId) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty() || restaurantOpt.get().getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant not found or not owned by user");
            }
            
            List<RestaurantStaff> staffList = restaurantStaffRepository.findByRestaurantId(restaurantId);
            List<com.example.food_delivery.dto.response.RestaurantStaffDTO> staffDTOs = new ArrayList<>();
            
            for (RestaurantStaff staff : staffList) {
                if (staff.getUser() != null) {
                    com.example.food_delivery.dto.response.RestaurantStaffDTO staffDTO = new com.example.food_delivery.dto.response.RestaurantStaffDTO();
                    staffDTO.setId(staff.getId());
                    staffDTO.setUserId(staff.getUser().getId());
                    staffDTO.setUserName(staff.getUser().getUserName());
                    staffDTO.setFullName(staff.getUser().getFullName());
                    staffDTO.setEmail(staff.getUser().getEmail());
                    staffDTO.setPhoneNumber(staff.getUser().getPhoneNumber());
                    staffDTO.setAvatar(staff.getUser().getAvatar());
                    staffDTO.setRestaurantId(restaurantId);
                    staffDTO.setRestaurantName(restaurantOpt.get().getTitle());
                    staffDTO.setCreatedDate(staff.getCreatedDate());
                    staffDTO.setActive(staff.isActive());
                    staffDTO.setStatus(staff.getStatus() != null ? staff.getStatus() : "WORKING");
                    staffDTOs.add(staffDTO);
                }
            }
            
            return staffDTOs;
        } catch (Exception e) {
            System.err.println("Error getting restaurant staff: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Thêm nhân viên vào cửa hàng
     */
    @Transactional
    public boolean addStaffToRestaurant(int restaurantId, int userId) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty() || restaurantOpt.get().getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant not found or not owned by user");
            }
            
            Optional<Users> userOpt = userReponsitory.findById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found: " + userId);
            }
            
            // Kiểm tra user đã là staff của restaurant chưa
            if (restaurantStaffRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
                throw new RuntimeException("User is already a staff of this restaurant");
            }
            
            RestaurantStaff staff = new RestaurantStaff();
            staff.setUser(userOpt.get());
            staff.setRestaurant(restaurantOpt.get());
            staff.setCreatedDate(new Date());
            staff.setActive(true);
            staff.setStatus("WORKING"); // Mặc định là đang làm việc
            
            restaurantStaffRepository.save(staff);
            return true;
        } catch (Exception e) {
            System.err.println("Error adding staff to restaurant: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Xóa nhân viên khỏi cửa hàng
     */
    @Transactional
    public boolean removeStaffFromRestaurant(int restaurantId, int userId) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty() || restaurantOpt.get().getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant not found or not owned by user");
            }
            
            Optional<RestaurantStaff> staffOpt = restaurantStaffRepository.findByUserId(userId);
            if (staffOpt.isEmpty() || staffOpt.get().getRestaurant().getId() != restaurantId) {
                throw new RuntimeException("Staff not found or not assigned to this restaurant");
            }
            
            restaurantStaffRepository.delete(staffOpt.get());
            return true;
        } catch (Exception e) {
            System.err.println("Error removing staff from restaurant: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Xóa cửa hàng (chỉ owner của cửa hàng mới có thể xóa)
     */
    @Transactional
    public boolean deleteRestaurant(int restaurantId) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty()) {
                throw new RuntimeException("Restaurant not found: " + restaurantId);
            }
            
            Restaurant restaurant = restaurantOpt.get();
            
            // Kiểm tra owner
            if (restaurant.getOwner() == null || restaurant.getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant không thuộc về bạn. Bạn không có quyền xóa cửa hàng này.");
            }
            
            // Kiểm tra xem cửa hàng có đơn hàng đang xử lý không (tùy chọn)
            // Có thể thêm logic kiểm tra đơn hàng đang pending/processing
            
            // Xóa cửa hàng
            restaurantReponsitory.delete(restaurant);
            return true;
        } catch (RuntimeException e) {
            System.err.println("Error deleting restaurant: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Error deleting restaurant: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi xóa cửa hàng: " + e.getMessage());
        }
    }

    /**
     * Cập nhật trạng thái nhân viên (WORKING, ON_LEAVE, RESIGNED)
     */
    @Transactional
    public com.example.food_delivery.dto.response.RestaurantStaffDTO updateStaffStatus(int restaurantId, int userId, String status) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty() || restaurantOpt.get().getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant not found or not owned by user");
            }
            
            // Validate status - Hỗ trợ các status mới
            if (status == null) {
                throw new RuntimeException("Status không được để trống!");
            }
            
            String upperStatus = status.toUpperCase();
            List<String> validStatuses = java.util.Arrays.asList(
                "WORKING", "ON_LEAVE", "RESIGNED",
                "TRUONG_CUA_HANG", "NHAN_VIEN_CHINH_THUC", "NHAN_VIEN_BAN_THOI_GIAN"
            );
            
            if (!validStatuses.contains(upperStatus)) {
                throw new RuntimeException("Invalid status. Must be one of: " + String.join(", ", validStatuses));
            }
            
            Optional<RestaurantStaff> staffOpt = restaurantStaffRepository.findByUserIdAndRestaurantId(userId, restaurantId);
            if (staffOpt.isEmpty()) {
                throw new RuntimeException("Staff not found or not assigned to this restaurant");
            }
            
            RestaurantStaff staff = staffOpt.get();
            staff.setStatus(status);
            
            // Nếu status là RESIGNED, set isActive = false
            if ("RESIGNED".equals(status)) {
                staff.setActive(false);
            } else {
                staff.setActive(true);
            }
            
            restaurantStaffRepository.save(staff);
            
            // Return DTO
            com.example.food_delivery.dto.response.RestaurantStaffDTO staffDTO = new com.example.food_delivery.dto.response.RestaurantStaffDTO();
            staffDTO.setId(staff.getId());
            staffDTO.setUserId(staff.getUser().getId());
            staffDTO.setUserName(staff.getUser().getUserName());
            staffDTO.setFullName(staff.getUser().getFullName());
            staffDTO.setEmail(staff.getUser().getEmail());
            staffDTO.setPhoneNumber(staff.getUser().getPhoneNumber());
            staffDTO.setAvatar(staff.getUser().getAvatar());
            staffDTO.setRestaurantId(restaurantId);
            staffDTO.setRestaurantName(restaurantOpt.get().getTitle());
            staffDTO.setCreatedDate(staff.getCreatedDate());
            staffDTO.setActive(staff.isActive());
            staffDTO.setStatus(staff.getStatus());
            
            return staffDTO;
        } catch (Exception e) {
            System.err.println("Error updating staff status: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Cập nhật thông tin nhân viên (isActive)
     */
    @Transactional
    public com.example.food_delivery.dto.response.RestaurantStaffDTO updateStaffActive(int restaurantId, int userId, boolean isActive) {
        try {
            int ownerId = getCurrentOwnerId();
            
            Optional<Restaurant> restaurantOpt = restaurantReponsitory.findById(restaurantId);
            if (restaurantOpt.isEmpty() || restaurantOpt.get().getOwner().getId() != ownerId) {
                throw new RuntimeException("Restaurant not found or not owned by user");
            }
            
            Optional<RestaurantStaff> staffOpt = restaurantStaffRepository.findByUserIdAndRestaurantId(userId, restaurantId);
            if (staffOpt.isEmpty()) {
                throw new RuntimeException("Staff not found or not assigned to this restaurant");
            }
            
            RestaurantStaff staff = staffOpt.get();
            staff.setActive(isActive);
            
            restaurantStaffRepository.save(staff);
            
            // Return DTO
            com.example.food_delivery.dto.response.RestaurantStaffDTO staffDTO = new com.example.food_delivery.dto.response.RestaurantStaffDTO();
            staffDTO.setId(staff.getId());
            staffDTO.setUserId(staff.getUser().getId());
            staffDTO.setUserName(staff.getUser().getUserName());
            staffDTO.setFullName(staff.getUser().getFullName());
            staffDTO.setEmail(staff.getUser().getEmail());
            staffDTO.setPhoneNumber(staff.getUser().getPhoneNumber());
            staffDTO.setAvatar(staff.getUser().getAvatar());
            staffDTO.setRestaurantId(restaurantId);
            staffDTO.setRestaurantName(restaurantOpt.get().getTitle());
            staffDTO.setCreatedDate(staff.getCreatedDate());
            staffDTO.setActive(staff.isActive());
            staffDTO.setStatus(staff.getStatus() != null ? staff.getStatus() : "WORKING");
            
            return staffDTO;
        } catch (Exception e) {
            System.err.println("Error updating staff active status: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}

