package com.example.food_delivery.mapper;


import com.example.food_delivery.domain.entity.Category;
import com.example.food_delivery.dto.response.CategoryDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mappings({
        @Mapping(source = "nameCate", target = "name"),
        @Mapping(target = "menus", source = "lisFood", ignore = true),
    })
    CategoryDTO toDTO(Category category);

    List<CategoryDTO> toDTOList(List<Category> categories);

    @Mappings({
        @Mapping(source = "name", target = "nameCate"),
        @Mapping(target = "lisFood", source = "menus", ignore = true),
    })
    Category toEntity(CategoryDTO categoryDTO);
}
