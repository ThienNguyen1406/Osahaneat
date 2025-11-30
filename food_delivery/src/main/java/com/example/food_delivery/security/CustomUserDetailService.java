package com.example.food_delivery.security;

import com.example.food_delivery.domain.entity.Users;
import com.example.food_delivery.reponsitory.UserReponsitory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailService implements UserDetailsService {
    @Autowired
    private UserReponsitory userReponsitory;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var userOpt = userReponsitory.findFirstByUserName(username);
        if(userOpt.isEmpty()){
            throw new UsernameNotFoundException("Username not found");
        }
        Users users = userOpt.get();
        return new User(username,users.getPassword(),new ArrayList<>());
    }
}
