package com.example.food_delivery.service;

import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.reponsitory.UserReponsitory;
import com.example.food_delivery.service.imp.LoginServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LoginService implements LoginServiceImp {
    @Autowired
    UserReponsitory userReponsitory;
    @Autowired
    PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        List<Users> listUser = userReponsitory.findAll();
        List<UserDTO> userDTOList = new ArrayList<>();

        for (Users user : listUser) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setUserName(user.getUserName());
            userDTO.setPassword(user.getPassword());
            userDTO.setFullName(user.getFullName());
            userDTO.setCreateDate(user.getCreateDate());

            userDTOList.add(userDTO);

        }
        return userDTOList;
    }

    @Override
    public Boolean checkLogin(String username, String password) {
       var userOpt = userReponsitory.findFirstByUserName(username);
       if (userOpt.isEmpty()) {
           return false;
       }
       Users users = userOpt.get();
        return passwordEncoder.matches(password,users.getPassword());
    }

    @Override
    public Boolean addUser(SignupRequest signUpRequest) {
        try {
            // Check if user already exists
            var existingUserOpt = userReponsitory.findFirstByUserName(signUpRequest.getUserName());
            if (existingUserOpt.isPresent()) {
                System.err.println("User already exists: " + signUpRequest.getUserName());
                return false;
            }
            
            Users users = new Users();
            users.setFullName(signUpRequest.getFullname());
            // Encode password before saving
            users.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
            users.setUserName(signUpRequest.getUserName());

            // Save user - will throw exception if fails
            userReponsitory.save(users);
            System.out.println("User created successfully: " + signUpRequest.getUserName());
            return true;
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }




}
