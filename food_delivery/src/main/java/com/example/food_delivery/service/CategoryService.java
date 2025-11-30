package com.example.food_delivery.service;

import com.example.food_delivery.dto.response.CategoryDTO;
import com.example.food_delivery.dto.response.MenuDTO;
import com.example.food_delivery.domain.entity.Category;
import com.example.food_delivery.domain.entity.Food;
import com.example.food_delivery.reponsitory.CategoryRepository;
import com.example.food_delivery.service.imp.CategoryServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService implements CategoryServiceImp {
    @Autowired
    CategoryRepository categoryRepository;

    @Override
    public List<CategoryDTO> getCategoryHomePage() {
        PageRequest pageRequest = PageRequest.of(0, 3, Sort.by("id"));
        List<Category> listCategory = categoryRepository.findAll(pageRequest).getContent();
        List<CategoryDTO> listCategoryDTO = new ArrayList<>();

        for (Category data : listCategory) {
            CategoryDTO categoryDTO = new CategoryDTO();
            categoryDTO.setId(data.getId());
            categoryDTO.setName(data.getNameCate());

            List<MenuDTO> menuDTOS = new ArrayList<>();
            if (data.getLisFood() != null) {
                for(Food dataFood : data.getLisFood()){
                    MenuDTO menuDTO = new MenuDTO();
                    menuDTO.setId(dataFood.getId());
                    menuDTO.setTitle(dataFood.getTitle());
                    menuDTO.setDescription(dataFood.getDesc());
                    menuDTO.setPrice(dataFood.getPrice());
                    menuDTO.setTimeShip(dataFood.getTime_ship());
                    menuDTO.setFreeShip(dataFood.isFreeShip());
                    menuDTO.setShippingFee(dataFood.getShippingFee());
                    
                    // Convert image filename to full URL
                    if (dataFood.getImage() != null && !dataFood.getImage().isEmpty()) {
                        // If image path starts with "images/", serve directly from /images/
                        if (dataFood.getImage().startsWith("images/")) {
                            menuDTO.setImage("/" + dataFood.getImage());
                        } else {
                            menuDTO.setImage("/menu/file/" + dataFood.getImage());
                        }
                    } else {
                        menuDTO.setImage(dataFood.getImage());
                    }

                    menuDTOS.add(menuDTO);
                }
            }
            categoryDTO.setMenus(menuDTOS);
            listCategoryDTO.add(categoryDTO);
        }

        return listCategoryDTO;
    }

    @Override
    public CategoryDTO createCategory(String nameCate) {
        try {
            // Check if category with same name already exists
            List<Category> existingCategories = categoryRepository.findAll();
            for (Category cat : existingCategories) {
                if (cat.getNameCate().equalsIgnoreCase(nameCate.trim())) {
                    throw new IllegalArgumentException("Category với tên này đã tồn tại!");
                }
            }
            
            Category category = new Category();
            category.setNameCate(nameCate.trim());
            category.setCreateDate(new Date());
            
            Category savedCategory = categoryRepository.save(category);
            
            CategoryDTO categoryDTO = new CategoryDTO();
            categoryDTO.setId(savedCategory.getId());
            categoryDTO.setName(savedCategory.getNameCate());
            categoryDTO.setMenus(new ArrayList<>());
            
            return categoryDTO;
        } catch (Exception e) {
            System.err.println("Error creating category: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public CategoryDTO updateCategory(int id, String nameCate) {
        try {
            Optional<Category> categoryOptional = categoryRepository.findById(id);
            if (categoryOptional.isEmpty()) {
                throw new IllegalArgumentException("Category không tồn tại!");
            }
            
            Category category = categoryOptional.get();
            
            // Check if another category with same name already exists
            List<Category> existingCategories = categoryRepository.findAll();
            for (Category cat : existingCategories) {
                if (cat.getId() != id && cat.getNameCate().equalsIgnoreCase(nameCate.trim())) {
                    throw new IllegalArgumentException("Category với tên này đã tồn tại!");
                }
            }
            
            category.setNameCate(nameCate.trim());
            Category updatedCategory = categoryRepository.save(category);
            
            CategoryDTO categoryDTO = new CategoryDTO();
            categoryDTO.setId(updatedCategory.getId());
            categoryDTO.setName(updatedCategory.getNameCate());
            categoryDTO.setMenus(new ArrayList<>());
            
            return categoryDTO;
        } catch (Exception e) {
            System.err.println("Error updating category: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public boolean deleteCategory(int id) {
        try {
            Optional<Category> categoryOptional = categoryRepository.findById(id);
            if (categoryOptional.isEmpty()) {
                throw new IllegalArgumentException("Category không tồn tại!");
            }
            
            Category category = categoryOptional.get();
            
            // Check if category has associated foods
            if (category.getLisFood() != null && !category.getLisFood().isEmpty()) {
                throw new IllegalArgumentException("Không thể xóa category vì đang có món ăn thuộc category này!");
            }
            
            categoryRepository.delete(category);
            return true;
        } catch (Exception e) {
            System.err.println("Error deleting category: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public List<CategoryDTO> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            List<CategoryDTO> categoryDTOs = new ArrayList<>();
            
            for (Category category : categories) {
                CategoryDTO categoryDTO = new CategoryDTO();
                categoryDTO.setId(category.getId());
                categoryDTO.setName(category.getNameCate());
                categoryDTO.setMenus(new ArrayList<>()); // Không cần load menus cho list
                categoryDTOs.add(categoryDTO);
            }
            
            return categoryDTOs;
        } catch (Exception e) {
            System.err.println("Error getting all categories: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<CategoryDTO> searchCategories(String keyword) {
        try {
            List<Category> categories = categoryRepository.searchByName(keyword);
            List<CategoryDTO> categoryDTOs = new ArrayList<>();
            
            for (Category category : categories) {
                CategoryDTO categoryDTO = new CategoryDTO();
                categoryDTO.setId(category.getId());
                categoryDTO.setName(category.getNameCate());
                categoryDTO.setMenus(new ArrayList<>());
                categoryDTOs.add(categoryDTO);
            }
            
            return categoryDTOs;
        } catch (Exception e) {
            System.err.println("Error searching categories: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
