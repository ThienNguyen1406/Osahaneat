package com.example.food_delivery.service.imp;

import com.example.food_delivery.dto.response.RestaurantDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RestaurantServiceImp {
    boolean insertRestaurant(
             MultipartFile file,
             String  title,
             String subtitle ,
             String description ,
             boolean is_freeship ,
             String address ,
             String open_date
    );

    List<RestaurantDTO> getHomePageRestaurant();
    RestaurantDTO getDetailRestaurant(int id);
    
    // Admin methods
    List<RestaurantDTO> getAllRestaurants();
    RestaurantDTO getRestaurantById(int id);
    
    boolean updateRestaurant(int id, MultipartFile file, String title, String subtitle, String description, Boolean is_freeship, String address, String open_date);
    
    boolean deleteRestaurant(int id);

    boolean approveRestaurant(int id);

    boolean rejectRestaurant(int id);
}
