package com.example.food_delivery.service.imp;


import com.example.food_delivery.dto.request.PermissionRequest;
import com.example.food_delivery.dto.response.PermissionResponse;

import java.util.List;

public interface PermissionServiceImp {
    PermissionResponse create(PermissionRequest request);

    List<PermissionResponse> getAll();

    void delete(String permission);
}
