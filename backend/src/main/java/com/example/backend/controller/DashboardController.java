package com.example.backend.controller;

import com.example.backend.service.PropertyService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final PropertyService propertyService;
    public DashboardController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping("/statistics")
    public Map<String, Object> getStatistics() {
        return propertyService.getDashboardStatistics();
    }
}