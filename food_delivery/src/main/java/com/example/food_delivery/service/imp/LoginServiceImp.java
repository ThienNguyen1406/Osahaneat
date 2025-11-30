package com.example.food_delivery.service.imp;

import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.response.UserDTO;


import java.util.List;

public interface LoginServiceImp {
    List<UserDTO> getAllUsers();
    Boolean checkLogin(String username, String password);
    Boolean addUser(SignupRequest signUpRequest);

}
