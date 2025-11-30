package com.example.food_delivery.mapper;

import com.example.food_delivery.domain.entity.Restaurant;
import com.example.food_delivery.dto.response.RestaurantDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface RestaurantMapper {

    @Mappings({
        @Mapping(source = "freeship", target = "freeShip"), 
        @Mapping(target = "categories", ignore = true),
        @Mapping(target = "rating", ignore = true)
    })
    RestaurantDTO restaurantToRestaurantDTO(Restaurant restaurant);
}
