package com.example.food_delivery.service.imp;


import com.example.food_delivery.dto.request.RoleRequest;
import com.example.food_delivery.dto.response.RoleResponse;

import java.util.List;

public interface RoleServiceImp {
    RoleResponse create(RoleRequest request);

    List<RoleResponse> getAll();

    void delete(String role);
}
