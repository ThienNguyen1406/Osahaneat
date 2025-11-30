package com.example.food_delivery.controller.admin;

import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/admin/shipper")
@PreAuthorize("hasRole('ADMIN')")
public class AdminShipperController {

    @Autowired
    private UserService userService;

    /**
     * PUT /admin/shipper/{id}/approve - Duyệt shipper
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveShipper(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Shipper ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            var user = userService.approveShipper(id);
            if (user != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(user);
                responseData.setDesc("Duyệt shipper thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy shipper với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error approving shipper: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi duyệt shipper: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /admin/shipper/{id} - Xóa shipper
     * Yêu cầu quyền ADMIN
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShipper(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Shipper ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            boolean deleted = userService.deleteUser(id);
            if (deleted) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa shipper thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Không tìm thấy shipper với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error deleting shipper: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi xóa shipper: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /admin/shipper/{id}/reset-password - Cấp lại mật khẩu cho shipper
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetShipperPassword(
            @PathVariable int id,
            @RequestBody(required = false) Map<String, String> request) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Shipper ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            String newPassword = null;
            if (request != null && request.containsKey("password")) {
                newPassword = request.get("password");
            }
            
            var user = userService.resetShipperPassword(id, newPassword);
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
                responseData.setDesc("Không tìm thấy shipper với ID: " + id);
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error resetting shipper password: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cấp lại mật khẩu: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

