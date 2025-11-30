package com.example.food_delivery.controller.admin;

import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.reponsitory.UserReponsitory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/admin/statistics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatisticsController {

    @Autowired
    private UserReponsitory userReponsitory;

    /**
     * GET /admin/statistics/user-growth - Lấy số lượng người đăng ký theo tháng (12 tháng gần nhất)
     * Yêu cầu quyền ADMIN
     */
    @GetMapping("/user-growth")
    public ResponseEntity<?> getUserGrowthByMonth() {
        ResponseData responseData = new ResponseData();
        try {
            // Lấy tất cả users
            List<com.example.food_delivery.domain.entity.Users> allUsers = userReponsitory.findAll();
            
            // Khởi tạo map cho 12 tháng gần nhất
            Map<String, Integer> monthlyGrowth = new LinkedHashMap<>();
            Calendar cal = Calendar.getInstance();
            SimpleDateFormat displayFormat = new SimpleDateFormat("MM/yyyy");
            
            // Tạo 12 tháng gần nhất
            for (int i = 11; i >= 0; i--) {
                cal.setTime(new Date());
                cal.add(Calendar.MONTH, -i);
                String monthDisplay = displayFormat.format(cal.getTime());
                monthlyGrowth.put(monthDisplay, 0);
            }
            
            // Đếm số lượng user đăng ký theo tháng
            for (com.example.food_delivery.domain.entity.Users user : allUsers) {
                if (user.getCreateDate() != null) {
                    String monthDisplay = displayFormat.format(user.getCreateDate());
                    
                    if (monthlyGrowth.containsKey(monthDisplay)) {
                        monthlyGrowth.put(monthDisplay, monthlyGrowth.get(monthDisplay) + 1);
                    }
                }
            }
            
            // Chuyển đổi thành format phù hợp cho chart
            List<Map<String, Object>> chartData = new ArrayList<>();
            for (Map.Entry<String, Integer> entry : monthlyGrowth.entrySet()) {
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", entry.getKey());
                monthData.put("count", entry.getValue());
                chartData.add(monthData);
            }
            
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(chartData);
            responseData.setDesc("Lấy thống kê tăng trưởng người dùng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting user growth statistics: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi server khi lấy thống kê tăng trưởng người dùng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

