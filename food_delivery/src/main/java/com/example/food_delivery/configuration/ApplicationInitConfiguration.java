package com.example.food_delivery.configuration;

import com.example.food_delivery.domain.entity.Roles;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.reponsitory.RoleRepository;
import com.example.food_delivery.reponsitory.UserReponsitory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
@Order(2)
public class ApplicationInitConfiguration implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;
    private final UserReponsitory userRepository;
    private final RoleRepository roleRepository;
    @Value("${user-admin.email}")
    private String adminEmail;

    @Value("${user-admin.password}")
    private String adminPassword;

    public ApplicationInitConfiguration(PasswordEncoder passwordEncoder, UserReponsitory userRepository, RoleRepository roleRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Tạo ADMIN role nếu chưa có
        Optional<Roles> adminRoleOpt = roleRepository.findByRoleName("ADMIN");
        Roles adminRole;
        if (adminRoleOpt.isEmpty()) {
            adminRole = Roles.builder()
                    .roleName("ADMIN")
                    .createdDate(new java.util.Date())
                    .build();
            adminRole = roleRepository.save(adminRole);
        } else {
            adminRole = adminRoleOpt.get();
        }

        // Tạo USER role nếu chưa có
        Optional<Roles> userRoleOpt = roleRepository.findByRoleName("USER");
        Roles userRole;
        if (userRoleOpt.isEmpty()) {
            userRole = Roles.builder()
                    .roleName("USER")
                    .createdDate(new java.util.Date())
                    .build();
            userRole = roleRepository.save(userRole);
        } else {
            userRole = userRoleOpt.get();
        }

        // Tạo admin user nếu chưa có
        log.info("🔍 Checking admin user: {} - Password from config: {}", adminEmail, adminPassword != null ? "***" : "NULL");
        Optional<Users> adminUserOpt = userRepository.findFirstByUserName(adminEmail);
        Users adminUser = adminUserOpt.orElse(null);
        if (adminUser == null) {
            log.info("📝 Admin user not found, creating new admin user...");
            String encodedPassword = passwordEncoder.encode(adminPassword);
            log.info("🔐 Password encoded successfully (length: {})", encodedPassword.length());
            
            adminUser = Users.builder()
                    .userName(adminEmail)
                    .password(encodedPassword)
                    .fullName("Admin User")
                    .createDate(new java.util.Date())
                    .roles(adminRole)
                    .build();
            adminUser = userRepository.save(adminUser);
            log.info("✅ Admin user created successfully: {} with ADMIN role (ID: {})", adminEmail, adminUser.getId());
            
            // Verify password can be matched
            boolean passwordMatch = passwordEncoder.matches(adminPassword, adminUser.getPassword());
            log.info("🔐 Password verification test: {}", passwordMatch ? "✅ PASSED" : "❌ FAILED");
        } else {
            // Đảm bảo admin user có ADMIN role - luôn cập nhật nếu thiếu
            boolean needUpdate = false;
            if (adminUser.getRoles() == null) {
                adminUser.setRoles(adminRole);
                needUpdate = true;
                log.warn("⚠️ Admin user {} had no role, assigned ADMIN role", adminEmail);
            } else if (!adminUser.getRoles().getRoleName().equals("ADMIN")) {
                adminUser.setRoles(adminRole);
                needUpdate = true;
                log.warn("⚠️ Admin user {} had role {}, changed to ADMIN", 
                        adminEmail, adminUser.getRoles().getRoleName());
            }
            
            // Đảm bảo password đúng với config (để reset password nếu cần)
            boolean passwordMatches = passwordEncoder.matches(adminPassword, adminUser.getPassword());
            log.info("🔐 Testing admin password match: {}", passwordMatches ? "✅ MATCH" : "❌ NO MATCH");
            
            if (!passwordMatches) {
                log.warn("⚠️ Admin password does not match config, updating password...");
                adminUser.setPassword(passwordEncoder.encode(adminPassword));
                needUpdate = true;
                log.warn("⚠️ Admin password updated to match configuration");
                
                // Verify new password
                boolean newPasswordMatch = passwordEncoder.matches(adminPassword, adminUser.getPassword());
                log.info("🔐 New password verification test: {}", newPasswordMatch ? "✅ PASSED" : "❌ FAILED");
            }
            
            if (needUpdate) {
                adminUser = userRepository.save(adminUser);
                log.info("✅ Admin user updated: {} with ADMIN role", adminEmail);
            } else {
                log.info("✅ Admin user already exists: {} with ADMIN role", adminEmail);
            }
        }
        
        log.info("✅ Admin user initialized and ready: {} (Role: {})", 
                adminEmail, adminUser.getRoles().getRoleName());
    }
}
