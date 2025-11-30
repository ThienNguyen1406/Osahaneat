package com.example.food_delivery.service;

import com.example.food_delivery.service.imp.FileServiceImp;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
@Service
public class FileService implements FileServiceImp {
    @Value("${fileUpload.rootPath}")
    private String rootPath;
    private Path root;

    public void init(){
        try{
            root = Paths.get(rootPath);
            if(Files.notExists(root)){
                Files.createDirectories(root);
            }
        }catch (Exception e){
            System.out.println("Error creating folder root: " + e.getMessage());
        }
    }

    @Override
    public boolean saveFile(MultipartFile file) {
        try{
            init();
        Files.copy(file.getInputStream(), root.resolve(file.getOriginalFilename()), StandardCopyOption.REPLACE_EXISTING);
        return true;
        } catch (Exception e) {

            System.out.println("Error save file: " + e.getMessage());
            return false;
        }
    }

    @Override
    public Resource loadFile(String filename) {
        try {
            init();
            
            // If filename starts with "images/", try to load from project root/images
            if (filename.startsWith("images/")) {
                try {
                    // Get project root (parent of uploads folder)
                    Path projectRoot = root.getParent();
                    if (projectRoot == null) {
                        // If root is already at project level, use it
                        projectRoot = Paths.get(System.getProperty("user.dir"));
                    }
                    Path imagesFile = projectRoot.resolve(filename);
                    Resource resource = new UrlResource(imagesFile.toUri());
                    if(resource.exists() && resource.isReadable()){
                        return resource;
                    }
                } catch (Exception e) {
                    // Continue to next location
                }
            }
            
            // Try to load from root directory first
            Path file = root.resolve(filename);
            try {
                Resource resource = new UrlResource(file.toUri());
                if(resource.exists() && resource.isReadable()){
                    return resource;
                }
            } catch (Exception e) {
                // Continue to next location
            }
            
            // If not found, try to load from foods subdirectory
            Path foodsFile = root.resolve("foods").resolve(filename);
            try {
                Resource resource = new UrlResource(foodsFile.toUri());
                if(resource.exists() && resource.isReadable()){
                    return resource;
                }
            } catch (Exception e) {
                // Continue to next location
            }
            
            // If still not found, try restaurants subdirectory
            Path restaurantsFile = root.resolve("restaurants").resolve(filename);
            try {
                Resource resource = new UrlResource(restaurantsFile.toUri());
                if(resource.exists() && resource.isReadable()){
                    return resource;
                }
            } catch (Exception e) {
                // Continue
            }
            
            // If filename starts with "images/", also try from project root
            if (filename.startsWith("images/")) {
                try {
                    Path projectRoot = Paths.get(System.getProperty("user.dir"));
                    Path imagesFile = projectRoot.resolve(filename);
                    Resource resource = new UrlResource(imagesFile.toUri());
                    if(resource.exists() && resource.isReadable()){
                        return resource;
                    }
                } catch (Exception e) {
                    // Continue
                }
            }
            
            System.out.println("File not found: " + filename + " (tried root, foods/, restaurants/, and images/)");
        } catch (Exception e) {
            System.out.println("Error loading file " + filename + ": " + e.getMessage());
        }
        return null;
    }
}
