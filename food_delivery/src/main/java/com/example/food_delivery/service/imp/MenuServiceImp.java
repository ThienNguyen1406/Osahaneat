package com.example.food_delivery.service.imp;

import com.example.food_delivery.domain.entity.Food;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MenuServiceImp {
    boolean createMenu( MultipartFile file, String  title, String time_ship , String is_freeShip, Double price ,int cate_id, Double shippingFee);
    
    List<Food> getAllMenus();
    
    Food getMenuById(int id);
    
    boolean updateMenu(int id, MultipartFile file, String title, String time_ship, String is_freeship, Double price, Integer cate_id, Double shippingFee);
    
    boolean deleteMenu(int id);
}
