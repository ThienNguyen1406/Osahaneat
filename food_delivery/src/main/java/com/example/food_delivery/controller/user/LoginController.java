package com.example.food_delivery.controller.user;

import com.example.food_delivery.dto.request.LoginRequest;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for /login endpoints (for backward compatibility with frontend)
 * This controller forwards requests to the actual /auth endpoints
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/login")
public class LoginController {
    
    @Autowired
    AuthenticationService authenticationService;
    
    /**
     * POST /login/signin - Login endpoint (alias for /auth/signin)
     * This endpoint is called by frontend, so we need to support it
     */
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestParam String username, @RequestParam String password) {
        ResponseData responseData = new ResponseData();
        System.out.println("=== LOGIN REQUEST (via /login/signin) ===");
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
}

