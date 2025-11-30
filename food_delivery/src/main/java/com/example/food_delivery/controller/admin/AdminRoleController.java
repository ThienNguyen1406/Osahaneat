package com.example.food_delivery.controller.admin;

import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.reponsitory.RoleRepository;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.domain.entity.Roles;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController("adminRoleController")
@RequestMapping("/admin/role")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminRoleController {

    RoleRepository roleRepository;
    UserReponsitory userReponsitory;

    /**
     * GET /admin/role - Lấy danh sách tất cả roles với số lượng users
     * Yêu cầu quyền ADMIN
     */
    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllRoles() {
        ResponseData responseData = new ResponseData();
        try {
            List<Roles> roles = roleRepository.findAll();
            
            // Tạo DTO với số lượng users cho mỗi role
            List<Map<String, Object>> rolesWithCount = roles.stream().map(role -> {
                Map<String, Object> roleData = new HashMap<>();
                roleData.put("id", role.getId());
                roleData.put("roleName", role.getRoleName());
                roleData.put("description", getRoleDescription(role.getRoleName()));
                
                // Đếm số lượng users có role này
                long userCount = userReponsitory.findByRoleName(role.getRoleName()).size();
                roleData.put("userCount", userCount);
                
                return roleData;
            }).collect(Collectors.toList());
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(rolesWithCount);
            responseData.setDesc("Lấy danh sách roles thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting all roles: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách roles: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /admin/role - Tạo role mới
     * Yêu cầu quyền ADMIN
     */
    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createRole(@RequestBody Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            String roleName = request.get("roleName");
            String description = request.get("description");
            
            if (roleName == null || roleName.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tên vai trò không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Kiểm tra role đã tồn tại chưa
            java.util.Optional<Roles> existingRoleOpt = roleRepository.findByRoleName(roleName.trim().toUpperCase());
            if (existingRoleOpt.isPresent()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Vai trò đã tồn tại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Tạo role mới
            Roles newRole = new Roles();
            newRole.setRoleName(roleName.trim().toUpperCase());
            newRole.setCreatedDate(new java.util.Date());
            newRole = roleRepository.save(newRole);
            
            // Tạo response với userCount = 0
            Map<String, Object> roleData = new HashMap<>();
            roleData.put("id", newRole.getId());
            roleData.put("roleName", newRole.getRoleName());
            roleData.put("description", description != null ? description.trim() : getRoleDescription(newRole.getRoleName()));
            roleData.put("userCount", 0L);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(roleData);
            responseData.setDesc("Tạo vai trò thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error creating role: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tạo vai trò: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /admin/role/{id} - Cập nhật role
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(@PathVariable int id, @RequestBody Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Role ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            java.util.Optional<Roles> roleOpt = roleRepository.findById(id);
            if (roleOpt.isEmpty()) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy vai trò với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            Roles role = roleOpt.get();
            String roleName = request.get("roleName");
            String description = request.get("description");
            
            // Cập nhật roleName nếu có
            if (roleName != null && !roleName.trim().isEmpty()) {
                // Kiểm tra roleName mới có trùng với role khác không
                java.util.Optional<Roles> existingRoleOpt = roleRepository.findByRoleName(roleName.trim().toUpperCase());
                if (existingRoleOpt.isPresent() && existingRoleOpt.get().getId() != id) {
                    responseData.setStatus(400);
                    responseData.setSuccess(false);
                    responseData.setData(null);
                    responseData.setDesc("Tên vai trò đã tồn tại!");
                    return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
                }
                role.setRoleName(roleName.trim().toUpperCase());
            }
            
            role = roleRepository.save(role);
            
            // Tạo response với userCount
            long userCount = userReponsitory.findByRoleName(role.getRoleName()).size();
            Map<String, Object> roleData = new HashMap<>();
            roleData.put("id", role.getId());
            roleData.put("roleName", role.getRoleName());
            roleData.put("description", description != null ? description.trim() : getRoleDescription(role.getRoleName()));
            roleData.put("userCount", userCount);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(roleData);
            responseData.setDesc("Cập nhật vai trò thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error updating role: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật vai trò: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /admin/role/{id} - Xóa role
     * Yêu cầu quyền ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRole(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Role ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            java.util.Optional<Roles> roleOpt = roleRepository.findById(id);
            if (roleOpt.isEmpty()) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không tìm thấy vai trò với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            Roles role = roleOpt.get();
            
            // Kiểm tra xem còn người dùng nào có role này không
            long userCount = userReponsitory.findByRoleName(role.getRoleName()).size();
            if (userCount > 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không thể xóa vai trò này vì vẫn còn " + userCount + " người dùng đang sử dụng!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Xóa role
            roleRepository.delete(role);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(true);
            responseData.setDesc("Xóa vai trò thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting role: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi xóa vai trò: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Helper method để lấy mô tả cho role
     */
    private String getRoleDescription(String roleName) {
        if (roleName == null) return "Chưa có mô tả";
        
        switch (roleName.toUpperCase()) {
            case "ADMIN":
                return "Quản trị viên hệ thống";
            case "USER":
                return "Người dùng thông thường";
            case "DRIVER":
                return "Tài xế giao hàng";
            case "RESTAURANT_STAFF":
                return "Nhân viên nhà hàng";
            case "RESTAURANT_OWNER":
                return "Chủ nhà hàng";
            default:
                return "Chưa có mô tả";
        }
    }
}

