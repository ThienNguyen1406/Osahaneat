package com.example.food_delivery.mapper;


import com.example.food_delivery.domain.entity.Roles;
import com.example.food_delivery.dto.request.RoleRequest;
import com.example.food_delivery.dto.response.RoleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {PermissionMapper.class})
public interface RoleMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "permissions", ignore = true)
    @Mapping(source = "name", target = "roleName")
    Roles toRole(RoleRequest request);

    @Mapping(source = "roleName", target = "name")
    RoleResponse toRoleResponse(Roles role);
}
