package com.example.food_delivery.mapper;


import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.dto.response.MenuDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FoodMapper {

    Food toEntity(MenuDTO menuDTO);

    MenuDTO toDTO(Food food);

    List<MenuDTO> toDTOList(List<Food> foods);
}
