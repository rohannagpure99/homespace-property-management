package com.example.backend.controller;
import com.example.backend.entity.Property;
import com.example.backend.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:5173")
public class PropertyController {

    private final PropertyService propertyService;
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public List<Property> getAllProperties(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        if (keyword != null || type != null || status != null
                || minPrice != null || maxPrice != null) {
            return propertyService.searchProperties(
                    keyword, type, status, minPrice, maxPrice);
        }

        return propertyService.getAllProperties();
    }

    @PostMapping
    public ResponseEntity<Property> addProperty(
            @Valid @RequestBody Property property) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyService.addProperty(property));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(
            @PathVariable Long id) {
        Property property = propertyService.getPropertyById(id);
        return property == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(property);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody Property property) {
        Property updated = propertyService.updateProperty(id, property);
        return updated == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(updated);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long id) {
        boolean deleted = propertyService.deleteProperty(id);
        return deleted
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}