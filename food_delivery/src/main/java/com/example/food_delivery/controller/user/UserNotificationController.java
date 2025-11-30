package com.example.food_delivery.controller.user;

import com.example.food_delivery.domain.entity.Notification;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.NotificationServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController("userNotificationController")
@RequestMapping("/notification")
public class UserNotificationController {

    @Autowired
    NotificationServiceImp notificationServiceImp;

    /**
     * GET /notification - Lấy danh sách thông báo của user
     * Yêu cầu authentication
     */
    @GetMapping()
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserNotifications(@RequestParam int userId) {
        ResponseData responseData = new ResponseData();
        try {
            if (userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            List<Notification> notifications = notificationServiceImp.getUserNotifications(userId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(notifications);
            responseData.setDesc("Lấy danh sách thông báo thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting user notifications: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách thông báo: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /notification/unread - Lấy danh sách thông báo chưa đọc
     * Yêu cầu authentication
     */
    @GetMapping("/unread")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUnreadNotifications(@RequestParam int userId) {
        ResponseData responseData = new ResponseData();
        try {
            if (userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            List<Notification> notifications = notificationServiceImp.getUnreadNotifications(userId);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(notifications);
            responseData.setDesc("Lấy danh sách thông báo chưa đọc thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting unread notifications: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy thông báo chưa đọc: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /notification/count - Lấy số lượng thông báo chưa đọc
     * Yêu cầu authentication
     */
    @GetMapping("/count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUnreadCount(@RequestParam int userId) {
        ResponseData responseData = new ResponseData();
        try {
            if (userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            long count = notificationServiceImp.getUnreadCount(userId);
            Map<String, Long> result = new HashMap<>();
            result.put("count", count);
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(result);
            responseData.setDesc("Lấy số lượng thông báo chưa đọc thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy số lượng thông báo: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /notification/{id}/read - Đánh dấu thông báo là đã đọc
     * Yêu cầu authentication
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> markAsRead(@PathVariable int id, @RequestParam int userId) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0 || userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            boolean result = notificationServiceImp.markAsRead(id, userId);
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Đánh dấu đã đọc thành công!");
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không tìm thấy thông báo hoặc không có quyền!");
            }
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi đánh dấu đã đọc: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /notification/read-all - Đánh dấu tất cả thông báo là đã đọc
     * Yêu cầu authentication
     */
    @PutMapping("/read-all")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> markAllAsRead(@RequestParam int userId) {
        ResponseData responseData = new ResponseData();
        try {
            if (userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("User ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            boolean result = notificationServiceImp.markAllAsRead(userId);
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Đánh dấu tất cả đã đọc thành công!");
            } else {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Đánh dấu tất cả đã đọc thất bại!");
            }
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi đánh dấu tất cả đã đọc: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /notification/{id} - Xóa thông báo
     * Yêu cầu authentication
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteNotification(@PathVariable int id, @RequestParam int userId) {
        ResponseData responseData = new ResponseData();
        try {
            if (id <= 0 || userId <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            boolean result = notificationServiceImp.deleteNotification(id, userId);
            if (result) {
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(true);
                responseData.setDesc("Xóa thông báo thành công!");
            } else {
                responseData.setStatus(404);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Không tìm thấy thông báo hoặc không có quyền!");
            }
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting notification: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi xóa thông báo: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

