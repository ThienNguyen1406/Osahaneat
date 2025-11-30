package com.example.food_delivery.controller.user;

import com.example.food_delivery.dto.response.ResponseData;
import com.example.food_delivery.service.FileService;
import com.example.food_delivery.service.imp.RestaurantServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController("userRestaurantController")
@RequestMapping("/restaurant")
public class UserRestaurantController {
    @Autowired
    FileService fileService;
    @Autowired
    RestaurantServiceImp restaurantServiceImp;

    @GetMapping()
    public ResponseEntity<?> getHomeRestaurant() {
        ResponseData responseData = new ResponseData();
        try {
            var restaurants = restaurantServiceImp.getHomePageRestaurant();
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(restaurants);
            responseData.setDesc("Lấy danh sách nhà hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting restaurants: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy danh sách nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/file/{filename:.+}")
    public ResponseEntity<?> getFileRestaurant(@PathVariable String filename) {
        Resource resource = fileService.loadFile(filename);
        if (resource == null || !resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/detail")
    public ResponseEntity<?> getRestaurantDetail(@RequestParam int id) {
        ResponseData responseData = new ResponseData();
        try {
            var restaurant = restaurantServiceImp.getDetailRestaurant(id);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(restaurant);
            responseData.setDesc("Lấy thông tin nhà hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting restaurant detail: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy thông tin nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRestaurantById(@PathVariable int id) {
        ResponseData responseData = new ResponseData();
        try {
            var restaurant = restaurantServiceImp.getDetailRestaurant(id);
            responseData.setStatus(200);
            responseData.setSuccess(true);
            responseData.setData(restaurant);
            responseData.setDesc("Lấy thông tin nhà hàng thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error getting restaurant by id: " + e.getMessage());
            e.printStackTrace();
            responseData.setStatus(500);
            responseData.setSuccess(false);
            responseData.setData(null);
            responseData.setDesc("Lỗi khi lấy thông tin nhà hàng: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

