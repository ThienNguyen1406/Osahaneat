package com.example.food_delivery.mapper;


import com.example.food_delivery.domain.entity.Permission;
import com.example.food_delivery.dto.request.PermissionRequest;
import com.example.food_delivery.dto.response.PermissionResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
