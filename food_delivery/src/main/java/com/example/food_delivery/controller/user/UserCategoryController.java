package com.example.food_delivery.controller.user;

import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.CategoryServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController("userCategoryController")
@RequestMapping("/category")
public class UserCategoryController {

    @Autowired
    CategoryServiceImp categoryServiceImp;

    /**
     * GET /category - Lấy danh sách categories cho trang chủ
     * Public endpoint - không cần authentication
     */
    @GetMapping()
    public ResponseEntity<?> getCategories() {
        ResponseData responseData = new ResponseData();
        try {
            var categories = categoryServiceImp.getCategoryHomePage();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(categories);
            responseData.setDesc("Lấy danh sách categories thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy danh sách categories: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /category/{id} - Lấy category theo ID
     * Public endpoint - không cần authentication
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            // Note: Cần thêm method getCategoryById vào CategoryService
            responseData.setStatus(501);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Chức năng lấy category theo ID chưa được triển khai");
            return new ResponseEntity<>(responseData, HttpStatus.NOT_IMPLEMENTED);
        } catch (Exception e) {
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy category: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

