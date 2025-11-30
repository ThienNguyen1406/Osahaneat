package com.example.food_delivery.mapper;



import com.example.food_delivery.dto.request.SignupRequest;
import com.example.food_delivery.dto.request.UserUpdateRequest;
import com.example.food_delivery.dto.response.UserDTO;
import com.example.food_delivery.domain.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "roles", ignore = true)
    Users toEntity(SignupRequest request);

    UserDTO toUserResponse(Users user);

    List<UserDTO> toUserResponseList(List<Users> users);

    @Mapping(target = "roles", ignore = true)
    void updateUserFromRequest(@MappingTarget Users user, UserUpdateRequest request);
}
