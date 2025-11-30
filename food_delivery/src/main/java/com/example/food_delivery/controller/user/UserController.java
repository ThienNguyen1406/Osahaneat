package com.example.food_delivery.controller.user;

import com.example.food_delivery.dto.request.UserUpdateRequest;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController("userController")
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * GET /user/me - Lấy thông tin user hiện tại
     * Yêu cầu authentication (user)
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyInfo() {
        ResponseData responseData = new ResponseData();
        try {
            UserDTO user = userService.getMyInfo();
            
            if (user == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy thông tin user!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(user);
            responseData.setDesc("Lấy thông tin user thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting user info: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy thông tin user: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /user/profile - Cập nhật thông tin profile của user hiện tại
     * Yêu cầu authentication (user)
     * Body: UserUpdateRequest { fullname, phoneNumber, email, address, password (optional) }
     * File: avatar (optional) - MultipartFile
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(
            @RequestParam(required = false) String fullname,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) MultipartFile avatar) {
        ResponseData responseData = new ResponseData();
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                responseData.setStatus(401);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Chưa đăng nhập!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
            
            // Get user info to get userId
            UserDTO currentUser = userService.getMyInfo();
            if (currentUser == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy thông tin user!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            // Handle avatar upload
            String avatarPath = null;
            if (avatar != null && !avatar.isEmpty()) {
                try {
                    avatarPath = saveAvatarFile(avatar, currentUser.getId());
                } catch (Exception e) {
                    System.err.println("Error saving avatar: " + e.getMessage());
                    e.printStackTrace();
                    responseData.setStatus(400);
                    responseData.setSuccess(false);
                    responseData.setData(null);
                    responseData.setDesc("Lỗi khi upload ảnh đại diện: " + e.getMessage());
                    return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
                }
            }
            
            // Create update request
            UserUpdateRequest updateRequest = UserUpdateRequest.builder()
                    .fullname(fullname)
                    .phoneNumber(phoneNumber)
                    .email(email)
                    .address(address)
                    .password(password)
                    .avatar(avatarPath)
                    .build();
            
            // Update user
            UserDTO updatedUser = userService.updateUser(currentUser.getId(), updateRequest);
            
            if (updatedUser == null) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Cập nhật thông tin thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(updatedUser);
            responseData.setDesc("Cập nhật thông tin thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật thông tin: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /user/avatar - Xóa ảnh đại diện
     * Yêu cầu authentication (user)
     */
    @DeleteMapping("/avatar")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteAvatar() {
        ResponseData responseData = new ResponseData();
        try {
            // Get current authenticated user
            UserDTO currentUser = userService.getMyInfo();
            if (currentUser == null) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy thông tin user!");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            
            // Update user with null avatar
            UserUpdateRequest updateRequest = UserUpdateRequest.builder()
                    .avatar("")
                    .build();
            
            UserDTO updatedUser = userService.updateUser(currentUser.getId(), updateRequest);
            
            if (updatedUser == null) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Xóa ảnh đại diện thất bại!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(updatedUser);
            responseData.setDesc("Xóa ảnh đại diện thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting avatar: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xóa ảnh đại diện: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Save avatar file to server
     */
    private String saveAvatarFile(MultipartFile file, int userId) throws IOException {
        // Create upload directory if not exists
        String uploadDir = "uploads/user/avatar/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";
        String filename = "avatar_" + userId + "_" + UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = Paths.get(uploadDir + filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative path for database storage
        return "user/avatar/" + filename;
    }
}

