package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.domain.entity.Roles;
import com.example.food_delivery.domain.entity.PasswordResetRequest;
import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.request.UserUpdateRequest;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.reponsitory.RoleRepository;
import com.example.food_delivery.reponsitory.PasswordResetRequestRepository;
import com.example.food_delivery.service.imp.UserServiceImp;
import com.example.food_delivery.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService implements UserServiceImp {

    @Autowired
    private UserReponsitory userReponsitory;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private PasswordResetRequestRepository passwordResetRequestRepository;
    
    @Autowired
    private EmailService emailService;

    @Override
    public List<UserDTO> getAllUser() {
        return userReponsitory.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public UserDTO addUser(SignupRequest signupRequest) {
        Users user = new Users();
        user.setFullName(signupRequest.getFullname());
        user.setUserName(signupRequest.getUserName());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user = userReponsitory.save(user);
        return toDTO(user);
    }

    @Override
    public UserDTO getUser(int id) {
        var user = userReponsitory.findById(id).orElse(null);
        return user == null ? null : toDTO(user);
    }

    @Override
    public UserDTO getMyInfo() {
        try {
            // Get current authenticated user from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                System.err.println("User not authenticated");
                return null;
            }
            
            // Get username from authentication
            String username = authentication.getName();
            System.out.println("Getting user info for: " + username);
            
            if (username == null || username.isEmpty()) {
                System.err.println("Username is null or empty");
                return null;
            }
            
            // Find user by username
            var userOpt = userReponsitory.findFirstByUserName(username);
            if (userOpt.isEmpty()) {
                System.err.println("User not found: " + username);
                return null;
            }
            Users user = userOpt.get();
            
            System.out.println("User found: " + user.getId() + " - " + user.getUserName());
            return toDTO(user);
        } catch (Exception e) {
            System.err.println("Error getting user info: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public UserDTO updateUser(int userId, UserUpdateRequest request) {
        var user = userReponsitory.findById(userId).orElse(null);
        if (user == null) return null;
        
        // Track what changed for email notification
        boolean passwordChanged = false;
        String newPassword = null;
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            newPassword = request.getPassword();
            user.setPassword(passwordEncoder.encode(newPassword));
            passwordChanged = true;
        }
        
        if (request.getFullname() != null) user.setFullName(request.getFullname());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        
        user = userReponsitory.save(user);
        
        // Gửi email thông báo nếu mật khẩu được thay đổi
        if (passwordChanged && newPassword != null) {
            try {
                String userEmail = user.getEmail() != null && !user.getEmail().isEmpty() 
                    ? user.getEmail() 
                    : user.getUserName(); // Fallback to username if email is null
                emailService.sendPasswordResetEmail(userEmail, user.getFullName() != null ? user.getFullName() : user.getUserName(), newPassword);
                System.out.println("✅ Email notification sent for password change to: " + userEmail);
            } catch (Exception e) {
                // Log error but don't fail the operation
                System.err.println("Warning: Could not send password change email: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return toDTO(user);
    }

    /**
     * Assign role to user (Admin only)
     */
    public UserDTO assignRoleToUser(int userId, String roleName) {
        var user = userReponsitory.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        
        Optional<Roles> roleOpt = roleRepository.findByRoleName(roleName);
        if (roleOpt.isEmpty()) {
            throw new IllegalArgumentException("Role not found: " + roleName);
        }
        
        user.setRoles(roleOpt.get());
        user = userReponsitory.save(user);
        return toDTO(user);
    }

    /**
     * Assign ADMIN role to user (Admin only)
     */
    public UserDTO grantAdminRole(int userId) {
        return assignRoleToUser(userId, "ADMIN");
    }

    /**
     * Assign USER role to user (Admin only)
     */
    public UserDTO grantUserRole(int userId) {
        return assignRoleToUser(userId, "USER");
    }

    /**
     * Assign RESTAURANT_STAFF role to user (Admin only)
     */
    public UserDTO grantRestaurantStaffRole(int userId) {
        return assignRoleToUser(userId, "RESTAURANT_STAFF");
    }

    /**
     * Assign DRIVER role to user (Admin only)
     */
    public UserDTO grantDriverRole(int userId) {
        return assignRoleToUser(userId, "DRIVER");
    }

    /**
     * Assign RESTAURANT_OWNER role to user (Admin only)
     */
    public UserDTO grantRestaurantOwnerRole(int userId) {
        return assignRoleToUser(userId, "RESTAURANT_OWNER");
    }

    /**
     * Delete user by ID (Admin only)
     */
    public boolean deleteUser(int userId) {
        try {
            Optional<Users> userOpt = userReponsitory.findById(userId);
            if (userOpt.isEmpty()) {
                return false;
            }
            
            Users user = userOpt.get();
            // Check if user is admin (prevent deleting admin accounts)
            if (user.getRoles() != null && "ADMIN".equalsIgnoreCase(user.getRoles().getRoleName())) {
                throw new IllegalArgumentException("Không thể xóa tài khoản admin!");
            }
            
            userReponsitory.delete(user);
            return true;
        } catch (Exception e) {
            System.err.println("Error deleting user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Search users by keyword (username or fullname)
     */
    public List<UserDTO> searchUsers(String keyword) {
        try {
            List<Users> users = userReponsitory.searchUsers(keyword);
            return users.stream().map(this::toDTO).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }

    /**
     * Get user by username
     */
    public UserDTO getUserByUsername(String username) {
        try {
            var userOpt = userReponsitory.findFirstByUserName(username);
            return userOpt.map(this::toDTO).orElse(null);
        } catch (Exception e) {
            System.err.println("Error getting user by username: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Get all users with a specific role (e.g., DRIVER)
     */
    public List<UserDTO> getUsersByRole(String roleName) {
        try {
            System.out.println("=== UserService.getUsersByRole ===");
            System.out.println("Role: " + roleName);
            List<Users> users = userReponsitory.findByRoleName(roleName);
            System.out.println("Found " + users.size() + " users with role: " + roleName);
            
            // Log chi tiết từng user
            for (Users user : users) {
                System.out.println("  - User ID: " + user.getId() + 
                    ", Username: " + user.getUserName() + 
                    ", FullName: " + user.getFullName() + 
                    ", Phone: " + user.getPhoneNumber() + 
                    ", Email: " + user.getEmail() +
                    ", Role: " + (user.getRoles() != null ? user.getRoles().getRoleName() : "null") +
                    ", isApproved: " + user.getIsApproved());
            }
            
            List<UserDTO> dtos = users.stream().map(this::toDTO).collect(Collectors.toList());
            System.out.println("Converted to " + dtos.size() + " DTOs");
            
            // Log chi tiết từng DTO
            for (UserDTO dto : dtos) {
                System.out.println("  - DTO ID: " + dto.getId() + 
                    ", Username: " + dto.getUserName() + 
                    ", FullName: " + dto.getFullName() + 
                    ", Phone: " + dto.getPhoneNumber() + 
                    ", Email: " + dto.getEmail() +
                    ", isApproved: " + dto.getIsApproved());
            }
            
            return dtos;
        } catch (Exception e) {
            System.err.println("Error getting users by role: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }

    /**
     * Search users by role and keyword
     */
    public List<UserDTO> searchUsersByRole(String roleName, String keyword) {
        try {
            System.out.println("=== UserService.searchUsersByRole ===");
            System.out.println("Role: " + roleName + ", Keyword: " + keyword);
            List<Users> users;
            if (keyword == null || keyword.trim().isEmpty()) {
                users = userReponsitory.findByRoleName(roleName);
            } else {
                users = userReponsitory.findByRoleNameAndKeyword(roleName, keyword.trim());
            }
            System.out.println("Found " + users.size() + " users");
            return users.stream().map(this::toDTO).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error searching users by role: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }

    /**
     * Register shipper (public endpoint)
     * Creates user with DRIVER role and isApproved = false
     */
    public UserDTO registerShipper(SignupRequest signupRequest) {
        try {
            // Check if username already exists
            var existingUserOpt = userReponsitory.findFirstByUserName(signupRequest.getUserName().trim());
            if (existingUserOpt.isPresent()) {
                System.err.println("Username already exists: " + signupRequest.getUserName());
                return null;
            }
            
            // Get DRIVER role
            Optional<Roles> driverRoleOpt = roleRepository.findByRoleName("DRIVER");
            if (driverRoleOpt.isEmpty()) {
                System.err.println("DRIVER role not found!");
                return null;
            }
            
            // Create new user
            Users user = new Users();
            user.setFullName(signupRequest.getFullname());
            user.setUserName(signupRequest.getUserName().trim());
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            // Phone number is optional in SignupRequest
            if (signupRequest.getPhoneNumber() != null) {
                user.setPhoneNumber(signupRequest.getPhoneNumber());
            }
            user.setRoles(driverRoleOpt.get());
            user.setIsApproved(false); // Mặc định chưa được duyệt
            user.setCreateDate(new java.util.Date());
            
            user = userReponsitory.save(user);
            return toDTO(user);
        } catch (Exception e) {
            System.err.println("Error registering shipper: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Approve shipper (Admin only)
     */
    public UserDTO approveShipper(int userId) {
        try {
            Optional<Users> userOpt = userReponsitory.findById(userId);
            if (userOpt.isEmpty()) {
                return null;
            }
            
            Users user = userOpt.get();
            // Check if user is DRIVER
            if (user.getRoles() == null || !"DRIVER".equalsIgnoreCase(user.getRoles().getRoleName())) {
                throw new IllegalArgumentException("User không phải là shipper!");
            }
            
            user.setIsApproved(true);
            user = userReponsitory.save(user);
            return toDTO(user);
        } catch (Exception e) {
            System.err.println("Error approving shipper: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Reset password for shipper (Admin only)
     */
    public UserDTO resetShipperPassword(int userId, String newPassword) {
        try {
            Optional<Users> userOpt = userReponsitory.findById(userId);
            if (userOpt.isEmpty()) {
                return null;
            }
            
            Users user = userOpt.get();
            // Check if user is DRIVER
            if (user.getRoles() == null || !"DRIVER".equalsIgnoreCase(user.getRoles().getRoleName())) {
                throw new IllegalArgumentException("User không phải là shipper!");
            }
            
            // Default password if not provided
            if (newPassword == null || newPassword.trim().isEmpty()) {
                newPassword = "123456"; // Default password
            }
            
            user.setPassword(passwordEncoder.encode(newPassword));
            user = userReponsitory.save(user);
            return toDTO(user);
        } catch (Exception e) {
            System.err.println("Error resetting shipper password: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Reset password for any user (Admin only)
     */
    public UserDTO resetUserPassword(int userId, String newPassword) {
        try {
            Optional<Users> userOpt = userReponsitory.findById(userId);
            if (userOpt.isEmpty()) {
                return null;
            }
            
            Users user = userOpt.get();
            
            // IMPORTANT: Preserve user role before resetting password
            Roles userRole = user.getRoles();
            String roleName = userRole != null ? userRole.getRoleName() : "NULL";
            System.out.println("✅ User current role before reset: " + roleName);
            
            // Default password if not provided
            if (newPassword == null || newPassword.trim().isEmpty()) {
                newPassword = "123456"; // Default password
            }
            
            // Reset password but preserve role
            user.setPassword(passwordEncoder.encode(newPassword));
            // Ensure role is preserved
            if (userRole != null && user.getRoles() == null) {
                System.out.println("⚠️ WARNING: User role was null, restoring role: " + roleName);
                user.setRoles(userRole);
            }
            
            user = userReponsitory.save(user);
            
            // Verify role is still present after save
            Users savedUser = userReponsitory.findById(user.getId()).orElse(null);
            if (savedUser != null) {
                String savedRoleName = savedUser.getRoles() != null ? savedUser.getRoles().getRoleName() : "NULL";
                System.out.println("✅ User role after save: " + savedRoleName);
                if (!roleName.equals(savedRoleName)) {
                    System.err.println("❌ ERROR: User role changed from " + roleName + " to " + savedRoleName);
                    System.err.println("❌ Restoring original role...");
                    savedUser.setRoles(userRole);
                    userReponsitory.save(savedUser);
                    System.out.println("✅ Role restored to: " + roleName);
                }
            }
            
            // Gửi email thông báo mật khẩu mới
            try {
                String userEmail = user.getEmail() != null && !user.getEmail().isEmpty() 
                    ? user.getEmail() 
                    : user.getUserName(); // Fallback to username if email is null
                emailService.sendPasswordResetEmail(userEmail, user.getFullName() != null ? user.getFullName() : user.getUserName(), newPassword);
            } catch (Exception e) {
                // Log error but don't fail the operation
                System.err.println("Warning: Could not send password reset email: " + e.getMessage());
                e.printStackTrace();
            }
            
            return toDTO(user);
        } catch (Exception e) {
            System.err.println("Error resetting user password: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Create password reset request
     */
    public PasswordResetRequest createPasswordResetRequest(int userId, String reason) {
        try {
            Optional<Users> userOpt = userReponsitory.findById(userId);
            if (userOpt.isEmpty()) {
                throw new IllegalArgumentException("User không tồn tại!");
            }
            
            Users user = userOpt.get();
            
            // Check if there's already a pending request
            Optional<PasswordResetRequest> existingRequest = 
                passwordResetRequestRepository.findLatestPendingRequestByUserId(userId);
            
            if (existingRequest.isPresent()) {
                throw new IllegalArgumentException("Bạn đã có yêu cầu đang chờ xử lý!");
            }
            
            PasswordResetRequest request = PasswordResetRequest.builder()
                .user(user)
                .requestDate(new Date())
                .status("PENDING")
                .reason(reason)
                .build();
            
            PasswordResetRequest savedRequest = passwordResetRequestRepository.save(request);
            System.out.println("✅ Password reset request saved to database: ID=" + savedRequest.getId());
            System.out.println("Saved request status: " + savedRequest.getStatus());
            System.out.println("Saved request user ID: " + (savedRequest.getUser() != null ? savedRequest.getUser().getId() : "null"));
            
            return savedRequest;
        } catch (Exception e) {
            System.err.println("Error creating password reset request: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Create password reset request by username/email
     */
    public PasswordResetRequest createPasswordResetRequestByUsername(String username, String reason) {
        try {
            System.out.println("=== createPasswordResetRequestByUsername called ===");
            System.out.println("Username: " + username);
            System.out.println("Reason: " + reason);
            
            Optional<Users> userOpt = userReponsitory.findFirstByUserName(username);
            if (userOpt.isEmpty()) {
                System.err.println("❌ User not found with username: " + username);
                throw new IllegalArgumentException("Không tìm thấy user với username/email: " + username);
            }
            
            Users user = userOpt.get();
            System.out.println("✅ User found: ID=" + user.getId() + ", Name=" + user.getFullName() + ", Email=" + user.getEmail());
            
            PasswordResetRequest request = createPasswordResetRequest(user.getId(), reason);
            System.out.println("✅ Password reset request created: ID=" + request.getId() + ", Status=" + request.getStatus());
            
            return request;
        } catch (Exception e) {
            System.err.println("❌ Error creating password reset request by username: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Get all password reset requests
     */
    public List<PasswordResetRequest> getAllPasswordResetRequests() {
        List<PasswordResetRequest> requests = passwordResetRequestRepository.findAll();
        System.out.println("=== getAllPasswordResetRequests ===");
        System.out.println("Total requests found: " + requests.size());
        for (PasswordResetRequest req : requests) {
            System.out.println("  Request ID: " + req.getId() + ", Status: " + req.getStatus() + ", User ID: " + (req.getUser() != null ? req.getUser().getId() : "null"));
        }
        return requests;
    }
    
    /**
     * Get pending password reset requests
     */
    public List<PasswordResetRequest> getPendingPasswordResetRequests() {
        List<PasswordResetRequest> requests = passwordResetRequestRepository.findByStatusOrderByRequestDateDesc("PENDING");
        System.out.println("=== getPendingPasswordResetRequests ===");
        System.out.println("Pending requests found: " + requests.size());
        for (PasswordResetRequest req : requests) {
            System.out.println("  Request ID: " + req.getId() + ", Status: " + req.getStatus() + ", User ID: " + (req.getUser() != null ? req.getUser().getId() : "null"));
        }
        return requests;
    }
    
    /**
     * Process password reset request (approve and reset password)
     * Returns a Map containing the PasswordResetRequest and the new password
     */
    public java.util.Map<String, Object> approvePasswordResetRequest(int requestId, String adminNotes, int adminUserId) {
        try {
            System.out.println("═══════════════════════════════════════════════════════════");
            System.out.println("=== UserService.approvePasswordResetRequest START ===");
            System.out.println("Request ID: " + requestId);
            System.out.println("Admin User ID: " + adminUserId);
            System.out.println("Admin Notes: " + adminNotes);
            System.out.println("═══════════════════════════════════════════════════════════");
            
            Optional<PasswordResetRequest> requestOpt = passwordResetRequestRepository.findById(requestId);
            if (requestOpt.isEmpty()) {
                System.err.println("❌ Request not found: " + requestId);
                throw new IllegalArgumentException("Không tìm thấy yêu cầu!");
            }
            
            PasswordResetRequest request = requestOpt.get();
            System.out.println("✅ Request found: ID=" + request.getId() + ", Status=" + request.getStatus());
            
            if (!"PENDING".equals(request.getStatus())) {
                System.err.println("❌ Request already processed: " + request.getStatus());
                throw new IllegalArgumentException("Yêu cầu này đã được xử lý!");
            }
            
            Optional<Users> adminOpt = userReponsitory.findById(adminUserId);
            if (adminOpt.isEmpty()) {
                System.err.println("❌ Admin not found: " + adminUserId);
                throw new IllegalArgumentException("Admin không tồn tại!");
            }
            
            Users admin = adminOpt.get();
            Users user = request.getUser();
            
            System.out.println("✅ Admin: " + admin.getUserName() + " (ID: " + admin.getId() + ")");
            System.out.println("✅ User: " + user.getUserName() + " (ID: " + user.getId() + ")");
            System.out.println("✅ User email: " + (user.getEmail() != null ? user.getEmail() : "NULL"));
            
            // IMPORTANT: Preserve user role before resetting password
            Roles userRole = user.getRoles();
            String roleName = userRole != null ? userRole.getRoleName() : "NULL";
            System.out.println("✅ User current role: " + roleName);
            
            // Generate random password 8 characters
            String newPassword = generateRandomPassword(8);
            System.out.println("✅ Generated random password: " + newPassword);
            
            // Reset password but preserve role
            user.setPassword(passwordEncoder.encode(newPassword));
            // Ensure role is preserved (should already be set, but double-check)
            if (userRole != null && user.getRoles() == null) {
                System.out.println("⚠️ WARNING: User role was null, restoring role: " + roleName);
                user.setRoles(userRole);
            }
            
            user = userReponsitory.save(user);
            System.out.println("✅ Password saved for user: " + user.getUserName());
            
            // Verify role is still present after save
            Users savedUser = userReponsitory.findById(user.getId()).orElse(null);
            if (savedUser != null) {
                String savedRoleName = savedUser.getRoles() != null ? savedUser.getRoles().getRoleName() : "NULL";
                System.out.println("✅ User role after save: " + savedRoleName);
                if (!roleName.equals(savedRoleName)) {
                    System.err.println("❌ ERROR: User role changed from " + roleName + " to " + savedRoleName);
                    System.err.println("❌ Restoring original role...");
                    savedUser.setRoles(userRole);
                    userReponsitory.save(savedUser);
                    System.out.println("✅ Role restored to: " + roleName);
                }
            }
            
            // Gửi email thông báo yêu cầu đã được duyệt
            boolean emailSent = false;
            String userEmail = user.getEmail() != null && !user.getEmail().isEmpty() 
                ? user.getEmail() 
                : user.getUserName(); // Fallback to username if email is null
            
            try {
                System.out.println("=== Attempting to send password reset email ===");
                System.out.println("User email: " + userEmail);
                System.out.println("New password: " + newPassword);
                
                emailService.sendPasswordResetApprovedEmail(userEmail, user.getFullName() != null ? user.getFullName() : user.getUserName(), newPassword);
                System.out.println("✅ Password reset email sent successfully to: " + userEmail);
                emailSent = true;
            } catch (Exception e) {
                // Log error but don't fail the operation
                String errorMsg = e.getMessage();
                System.err.println("═══════════════════════════════════════════════════════════");
                System.err.println("⚠️ EMAIL SENDING FAILED ⚠️");
                System.err.println("═══════════════════════════════════════════════════════════");
                System.err.println("Error: " + errorMsg);
                System.err.println("Exception: " + e.getClass().getName());
                if (e.getCause() != null) {
                    System.err.println("Cause: " + e.getCause().getMessage());
                }
                System.err.println("═══════════════════════════════════════════════════════════");
                System.err.println("⚠️ IMPORTANT: Password has been reset successfully!");
                System.err.println("⚠️ New password for user '" + user.getUserName() + "': " + newPassword);
                System.err.println("⚠️ User email: " + userEmail);
                System.err.println("═══════════════════════════════════════════════════════════");
                System.err.println("⚠️ TROUBLESHOOTING:");
                if (errorMsg != null && (errorMsg.contains("Authentication") || errorMsg.contains("535"))) {
                    System.err.println("   1. App Password phải là 16 ký tự (hiện tại: " + 
                        (errorMsg.contains("otikpfdzzbstafds") ? "15 ký tự" : "kiểm tra lại") + ")");
                    System.err.println("   2. Tạo App Password mới tại: https://myaccount.google.com/apppasswords");
                    System.err.println("   3. Đảm bảo 2-Step Verification đã được bật");
                }
                System.err.println("   4. Kiểm tra logs chi tiết ở trên để biết lỗi cụ thể");
                System.err.println("═══════════════════════════════════════════════════════════");
                System.err.println("⚠️ Full stack trace:");
                e.printStackTrace();
                emailSent = false;
            }
            
            // Update request
            request.setStatus("APPROVED");
            request.setAdminNotes(adminNotes);
            request.setProcessedBy(admin);
            request.setProcessedDate(new Date());
            
            PasswordResetRequest savedRequest = passwordResetRequestRepository.save(request);
            
            // Return both the request and the new password
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("request", savedRequest);
            result.put("newPassword", newPassword);
            result.put("emailSent", emailSent); // Updated based on actual email send result
            
            System.out.println("═══════════════════════════════════════════════════════════");
            System.out.println("=== Password reset request approved SUCCESSFULLY ===");
            System.out.println("Request ID: " + savedRequest.getId());
            System.out.println("New password: " + newPassword);
            System.out.println("Email sent: " + emailSent);
            System.out.println("User email: " + userEmail);
            System.out.println("═══════════════════════════════════════════════════════════");
            
            return result;
        } catch (Exception e) {
            System.err.println("Error approving password reset request: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Reject password reset request
     */
    public PasswordResetRequest rejectPasswordResetRequest(int requestId, String adminNotes, int adminUserId) {
        try {
            Optional<PasswordResetRequest> requestOpt = passwordResetRequestRepository.findById(requestId);
            if (requestOpt.isEmpty()) {
                throw new IllegalArgumentException("Không tìm thấy yêu cầu!");
            }
            
            PasswordResetRequest request = requestOpt.get();
            if (!"PENDING".equals(request.getStatus())) {
                throw new IllegalArgumentException("Yêu cầu này đã được xử lý!");
            }
            
            Optional<Users> adminOpt = userReponsitory.findById(adminUserId);
            if (adminOpt.isEmpty()) {
                throw new IllegalArgumentException("Admin không tồn tại!");
            }
            
            Users admin = adminOpt.get();
            
            // Update request
            request.setStatus("REJECTED");
            request.setAdminNotes(adminNotes);
            request.setProcessedBy(admin);
            request.setProcessedDate(new Date());
            
            return passwordResetRequestRepository.save(request);
        } catch (Exception e) {
            System.err.println("Error rejecting password reset request: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public UserDTO toDTO(Users user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUserName(user.getUserName());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setEmail(user.getEmail() != null ? user.getEmail() : "");
        dto.setAvatar(user.getAvatar() != null ? user.getAvatar() : "");
        dto.setAddress(user.getAddress() != null ? user.getAddress() : "");
        dto.setCreateDate(user.getCreateDate());
        if (user.getRoles() != null) {
            dto.setRoleName(user.getRoles().getRoleName());
        }
        // Add isApproved to DTO
        dto.setIsApproved(user.getIsApproved());
        return dto;
    }
    
    /**
     * Generate random password with specified length
     * Password contains uppercase, lowercase, numbers, and special characters
     */
    private String generateRandomPassword(int length) {
        String uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowercase = "abcdefghijklmnopqrstuvwxyz";
        String numbers = "0123456789";
        String special = "!@#$%^&*";
        String allChars = uppercase + lowercase + numbers + special;
        
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(length);
        
        // Ensure at least one character from each category
        password.append(uppercase.charAt(random.nextInt(uppercase.length())));
        password.append(lowercase.charAt(random.nextInt(lowercase.length())));
        password.append(numbers.charAt(random.nextInt(numbers.length())));
        password.append(special.charAt(random.nextInt(special.length())));
        
        // Fill the rest randomly
        for (int i = password.length(); i < length; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }
        
        // Shuffle the password to randomize positions
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }
        
        return new String(passwordArray);
    }
    
    /**
     * Test email sending functionality
     */
    public void testEmailSending(String toEmail) {
        try {
            System.out.println("=== Testing email sending ===");
            System.out.println("To: " + toEmail);
            String testPassword = "Test123!";
            emailService.sendPasswordResetApprovedEmail(toEmail, "Test User", testPassword);
            System.out.println("✅ Test email sent successfully!");
        } catch (Exception e) {
            System.err.println("❌ Test email failed: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
