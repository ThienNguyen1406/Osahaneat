package com.example.food_delivery.controller.shipper;

import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/shipper")
public class ShipperController {

    @Autowired
    private UserService userService;

    /**
     * POST /shipper/register - Đăng ký shipper (public endpoint)
     * Shipper tự đăng ký, mặc định isApproved = false, cần admin duyệt
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerShipper(@RequestBody SignupRequest signupRequest) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (signupRequest.getUserName() == null || signupRequest.getUserName().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Email không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (signupRequest.getPassword() == null || signupRequest.getPassword().length() < 8) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Mật khẩu phải có ít nhất 8 ký tự!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (signupRequest.getFullname() == null || signupRequest.getFullname().trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Họ và tên không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            // Register shipper with isApproved = false
            var user = userService.registerShipper(signupRequest);
            
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Đăng ký shipper thành công! Tài khoản của bạn đang chờ admin duyệt.");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Đăng ký thất bại! Email có thể đã tồn tại.");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.err.println("Error registering shipper: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi đăng ký shipper: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

