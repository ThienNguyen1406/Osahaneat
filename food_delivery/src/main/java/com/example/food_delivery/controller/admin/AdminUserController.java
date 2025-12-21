package com.example.food_delivery.controller.admin;

import com.example.food_delivery.domain.entity.PasswordResetRequest;
import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.request.UserUpdateRequest;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.dto.response.PasswordResetRequestDTO;
import com.example.food_delivery.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin(origins = "*")
@RestController("adminUserController")
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminUserController {

    UserService userService;

    /**
     * GET /user - Lấy danh sách tất cả users
     * Yêu cầu quyền ADMIN
     */
    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUser() {
        ResponseData responseData = new ResponseData();
        try {
            var users = userService.getAllUser();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(users);
            responseData.setDesc("Lấy danh sách users thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting all users: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách users: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/search?keyword=... - Tìm kiếm users
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam String keyword) {
        ResponseData responseData = new ResponseData();
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Keyword không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            var users = userService.searchUsers(keyword.trim());
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(users);
            responseData.setDesc("Tìm kiếm users thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm users: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /user - Tạo user mới (Admin only)
     */
    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody SignupRequest signupRequest) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (signupRequest.getUserName() == null || signupRequest.getUserName().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Username không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (signupRequest.getPassword() == null || signupRequest.getPassword().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Password không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Check if username already exists
            try {
                var existingUser = userService.getUserByUsername(signupRequest.getUserName().trim());
                if (existingUser != null) {
                    responseData.setStatus(400);
                    responseData.setSuccess(false);
                    responseData.setData(null);
                    responseData.setDesc("Username đã tồn tại!");
                    return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
                }
            } catch (Exception e) {
                // If getUserByUsername throws exception, username might not exist - continue
            }
            
            UserDTO user = userService.addUser(signupRequest);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Tạo user thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(500);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tạo user thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tạo user: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/{id} - Lấy user theo ID
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            UserDTO user = userService.getUser(id);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Lấy thông tin user thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy user với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("Error getting user by id: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy thông tin user: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Note: GET /user/me endpoint has been moved to UserController
    // Admin can still get user info via GET /user/{id}

    /**
     * PUT /user/{id} - Cập nhật user
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody UserUpdateRequest request) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            UserDTO user = userService.updateUser(id, request);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Cập nhật user thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy user với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật user: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /user/{id} - Xóa user
     * Yêu cầu quyền ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            UserDTO user = userService.getUser(id);
            if (user == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không tìm thấy user với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            boolean deleted = userService.deleteUser(id);
            if (deleted) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa user thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(500);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Xóa user thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error deleting user: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi xóa user: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/{id}/grant-admin - Cấp quyền ADMIN cho user
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/grant-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> grantAdminRole(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            UserDTO user = userService.grantAdminRole(id);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Cấp quyền ADMIN thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy user với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error granting admin role: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cấp quyền ADMIN: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/{id}/grant-user - Cấp quyền USER cho user
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/grant-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> grantUserRole(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            UserDTO user = userService.grantUserRole(id);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Cấp quyền USER thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy user với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error granting user role: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cấp quyền USER: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/{id}/grant-restaurant-staff - Cấp quyền RESTAURANT_STAFF cho user
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/grant-restaurant-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> grantRestaurantStaffRole(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            UserDTO user = userService.grantRestaurantStaffRole(id);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Cấp quyền RESTAURANT_STAFF thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy user với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error granting restaurant staff role: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cấp quyền RESTAURANT_STAFF: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/{id}/grant-driver - Cấp quyền DRIVER cho user
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/grant-driver")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> grantDriverRole(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            UserDTO user = userService.grantDriverRole(id);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Cấp quyền DRIVER thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy user với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error granting driver role: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cấp quyền DRIVER: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/{id}/grant-restaurant-owner - Cấp quyền RESTAURANT_OWNER cho user
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/grant-restaurant-owner")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> grantRestaurantOwnerRole(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            UserDTO user = userService.grantRestaurantOwnerRole(id);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Cấp quyền RESTAURANT_OWNER thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy user với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error granting restaurant owner role: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cấp quyền RESTAURANT_OWNER: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/check-admin - Kiểm tra user hiện tại có quyền ADMIN không
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/check-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> checkAdmin() {
        ResponseData responseData = new ResponseData();
        responseData.setStatus(200);
        responseData.setSuccess(true);
        responseData.setData(true);
        responseData.setDesc("User có quyền ADMIN");
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    /**
     * GET /user/drivers - Lấy danh sách tất cả drivers (shippers)
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/drivers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllDrivers(@RequestParam(required = false) String keyword) {
        ResponseData responseData = new ResponseData();
        try {
            System.out.println("=== getAllDrivers called ===");
            System.out.println("Keyword: " + keyword);
            
            List<UserDTO> drivers;
            if (keyword != null && !keyword.trim().isEmpty()) {
                System.out.println("Searching drivers with keyword: " + keyword);
                drivers = userService.searchUsersByRole("DRIVER", keyword.trim());
            } else {
                System.out.println("Getting all drivers");
                drivers = userService.getUsersByRole("DRIVER");
            }
            
            System.out.println("Found " + drivers.size() + " drivers");
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(drivers);
            responseData.setDesc("Lấy danh sách drivers thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting all drivers: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách drivers: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/by-role/{roleName} - Lấy danh sách users theo role
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/by-role/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersByRole(@PathVariable String roleName) {
        ResponseData responseData = new ResponseData();
        try {
            System.out.println("=== getUsersByRole called ===");
            System.out.println("Role: " + roleName);
            
            List<UserDTO> users = userService.getUsersByRole(roleName.toUpperCase());
            
            System.out.println("Found " + users.size() + " users with role: " + roleName);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(users);
            responseData.setDesc("Lấy danh sách users thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting users by role: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách users: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Note: PUT /user/profile endpoint has been moved to UserController
    // to support multipart file upload for avatar
    // Admin can still update other users via PUT /user/{id}

    /**
     * PUT /user/{id}/reset-password - Cấp lại mật khẩu cho user (Admin only)
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetUserPassword(
            @PathVariable int id,
            @RequestBody(required = false) java.util.Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            String newPassword = null;
            if (request != null && request.containsKey("password")) {
                newPassword = request.get("password");
            }
            
            UserDTO user = userService.resetUserPassword(id, newPassword);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Cấp lại mật khẩu thành công! Mật khẩu mới: " + (newPassword != null ? newPassword : "123456"));
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy user với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error resetting user password: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cấp lại mật khẩu: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /user/password-reset-requests - Lấy danh sách yêu cầu quên mật khẩu (Admin only)
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/password-reset-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPasswordResetRequests(@RequestParam(required = false) String status) {
        ResponseData responseData = new ResponseData();
        try {
            System.out.println("=== getPasswordResetRequests called ===");
            System.out.println("Status filter: " + status);
            
            java.util.List<com.example.food_delivery.domain.entity.PasswordResetRequest> requests;
            if (status != null && !status.trim().isEmpty() && "PENDING".equalsIgnoreCase(status.trim())) {
                requests = userService.getPendingPasswordResetRequests();
                System.out.println("✅ Found " + requests.size() + " pending requests");
            } else {
                requests = userService.getAllPasswordResetRequests();
                System.out.println("✅ Found " + requests.size() + " total requests");
            }
            
            // Convert to DTO to avoid circular reference issues
            java.util.List<PasswordResetRequestDTO> requestDTOs = new java.util.ArrayList<>();
            for (com.example.food_delivery.domain.entity.PasswordResetRequest req : requests) {
                PasswordResetRequestDTO dto = PasswordResetRequestDTO.builder()
                    .id(req.getId())
                    .user(req.getUser() != null ? userService.getUser(req.getUser().getId()) : null)
                    .requestDate(req.getRequestDate())
                    .status(req.getStatus())
                    .adminNotes(req.getAdminNotes())
                    .processedBy(req.getProcessedBy() != null ? userService.getUser(req.getProcessedBy().getId()) : null)
                    .processedDate(req.getProcessedDate())
                    .reason(req.getReason())
                    .build();
                requestDTOs.add(dto);
            }
            
            System.out.println("✅ Converted " + requestDTOs.size() + " requests to DTOs");
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(requestDTOs);
            responseData.setDesc("Lấy danh sách yêu cầu quên mật khẩu thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("❌ Error getting password reset requests: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách yêu cầu: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/password-reset-requests/{id}/approve - Duyệt yêu cầu quên mật khẩu (Admin only)
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/password-reset-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approvePasswordResetRequest(
            @PathVariable int id,
            @RequestBody(required = false) java.util.Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            System.out.println("═══════════════════════════════════════════════════════════");
            System.out.println("=== APPROVE PASSWORD RESET REQUEST CALLED ===");
            System.out.println("Request ID: " + id);
            System.out.println("═══════════════════════════════════════════════════════════");
            
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Request ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            String adminNotes = null;
            if (request != null && request.containsKey("adminNotes")) {
                adminNotes = request.get("adminNotes");
            }
            System.out.println("Admin notes: " + adminNotes);
            
            // Get current admin user ID from security context
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            String adminUsername = authentication.getName();
            System.out.println("Admin username: " + adminUsername);
            
            var adminOpt = userService.getUserByUsername(adminUsername);
            if (adminOpt == null) {
                System.err.println("❌ Admin not found: " + adminUsername);
                responseData.setStatus(403);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không thể xác định admin!");
                return new ResponseEntity<>(responseData, HttpStatus.FORBIDDEN);
            }
            
            System.out.println("Admin ID: " + adminOpt.getId());
            System.out.println("Calling userService.approvePasswordResetRequest...");
            
            var result = userService.approvePasswordResetRequest(id, adminNotes, adminOpt.getId());
            
            System.out.println("✅ approvePasswordResetRequest returned result: " + (result != null ? "NOT NULL" : "NULL"));
            if (result != null && result.containsKey("request")) {
                PasswordResetRequest resetRequest = (PasswordResetRequest) result.get("request");
                String newPassword = (String) result.get("newPassword");
                Boolean emailSent = (Boolean) result.get("emailSent");
                
                // Convert to DTO for safe serialization
                PasswordResetRequestDTO requestDTO = PasswordResetRequestDTO.builder()
                        .id(resetRequest.getId())
                        .user(resetRequest.getUser() != null ? userService.getUser(resetRequest.getUser().getId()) : null)
                        .requestDate(resetRequest.getRequestDate())
                        .status(resetRequest.getStatus())
                        .reason(resetRequest.getReason())
                        .adminNotes(resetRequest.getAdminNotes())
                        .processedBy(resetRequest.getProcessedBy() != null ? userService.getUser(resetRequest.getProcessedBy().getId()) : null)
                        .processedDate(resetRequest.getProcessedDate())
                        .build();
                
                // Create response data with password info
                java.util.Map<String, Object> responseDataMap = new java.util.HashMap<>();
                responseDataMap.put("request", requestDTO);
                responseDataMap.put("newPassword", newPassword);
                responseDataMap.put("emailSent", emailSent);
                
                String descMessage = "Duyệt yêu cầu quên mật khẩu thành công!";
                if (emailSent) {
                    descMessage += " Email đã được gửi với mật khẩu mới.";
                } else {
                    descMessage += " ⚠️ Email không gửi được. Mật khẩu mới: " + newPassword;
                }
                
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(responseDataMap);
                responseData.setDesc(descMessage);
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy yêu cầu với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error approving password reset request: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi duyệt yêu cầu: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/password-reset-requests/{id}/reject - Từ chối yêu cầu quên mật khẩu (Admin only)
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/password-reset-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectPasswordResetRequest(
            @PathVariable int id,
            @RequestBody(required = false) java.util.Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Request ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            String adminNotes = null;
            if (request != null && request.containsKey("adminNotes")) {
                adminNotes = request.get("adminNotes");
            }
            
            // Get current admin user ID from security context
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            String adminUsername = authentication.getName();
            var adminOpt = userService.getUserByUsername(adminUsername);
            if (adminOpt == null) {
                responseData.setStatus(403);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không thể xác định admin!");
                return new ResponseEntity<>(responseData, HttpStatus.FORBIDDEN);
            }
            
            var resetRequest = userService.rejectPasswordResetRequest(id, adminNotes, adminOpt.getId());
            if (resetRequest != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(resetRequest);
                responseData.setDesc("Từ chối yêu cầu quên mật khẩu thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy yêu cầu với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error rejecting password reset request: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi từ chối yêu cầu: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /user/test-email - Test email sending (Admin only, for debugging)
     * Yêu cầu quyền ADMIN
     */
    @PostMapping("/test-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testEmail(@RequestBody java.util.Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            String toEmail = request.get("toEmail");
            if (toEmail == null || toEmail.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Email không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            // Test sending email
            userService.testEmailSending(toEmail);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(null);
            responseData.setDesc("Email test đã được gửi đến: " + toEmail + ". Vui lòng kiểm tra inbox và spam folder.");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error testing email: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi gửi email test: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

