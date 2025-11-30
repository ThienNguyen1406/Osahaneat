package com.example.food_delivery.controller.admin;

import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.SearchServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController("adminSearchController")
@RequestMapping("/admin/search")
public class AdminSearchController {

    @Autowired
    SearchServiceImp searchServiceImp;

    /**
     * GET /admin/search/user?keyword={keyword} - Tìm kiếm users (admin only)
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam String keyword) {
        ResponseData responseData = new ResponseData();
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Từ khóa tìm kiếm không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            List<Users> users = searchServiceImp.searchUsers(keyword);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(users);
            responseData.setDesc("Tìm kiếm users thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm users: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

