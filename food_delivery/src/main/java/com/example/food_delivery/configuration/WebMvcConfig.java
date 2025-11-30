package com.example.food_delivery.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        try {
            // Get current working directory
            String currentDir = System.getProperty("user.dir");
            
            // Check if we're in food_delivery directory
            String projectRoot;
            if (currentDir.endsWith("food_delivery")) {
                // We're in food_delivery, go up one level
                projectRoot = new File(currentDir).getParent();
            } else {
                // We're at project root
                projectRoot = currentDir;
            }
            
            // Serve theme-sidebar frontend files
            File themeSidebarDir = new File(projectRoot, "theme-sidebar");
            String themeSidebarPath = themeSidebarDir.getAbsolutePath().replace("\\", "/") + "/";
            
            if (themeSidebarDir.exists()) {
                // Serve theme-sidebar from /theme/** path
                registry.addResourceHandler("/theme/**")
                        .addResourceLocations("file:" + themeSidebarPath)
                        .setCachePeriod(3600)
                        .resourceChain(true);
                
                // Serve theme-sidebar from /theme-sidebar/** path (for login.html)
                registry.addResourceHandler("/theme-sidebar/**")
                        .addResourceLocations("file:" + themeSidebarPath)
                        .setCachePeriod(3600)
                        .resourceChain(true);
                
                System.out.println("✅ Theme-sidebar configured: " + themeSidebarPath);
            } else {
                System.err.println("❌ Theme-sidebar directory not found: " + themeSidebarPath);
            }

            // Serve admin frontend files (admin panel)
            File adminDir = new File(projectRoot, "admin");
            String adminPath = adminDir.getAbsolutePath().replace("\\", "/") + "/";
            
            if (adminDir.exists()) {
                // Serve admin from /admin/** path
                registry.addResourceHandler("/admin/**")
                        .addResourceLocations("file:" + adminPath)
                        .setCachePeriod(0) // Disable cache to prevent old NiceAdmin references
                        .resourceChain(true);
                System.out.println("✅ Admin configured: " + adminPath);
            } else {
                System.err.println("❌ Admin directory not found: " + adminPath);
            }
            
            // Serve shipper app files
            File shipperDir = new File(projectRoot, "shipper");
            String shipperPath = shipperDir.getAbsolutePath().replace("\\", "/") + "/";
            
            if (shipperDir.exists()) {
                registry.addResourceHandler("/shipper/**")
                        .addResourceLocations("file:" + shipperPath)
                        .setCachePeriod(3600)
                        .resourceChain(true);
                System.out.println("✅ Shipper app configured: " + shipperPath);
            } else {
                System.err.println("⚠️ Shipper directory not found: " + shipperPath);
            }
            
            // Serve restaurant-staff app files
            File staffDir = new File(projectRoot, "restaurant-staff");
            String staffPath = staffDir.getAbsolutePath().replace("\\", "/") + "/";
            
            if (staffDir.exists()) {
                registry.addResourceHandler("/restaurant-staff/**")
                        .addResourceLocations("file:" + staffPath)
                        .setCachePeriod(3600)
                        .resourceChain(true);
                System.out.println("✅ Restaurant Staff app configured: " + staffPath);
            } else {
                System.err.println("⚠️ Restaurant Staff directory not found: " + staffPath);
            }
            
            // Serve restaurant-owner app files
            File ownerDir = new File(projectRoot, "restaurant-owner");
            String ownerPath = ownerDir.getAbsolutePath().replace("\\", "/") + "/";
            
            if (ownerDir.exists()) {
                registry.addResourceHandler("/restaurant-owner/**")
                        .addResourceLocations("file:" + ownerPath)
                        .setCachePeriod(3600)
                        .resourceChain(true);
                System.out.println("✅ Restaurant Owner app configured: " + ownerPath);
            } else {
                System.err.println("⚠️ Restaurant Owner directory not found: " + ownerPath);
            }
            
            // NiceAdmin removed - not used in this project

                   // Serve root files (login.html, etc.)
                   registry.addResourceHandler("/login.html")
                           .addResourceLocations("file:" + projectRoot.replace("\\", "/") + "/")
                           .setCachePeriod(0)
                           .resourceChain(true);
                   
                   // Serve js files from root
                   registry.addResourceHandler("/js/**")
                           .addResourceLocations("file:" + projectRoot.replace("\\", "/") + "/js/")
                           .setCachePeriod(0)
                           .resourceChain(true);
                   
                   // Serve theme-sidebar as root (only if exists)
                   if (themeSidebarDir.exists()) {
                       registry.addResourceHandler("/")
                               .addResourceLocations("file:" + themeSidebarPath)
                               .setCachePeriod(3600)
                               .resourceChain(true);
                   }
            
            // Serve uploaded files from uploads folder
            File uploadsDir = new File(projectRoot, "uploads");
            String uploadsPath = uploadsDir.getAbsolutePath().replace("\\", "/") + "/";
            
            // Create uploads directory if it doesn't exist
            if (!uploadsDir.exists()) {
                boolean created = uploadsDir.mkdirs();
                if (created) {
                    System.out.println("✅ Created uploads directory: " + uploadsPath);
                } else {
                    System.err.println("⚠️ Failed to create uploads directory: " + uploadsPath);
                }
            }
            
            if (uploadsDir.exists()) {
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:" + uploadsPath)
                        .setCachePeriod(3600)
                        .resourceChain(true);
                System.out.println("✅ Uploads folder configured: " + uploadsPath);
            } else {
                System.err.println("⚠️ Uploads directory not found: " + uploadsPath);
            }
            
            // Serve images from images folder
            File imagesDir = new File(projectRoot, "images");
            String imagesPath = imagesDir.getAbsolutePath().replace("\\", "/") + "/";
            
            if (imagesDir.exists()) {
                registry.addResourceHandler("/images/**")
                        .addResourceLocations("file:" + imagesPath)
                        .setCachePeriod(3600)
                        .resourceChain(true);
                System.out.println("✅ Images folder configured: " + imagesPath);
            } else {
                System.err.println("⚠️ Images directory not found: " + imagesPath);
            }
            
            System.out.println("📁 Project root: " + projectRoot);
        } catch (Exception e) {
            System.err.println("❌ Error configuring static resources: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void configureContentNegotiation(@NonNull ContentNegotiationConfigurer configurer) {
        configurer.defaultContentType(MediaType.APPLICATION_JSON);
    }
}

