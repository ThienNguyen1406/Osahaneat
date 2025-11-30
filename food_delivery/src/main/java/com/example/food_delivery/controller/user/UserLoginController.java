package com.example.food_delivery.controller.user;

import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.request.LoginRequest;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.service.AuthenticationService;
import com.example.food_delivery.service.imp.LoginServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/login")
public class UserLoginController {
    @Autowired
    LoginServiceImp loginServiceImp;

    @Autowired
    AuthenticationService authenticationService;
    
    @Autowired
    UserReponsitory userReponsitory;

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestParam String username, @RequestParam String password) {
        ResponseData responseData = new ResponseData();
        System.out.println("=== LOGIN REQUEST ===");
        System.out.println("Username: " + username);
        System.out.println("Password length: " + (password != null ? password.length() : 0));
        
        try {
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername(username);
            loginRequest.setPassword(password);
            
            var authResponse = authenticationService.checkLogin(loginRequest);
            
            System.out.println("=== LOGIN SUCCESS ===");
            System.out.println("Authenticated: " + authResponse.isAuthenticated());
            System.out.println("Token length: " + (authResponse.getToken() != null ? authResponse.getToken().length() : 0));
            
            if (authResponse.isAuthenticated() && authResponse.getToken() != null) {
                responseData.setStatus(200);
                responseData.setData(authResponse.getToken());
                responseData.setSuccess(true);
                responseData.setDesc("Đăng nhập thành công");
            } else {
                responseData.setStatus(400);
                responseData.setData("");
                responseData.setSuccess(false);
                responseData.setDesc("Đăng nhập thất bại");
            }
        } catch (com.example.food_delivery.exception.AppException e) {
            System.err.println("=== LOGIN FAILED - AppException ===");
            System.err.println("Username: " + username);
            System.err.println("Exception: " + e.getMessage());
            System.err.println("ErrorCode: " + e.getErrorCode());
            
            responseData.setStatus(400);
            responseData.setData("");
            responseData.setSuccess(false);
            
            String errorMessage = "Sai tên đăng nhập hoặc mật khẩu";
            if (e.getErrorCode() != null) {
                String errorCodeStr = e.getErrorCode().toString();
                if (errorCodeStr.contains("USER_NOT_EXISTED") || errorCodeStr.contains("NOT_EXIST")) {
                    errorMessage = "Tài khoản không tồn tại. Vui lòng kiểm tra email: " + username;
                } else if (errorCodeStr.contains("UNAUTHENTICATED") || errorCodeStr.contains("UNAUTHORIZED")) {
                    errorMessage = "Mật khẩu không đúng. Vui lòng thử lại.";
                }
            }
            responseData.setDesc(errorMessage);
        } catch (Exception e) {
            System.err.println("=== LOGIN ERROR - Exception ===");
            System.err.println("Username: " + username);
            System.err.println("Exception: " + e.getMessage());
            System.err.println("Exception class: " + e.getClass().getName());
            e.printStackTrace();
            
            responseData.setStatus(400);
            responseData.setData("");
            responseData.setSuccess(false);
            responseData.setDesc("Lỗi đăng nhập: " + e.getMessage());
        }
        
        System.out.println("=== LOGIN RESPONSE ===");
        System.out.println("Status: " + responseData.getStatus());
        System.out.println("Success: " + responseData.isSuccess());
        System.out.println("Desc: " + responseData.getDesc());
        System.out.println("Has token: " + (responseData.getData() != null && !responseData.getData().toString().isEmpty()));

        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    /**
     * Check admin user status - Public endpoint for debugging
     */
    @GetMapping("/check-admin-user")
    public ResponseEntity<?> checkAdminUser() {
        ResponseData responseData = new ResponseData();
        try {
            var adminUserOpt = userReponsitory.findFirstByUserName("admin@gmail.com");
            if (adminUserOpt.isEmpty()) {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setDesc("Admin user không tồn tại trong database");
                responseData.setData(null);
            } else {
                Users adminUser = adminUserOpt.get();
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setDesc("Admin user tồn tại");
                responseData.setData("ID: " + adminUser.getId() + 
                    ", Role: " + (adminUser.getRoles() != null ? adminUser.getRoles().getRoleName() : "null") +
                    ", Has password: " + (adminUser.getPassword() != null && !adminUser.getPassword().isEmpty()));
            }
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setDesc("Error: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signUpRequest) {
        ResponseData responseData = new ResponseData();
        
        try {
            // Validate input
            if (signUpRequest.getUserName() == null || signUpRequest.getUserName().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setDesc("Tên đăng nhập không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (signUpRequest.getPassword() == null || signUpRequest.getPassword().length() < 8) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setDesc("Mật khẩu phải có ít nhất 8 ký tự!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (signUpRequest.getFullname() == null || signUpRequest.getFullname().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setDesc("Họ và tên không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            Boolean result = loginServiceImp.addUser(signUpRequest);
            
            if (result != null && result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Đăng ký thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Đăng ký thất bại! Tên đăng nhập có thể đã tồn tại.");
            }
        } catch (Exception e) {
            System.err.println("Signup error: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server: " + e.getMessage());
        }
        
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}

