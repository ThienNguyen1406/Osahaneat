package com.example.food_delivery.controller.admin;

import com.example.food_delivery.dto.response.CategoryDTO;
import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.imp.CategoryServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController("adminCategoryController")
@RequestMapping("/admin/category")
public class AdminCategoryController {
    @Autowired
    CategoryServiceImp categoryServiceImp;

    /**
     * GET /admin/category - Lấy tất cả categories
     * Yêu cầu quyền ADMIN
     */
    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCategories() {
        ResponseData responseData = new ResponseData();
        try {
            List<CategoryDTO> categories = categoryServiceImp.getAllCategories();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(categories);
            responseData.setDesc("Lấy danh sách categories thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting all categories: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy danh sách categories: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET /admin/category/search?keyword=... - Tìm kiếm categories
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchCategories(@RequestParam String keyword) {
        ResponseData responseData = new ResponseData();
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                // Nếu keyword rỗng, trả về tất cả categories
                List<CategoryDTO> categories = categoryServiceImp.getAllCategories();
                responseData.setStatus(200);
                responseData.setSuccess(true);
                responseData.setData(categories);
                responseData.setDesc("Lấy danh sách categories thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            }
            
            List<CategoryDTO> categories = categoryServiceImp.searchCategories(keyword);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(categories);
            responseData.setDesc("Tìm kiếm categories thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error searching categories: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tìm kiếm categories: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /admin/category - Tạo category mới
     * Yêu cầu quyền ADMIN
     */
    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@RequestParam String nameCate) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (nameCate == null || nameCate.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tên category không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            CategoryDTO categoryDTO = categoryServiceImp.createCategory(nameCate);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(categoryDTO);
            responseData.setDesc("Tạo category thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating category: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi tạo category: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /admin/category/{id} - Cập nhật category
     * Yêu cầu quyền ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable int id, @RequestParam String nameCate) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Category ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            if (nameCate == null || nameCate.trim().isEmpty()) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(null);
                responseData.setDesc("Tên category không được để trống!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            CategoryDTO categoryDTO = categoryServiceImp.updateCategory(id, nameCate);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(categoryDTO);
            responseData.setDesc("Cập nhật category thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error updating category: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi cập nhật category: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE /admin/category/{id} - Xóa category
     * Yêu cầu quyền ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            // Validate input
            if (id <= 0) {
                responseData.setStatus(400);
                responseData.setSuccess(false);
                responseData.setData(false);
                responseData.setDesc("Category ID không hợp lệ!");
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }
            
            boolean deleted = categoryServiceImp.deleteCategory(id);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(deleted);
            responseData.setDesc("Xóa category thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            responseData.setStatus(400);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error deleting category: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(false);
            responseData.setDesc("Lỗi server khi xóa category: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

