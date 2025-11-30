package com.example.food_delivery.service.imp;

import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.request.UserUpdateRequest;
import com.example.food_delivery.dto.response.UserDTO;

import java.util.List;

public interface UserServiceImp {
    List<UserDTO> getAllUser();

    UserDTO addUser(SignupRequest signupRequest);

    UserDTO getUser(int id);

    UserDTO getMyInfo();

    UserDTO updateUser(int userId, UserUpdateRequest request);
}
