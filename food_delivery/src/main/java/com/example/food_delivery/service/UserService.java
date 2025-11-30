package com.example.food_delivery.service;

import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.domain.entity.Roles;
import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.request.UserUpdateRequest;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.reponsitory.RoleRepository;
import com.example.food_delivery.service.imp.UserServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        if (request.getFullname() != null) user.setFullName(request.getFullname());
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        user = userReponsitory.save(user);
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
            System.out.println("UserService.getUsersByRole - Role: " + roleName);
            List<Users> users = userReponsitory.findByRoleName(roleName);
            System.out.println("UserService.getUsersByRole - Found " + users.size() + " users");
            return users.stream().map(this::toDTO).collect(Collectors.toList());
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
            List<Users> users;
            if (keyword == null || keyword.trim().isEmpty()) {
                users = userReponsitory.findByRoleName(roleName);
            } else {
                users = userReponsitory.findByRoleNameAndKeyword(roleName, keyword.trim());
            }
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

    private UserDTO toDTO(Users user) {
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
}
