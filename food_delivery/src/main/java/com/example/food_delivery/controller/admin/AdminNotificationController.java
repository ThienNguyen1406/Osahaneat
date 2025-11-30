package com.example.food_delivery.controller.admin;

import com.example.food_delivery.domain.entity.Notification;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.NotificationServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController("adminNotificationController")
@RequestMapping("/admin/notification")
public class AdminNotificationController {

    @Autowired
    NotificationServiceImp notificationServiceImp;

    /**
     * GET /admin/notification - Lấy tất cả thông báo (admin)
     * Yêu cầu quyền ADMIN
     */
    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllNotifications() {
        ResponseData responseData = new ResponseData();
        try {
            List<Notification> notifications = notificationServiceImp.getAllNotifications();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(notifications);
            responseData.setDesc("Lấy danh sách thông báo thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting all notifications: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách thông báo: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /admin/notification - Tạo thông báo cho user
     * Yêu cầu quyền ADMIN
     * Body: { userId: int, title: String, content: String, type: String, link: String }
     */
    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createNotification(
            @RequestParam int userId,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String link) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            if (title == null || title.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Tiêu đề không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            if (content == null || content.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Nội dung không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            Notification notification = notificationServiceImp.createNotification(
                    userId, title, content, type != null ? type : "SYSTEM", link);

            if (notification != null) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(notification);
                responseData.setDesc("Tạo thông báo thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Tạo thông báo thất bại!");
            }
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error creating notification: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi tạo thông báo: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

