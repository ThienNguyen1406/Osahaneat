package com.example.food_delivery.service;

import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.domain.entity.EmailVerificationToken;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.reponsitory.EmailVerificationTokenRepository;
import com.example.food_delivery.service.imp.LoginServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LoginService implements LoginServiceImp {
    @Autowired
    UserReponsitory userReponsitory;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Autowired
    EmailService emailService;

    public List<UserDTO> getAllUsers() {
        List<Users> listUser = userReponsitory.findAll();
        List<UserDTO> userDTOList = new ArrayList<>();

        for (Users user : listUser) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setUserName(user.getUserName());
            userDTO.setPassword(user.getPassword());
            userDTO.setFullName(user.getFullName());
            userDTO.setCreateDate(user.getCreateDate());

            userDTOList.add(userDTO);

        }
        return userDTOList;
    }

    @Override
    public Boolean checkLogin(String username, String password) {
       var userOpt = userReponsitory.findFirstByUserName(username);
       if (userOpt.isEmpty()) {
           return false;
       }
       Users users = userOpt.get();
        return passwordEncoder.matches(password,users.getPassword());
    }

    @Override
    public Boolean addUser(SignupRequest signUpRequest) {
        try {
            // Check if user already exists
            var existingUserOpt = userReponsitory.findFirstByUserName(signUpRequest.getUserName());
            if (existingUserOpt.isPresent()) {
                System.err.println("User already exists: " + signUpRequest.getUserName());
                return false;
            }
            
            Users users = new Users();
            users.setFullName(signUpRequest.getFullname());
            // Encode password before saving
            users.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
            users.setUserName(signUpRequest.getUserName());
            users.setEmail(signUpRequest.getEmail()); // Lưu email từ request
            users.setPhoneNumber(signUpRequest.getPhoneNumber()); // Lưu số điện thoại
            users.setEmailVerified(false); // Email chưa được xác nhận
            users.setCreateDate(new Date());

            // Save user - will throw exception if fails
            users = userReponsitory.save(users);
            System.out.println("User created successfully: " + signUpRequest.getUserName());
            
            // Tạo token xác nhận email
            String token = UUID.randomUUID().toString();
            Date expiryDate = new Date(System.currentTimeMillis() + (24 * 60 * 60 * 1000)); // 24 giờ
            
            EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                    .user(users)
                    .token(token)
                    .expiryDate(expiryDate)
                    .used(false)
                    .build();
            
            emailVerificationTokenRepository.save(verificationToken);
            System.out.println("Verification token created for user: " + users.getUserName());
            
            // Gửi email xác nhận
            try {
                String userEmail = users.getEmail() != null && !users.getEmail().isEmpty() 
                    ? users.getEmail() 
                    : users.getUserName(); // Fallback to username if email is null
                
                String verificationLink = "http://localhost:82/verify-email.html?token=" + token;
                emailService.sendVerificationEmail(userEmail, users.getFullName() != null ? users.getFullName() : users.getUserName(), verificationLink);
                System.out.println("✅ Verification email sent to: " + userEmail);
            } catch (Exception e) {
                // Log error but don't fail the operation
                System.err.println("Warning: Could not send verification email: " + e.getMessage());
                e.printStackTrace();
            }
            
            return true;
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public Optional<EmailVerificationToken> verifyEmailToken(String token) {
        try {
            var tokenOpt = emailVerificationTokenRepository.findByToken(token);
            if (tokenOpt.isEmpty()) {
                System.out.println("Token not found: " + token);
                return Optional.empty();
            }
            
            EmailVerificationToken verificationToken = tokenOpt.get();
            
            // Check if token is already used
            if (verificationToken.getUsed()) {
                System.out.println("Token already used: " + token);
                return Optional.empty();
            }
            
            // Check if token is expired
            if (verificationToken.getExpiryDate().before(new Date())) {
                System.out.println("Token expired: " + token);
                return Optional.empty();
            }
            
            return Optional.of(verificationToken);
        } catch (Exception e) {
            System.err.println("Error verifying email token: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }

    @Override
    public Users saveUser(Users user) {
        return userReponsitory.save(user);
    }

    @Override
    public EmailVerificationToken saveVerificationToken(EmailVerificationToken token) {
        return emailVerificationTokenRepository.save(token);
    }
}
