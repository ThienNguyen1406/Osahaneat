package com.example.food_delivery.service.imp;

import com.example.food_delivery.dto.response.CategoryDTO;

import java.util.List;

public interface CategoryServiceImp {
    List<CategoryDTO> getCategoryHomePage();
    
    CategoryDTO createCategory(String nameCate);
    
    CategoryDTO updateCategory(int id, String nameCate);
    
    boolean deleteCategory(int id);
    
    List<CategoryDTO> getAllCategories();
    
    List<CategoryDTO> searchCategories(String keyword);
}
