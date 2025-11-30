package com.example.food_delivery.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

    @GetMapping({"/", "/index.html"})
    public String index() {
        return "forward:/theme/index.html";
    }

    @GetMapping({"/admin", "/admin/"})
    public String admin() {
        return "forward:/admin/login.html";
    }
}

