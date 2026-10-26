package com.example.backend.controller;

import com.example.backend.entity.PropertyUnit;
import com.example.backend.service.PropertyUnitService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties/{propertyId}/units")
public class PropertyUnitController {

    private final PropertyUnitService unitService;

    public PropertyUnitController(PropertyUnitService unitService) {
        this.unitService = unitService;
    }

    // Get all flats belonging to an apartment
    @GetMapping
    public ResponseEntity<List<PropertyUnit>> getUnits(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(
                unitService.getUnitsByProperty(propertyId));
    }
    
    // Get available flats for sale or rent
    @GetMapping("/available")
    public ResponseEntity<List<PropertyUnit>> getAvailableUnits(
            @PathVariable Long propertyId,
            @RequestParam String purpose) {

        if (!"SALE".equalsIgnoreCase(purpose)
                && !"RENT".equalsIgnoreCase(purpose)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                unitService.getAvailableUnitsByPurpose(
                        propertyId, purpose));
    }


    // Add a flat to an apartment
    @PostMapping
    public ResponseEntity<PropertyUnit> addUnit(
            @PathVariable Long propertyId,
            @Valid @RequestBody PropertyUnit unit) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(unitService.addUnit(propertyId, unit));
    }

    // Update a flat
    @PutMapping("/{unitId}")
    public ResponseEntity<PropertyUnit> updateUnit(
            @PathVariable Long propertyId,
            @PathVariable Long unitId,
            @Valid @RequestBody PropertyUnit unit) {

        PropertyUnit updated =
                unitService.updateUnit(unitId, unit);

        if (!updated.getProperty().getId().equals(propertyId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    // Delete a flat
    @DeleteMapping("/{unitId}")
    public ResponseEntity<Map<String, String>> deleteUnit(
            @PathVariable Long propertyId,
            @PathVariable Long unitId) {

        List<PropertyUnit> units =
                unitService.getUnitsByProperty(propertyId);

        boolean belongsToProperty = units.stream()
                .anyMatch(unit -> unit.getId().equals(unitId));

        if (!belongsToProperty) {
            return ResponseEntity.notFound().build();
        }

        unitService.deleteUnit(unitId);

        return ResponseEntity.ok(
                Map.of("message", "Flat deleted successfully"));

        
    }
}
