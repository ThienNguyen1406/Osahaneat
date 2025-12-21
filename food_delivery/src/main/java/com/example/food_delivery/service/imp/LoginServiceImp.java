package com.example.food_delivery.service.imp;

import com.example.food_delivery.domain.entity.EmailVerificationToken;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.response.UserDTO;

import java.util.List;
import java.util.Optional;

public interface LoginServiceImp {
    List<UserDTO> getAllUsers();
    Boolean checkLogin(String username, String password);
    Boolean addUser(SignupRequest signUpRequest);
    Optional<EmailVerificationToken> verifyEmailToken(String token);
    Users saveUser(Users user);
    EmailVerificationToken saveVerificationToken(EmailVerificationToken token);
}
