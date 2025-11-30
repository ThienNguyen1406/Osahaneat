package com.example.food_delivery.controller.restaurant;

import com.example.food_delivery.dto.response.DashboardStatsDTO;
import com.example.food_delivery.dto.response.MenuDTO;
import com.example.food_delivery.dto.response.OrderDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.dto.response.RestaurantDTO;
import com.example.food_delivery.dto.response.PromoDTO;
import com.example.food_delivery.dto.response.RestaurantStaffDTO;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.service.RestaurantOwnerService;
import com.example.food_delivery.service.imp.PromoServiceImp;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/restaurant/owner")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RestaurantOwnerController {

    RestaurantOwnerService restaurantOwnerService;
    PromoServiceImp promoService;

    /**
     * GET /restaurant/owner/my-restaurants - Lấy danh sách cửa hàng của owner
     * Use Case: Manage Store
     */
    @GetMapping("/my-restaurants")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> getMyRestaurants() {
        ResponseData responseData = new ResponseData();
        try {
            List<RestaurantDTO> restaurants = restaurantOwnerService.getMyRestaurants();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(restaurants);
            responseData.setDesc("Lấy danh sách cửa hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting my restaurants: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách cửa hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /restaurant/owner - Tạo cửa hàng mới (với file upload)
     * Use Case: Manage Store
     */
    @PostMapping()
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> createRestaurant(
            @RequestParam(required = false) MultipartFile file,
            @RequestParam String title,
            @RequestParam(required = false) String subtitle,
            @RequestParam(required = false) String description,
            @RequestParam String address,
            @RequestParam String open_date,
            @RequestParam(required = false, defaultValue = "false") boolean is_freeship,
            @RequestParam(required = false, defaultValue = "true") boolean is_active) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (title == null || title.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tên cửa hàng không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (address == null || address.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Địa chỉ không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (open_date == null || open_date.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Ngày khai trương không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            RestaurantDTO created = restaurantOwnerService.createRestaurantWithFile(
                    file, title, subtitle, description, address, open_date, is_freeship, is_active);
            if (created != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(created);
                responseData.setDesc("Tạo cửa hàng thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tạo cửa hàng thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tạo cửa hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /restaurant/owner/dashboard/stats - Thống kê dashboard
     * Use Case: View Reports
     */
    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> getDashboardStats(
            @RequestParam(required = false) Integer restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            DashboardStatsDTO stats = restaurantOwnerService.getDashboardStats(restaurantId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(stats);
            responseData.setDesc("Lấy thống kê dashboard thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy thống kê dashboard: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /restaurant/owner/revenue/daily - Doanh thu theo ngày
     * Use Case: View Reports
     */
    @GetMapping("/revenue/daily")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> getDailyRevenue(
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(required = false) Integer restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            if (days < 1 || days > 30) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Days phải từ 1 đến 30!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            Map<String, Long> revenue = restaurantOwnerService.getDailyRevenue(days, restaurantId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(revenue);
            responseData.setDesc("Lấy doanh thu theo ngày thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting daily revenue: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy doanh thu theo ngày: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /restaurant/owner/orders/status - Đơn hàng theo trạng thái
     * Use Case: View Reports
     */
    @GetMapping("/orders/status")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> getOrdersByStatus(
            @RequestParam(required = false) Integer restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            Map<String, Integer> statusMap = restaurantOwnerService.getOrdersByStatus(restaurantId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(statusMap);
            responseData.setDesc("Lấy thống kê đơn hàng theo trạng thái thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting orders by status: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy thống kê đơn hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /restaurant/owner/{restaurantId} - Cập nhật cửa hàng (với file upload)
     * Use Case: Manage Store
     */
    @PutMapping("/{restaurantId}")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> updateRestaurant(
            @PathVariable int restaurantId,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String subtitle,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String address,
            @RequestParam(required = false, defaultValue = "false") Boolean is_freeship,
            @RequestParam(required = false, defaultValue = "true") Boolean is_active) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            RestaurantDTO updated = restaurantOwnerService.updateRestaurantWithFile(
                    restaurantId, file, title, subtitle, description, 
                    address, is_freeship != null ? is_freeship : false, 
                    is_active != null ? is_active : true);
            
            if (updated != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(updated);
                responseData.setDesc("Cập nhật cửa hàng thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy cửa hàng với ID: " + restaurantId);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error updating restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật cửa hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /restaurant/owner/{restaurantId}/menu - Quản lý menu
     * Use Case: Manage Store
     */
    @GetMapping("/{restaurantId}/menu")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> getRestaurantMenu(@PathVariable int restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            List<MenuDTO> menus = restaurantOwnerService.getRestaurantMenu(restaurantId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(menus);
            responseData.setDesc("Lấy danh sách menu thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
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

    /**
     * GET /restaurant/owner/{restaurantId}/orders - Đơn hàng cửa hàng
     * Use Case: View Reports
     */
    @GetMapping("/{restaurantId}/orders")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> getRestaurantOrders(
            @PathVariable int restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<OrderDTO> ordersPage = restaurantOwnerService.getRestaurantOrders(restaurantId, pageable);
            
            Map<String, Object> result = new HashMap<>();
            result.put("orders", ordersPage.getContent());
            result.put("totalElements", ordersPage.getTotalElements());
            result.put("totalPages", ordersPage.getTotalPages());
            result.put("currentPage", page);
            result.put("pageSize", size);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(result);
            responseData.setDesc("Lấy danh sách đơn hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
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
     * POST /restaurant/owner/{restaurantId}/staff/create - Tạo tài khoản nhân viên mới
     * Use Case: Manage Store
     */
    @PostMapping("/{restaurantId}/staff/create")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> createStaffAccount(
            @PathVariable int restaurantId,
            @RequestBody Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            String userName = request.get("userName");
            String password = request.get("password");
            String fullName = request.get("fullName");
            String phoneNumber = request.get("phoneNumber");
            
            if (userName == null || userName.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Username không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (password == null || password.trim().isEmpty() || password.length() < 8) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Mật khẩu phải có ít nhất 8 ký tự!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (fullName == null || fullName.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Họ và tên không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            UserDTO userDTO = restaurantOwnerService.createStaffAccount(
                    restaurantId, userName, password, fullName, phoneNumber);
            
            if (userDTO != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(userDTO);
                responseData.setDesc("Tạo tài khoản nhân viên thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tạo tài khoản nhân viên thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating staff account: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tạo tài khoản nhân viên: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /restaurant/owner/{restaurantId}/menu - Tạo món ăn cho cửa hàng
     * Use Case: Manage Store
     */
    @PostMapping("/{restaurantId}/menu")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> createMenu(
            @PathVariable int restaurantId,
            @RequestParam MultipartFile file,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String time_ship,
            @RequestParam double price,
            @RequestParam int cate_id,
            @RequestParam(required = false, defaultValue = "false") boolean is_freeship,
            @RequestParam(required = false, defaultValue = "15000") Double shippingFee) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (file == null || file.isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("File ảnh không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (title == null || title.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tên món ăn không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (price <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Giá phải lớn hơn 0!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (cate_id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Category ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            MenuDTO menu = restaurantOwnerService.createMenu(
                    restaurantId, file, title, description, time_ship, price, cate_id, is_freeship, shippingFee);
            
            if (menu != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(menu);
                responseData.setDesc("Tạo món ăn thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tạo món ăn thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating menu: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tạo món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /restaurant/owner/{restaurantId}/menu/{menuId} - Cập nhật món ăn
     * Use Case: Manage Store
     */
    @PutMapping("/{restaurantId}/menu/{menuId}")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> updateMenu(
            @PathVariable int restaurantId,
            @PathVariable int menuId,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String time_ship,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) Integer cate_id,
            @RequestParam(required = false) Boolean is_freeship,
            @RequestParam(required = false) Double shippingFee) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0 || menuId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID hoặc Menu ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            MenuDTO menu = restaurantOwnerService.updateMenu(
                    restaurantId, menuId, file, title, description, time_ship, price, cate_id, is_freeship, shippingFee);
            
            if (menu != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(menu);
                responseData.setDesc("Cập nhật món ăn thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Cập nhật món ăn thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error updating menu: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /restaurant/owner/{restaurantId}/menu/{menuId}/toggle - Bật/tắt món ăn (ẩn/hiện)
     * Use Case: Manage Store
     */
    @PutMapping("/{restaurantId}/menu/{menuId}/toggle")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> toggleMenuAvailability(
            @PathVariable int restaurantId,
            @PathVariable int menuId,
            @RequestBody Map<String, Boolean> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0 || menuId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID hoặc Menu ID không hợp lệ!");
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
            
            MenuDTO menu = restaurantOwnerService.toggleMenuAvailability(restaurantId, menuId, isAvailable);
            
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
            System.err.println("Error toggling menu availability: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật trạng thái món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /restaurant/owner/{restaurantId}/menu/{menuId} - Xóa món ăn
     * Use Case: Manage Store
     */
    @DeleteMapping("/{restaurantId}/menu/{menuId}")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> deleteMenu(
            @PathVariable int restaurantId,
            @PathVariable int menuId) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0 || menuId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID hoặc Menu ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            boolean deleted = restaurantOwnerService.deleteMenu(restaurantId, menuId);
            
            if (deleted) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa món ăn thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Xóa món ăn thất bại! Có thể món ăn không tồn tại hoặc đang được sử dụng.");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error deleting menu: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xóa món ăn: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /restaurant/owner/all-staff - Lấy tất cả nhân viên của owner (tất cả cửa hàng)
     * Use Case: Manage Store
     */
    @GetMapping("/all-staff")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> getAllStaff() {
        ResponseData responseData = new ResponseData();
        try {
            List<RestaurantStaffDTO> staffList = restaurantOwnerService.getAllStaff();
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(staffList);
            responseData.setDesc("Lấy danh sách nhân viên thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting all staff: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách nhân viên: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /restaurant/owner/{restaurantId}/staff - Quản lý nhân viên
     * Use Case: Manage Store
     */
    @GetMapping("/{restaurantId}/staff")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> getRestaurantStaff(@PathVariable int restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            List<RestaurantStaffDTO> staff = restaurantOwnerService.getRestaurantStaff(restaurantId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(staff);
            responseData.setDesc("Lấy danh sách nhân viên thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error getting restaurant staff: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách nhân viên: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /restaurant/owner/{restaurantId}/staff - Thêm nhân viên
     * Use Case: Manage Store
     */
    @PostMapping("/{restaurantId}/staff")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> addStaffToRestaurant(
            @PathVariable int restaurantId,
            @RequestBody Map<String, Integer> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            Integer userId = request.get("userId");
            if (userId == null || userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            boolean success = restaurantOwnerService.addStaffToRestaurant(restaurantId, userId);
            if (success) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Thêm nhân viên vào cửa hàng thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không thể thêm nhân viên vào cửa hàng!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error adding staff to restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi thêm nhân viên: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /restaurant/owner/{restaurantId}/staff/{userId} - Xóa nhân viên
     * Use Case: Manage Store
     */
    @DeleteMapping("/{restaurantId}/staff/{userId}")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> removeStaffFromRestaurant(
            @PathVariable int restaurantId,
            @PathVariable int userId) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0 || userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID hoặc User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            boolean success = restaurantOwnerService.removeStaffFromRestaurant(restaurantId, userId);
            if (success) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa nhân viên khỏi cửa hàng thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không thể xóa nhân viên khỏi cửa hàng!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error removing staff from restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xóa nhân viên: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /restaurant/owner/{restaurantId}/staff/{userId}/status - Cập nhật trạng thái nhân viên
     * Use Case: Manage Store
     */
    @PutMapping("/{restaurantId}/staff/{userId}/status")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> updateStaffStatus(
            @PathVariable int restaurantId,
            @PathVariable int userId,
            @RequestBody Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0 || userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID hoặc User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            String status = request.get("status");
            if (status == null || status.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Status không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            RestaurantStaffDTO updated = 
                    restaurantOwnerService.updateStaffStatus(restaurantId, userId, status.trim().toUpperCase());
            
            if (updated != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(updated);
                responseData.setDesc("Cập nhật trạng thái nhân viên thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không thể cập nhật trạng thái nhân viên!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error updating staff status: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật trạng thái nhân viên: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /restaurant/owner/{restaurantId}/staff/{userId}/active - Cập nhật trạng thái active của nhân viên
     * Use Case: Manage Store
     */
    @PutMapping("/{restaurantId}/staff/{userId}/active")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> updateStaffActive(
            @PathVariable int restaurantId,
            @PathVariable int userId,
            @RequestBody Map<String, Boolean> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0 || userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID hoặc User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            Boolean isActive = request.get("isActive");
            if (isActive == null) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("isActive không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            RestaurantStaffDTO updated = 
                    restaurantOwnerService.updateStaffActive(restaurantId, userId, isActive);
            
            if (updated != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(updated);
                responseData.setDesc("Cập nhật trạng thái active của nhân viên thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không thể cập nhật trạng thái active của nhân viên!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error updating staff active status: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật trạng thái active của nhân viên: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /restaurant/owner/{restaurantId} - Xóa cửa hàng
     * Use Case: Manage Store
     */
    @DeleteMapping("/{restaurantId}")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> deleteRestaurant(@PathVariable int restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            boolean deleted = restaurantOwnerService.deleteRestaurant(restaurantId);
            
            if (deleted) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa cửa hàng thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Xóa cửa hàng thất bại! Có thể cửa hàng không tồn tại hoặc không thuộc về bạn.");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error deleting restaurant: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xóa cửa hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /restaurant/owner/{restaurantId}/promos - Lấy danh sách promo của cửa hàng
     * Use Case: Manage Promotions
     */
    @GetMapping("/{restaurantId}/promos")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> getRestaurantPromos(@PathVariable int restaurantId) {
        ResponseData responseData = new ResponseData();
        try {
            // Cho phép restaurantId = 0 để lấy tất cả promo (bao gồm promo áp dụng cho tất cả)
            Integer finalRestaurantId = (restaurantId <= 0) ? null : restaurantId;
            
            List<PromoDTO> promos = promoService.getPromosByRestaurant(finalRestaurantId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(promos);
            responseData.setDesc("Lấy danh sách khuyến mãi thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting restaurant promos: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách khuyến mãi: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /restaurant/owner/{restaurantId}/promos - Tạo promo mới
     * Use Case: Manage Promotions
     */
    @PostMapping("/{restaurantId}/promos")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> createPromo(
            @PathVariable int restaurantId,
            @RequestBody Map<String, Object> promoData) {
        ResponseData responseData = new ResponseData();
        try {
            // Kiểm tra xem có áp dụng cho tất cả nhà hàng không
            boolean applyToAll = false;
            if (promoData.containsKey("applyToAll")) {
                Object applyToAllObj = promoData.get("applyToAll");
                if (applyToAllObj instanceof Boolean) {
                    applyToAll = (Boolean) applyToAllObj;
                } else if (applyToAllObj instanceof String) {
                    applyToAll = Boolean.parseBoolean((String) applyToAllObj);
                }
            }
            
            // Nếu không áp dụng cho tất cả, yêu cầu restaurantId hợp lệ
            if (!applyToAll && restaurantId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Nếu áp dụng cho tất cả, set restaurantId = null
            Integer finalRestaurantId = applyToAll ? null : restaurantId;
            
            PromoDTO createdPromo = promoService.createPromo(finalRestaurantId, promoData);
            
            if (createdPromo != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(createdPromo);
                responseData.setDesc("Tạo khuyến mãi thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tạo khuyến mãi thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating promo: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tạo khuyến mãi: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /restaurant/owner/{restaurantId}/promos/{promoId} - Xóa promo
     * Use Case: Manage Promotions
     */
    @DeleteMapping("/{restaurantId}/promos/{promoId}")
    @PreAuthorize("hasAuthority('ROLE_RESTAURANT_OWNER')")
    public ResponseEntity<?> deletePromo(
            @PathVariable int restaurantId,
            @PathVariable int promoId) {
        ResponseData responseData = new ResponseData();
        try {
            if (restaurantId < 0 || promoId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Restaurant ID hoặc Promo ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            boolean deleted = promoService.deletePromo(promoId);
            
            if (deleted) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setDesc("Xóa khuyến mãi thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setDesc("Không tìm thấy khuyến mãi để xóa!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("Error deleting promo: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setDesc("Lỗi server khi xóa khuyến mãi: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

