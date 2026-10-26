
package com.example.backend.service;

import com.example.backend.entity.Property;
import com.example.backend.entity.PropertyUnit;
import com.example.backend.repository.PropertyRepository;
import com.example.backend.repository.PropertyUnitRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PropertyUnitService {

    private final PropertyUnitRepository unitRepository;
    private final PropertyRepository propertyRepository;

    public PropertyUnitService(
            PropertyUnitRepository unitRepository,
            PropertyRepository propertyRepository) {
        this.unitRepository = unitRepository;
        this.propertyRepository = propertyRepository;
    }

    // Get all flats for one property
    public List<PropertyUnit> getUnitsByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new IllegalArgumentException("Property not found");
        }

        return unitRepository.findByProperty_Id(propertyId);
    }

    
    // Get only available flats for sale or rent
    public List<PropertyUnit> getAvailableUnitsByPurpose(
            Long propertyId, String purpose) {

        if (!propertyRepository.existsById(propertyId)) {
            throw new IllegalArgumentException("Property not found");
        }

        return unitRepository.findByProperty_Id(propertyId)
                .stream()
                .filter(unit ->
                        "AVAILABLE".equalsIgnoreCase(unit.getStatus()))
                .filter(unit ->
                        purpose.equalsIgnoreCase(unit.getPurpose()))
                .toList();
    }


    // Synchronize the apartment's total units with its flat records
    private void updateTotalUnits(Property property) {
        long count = unitRepository.countByProperty_Id(property.getId());

        property.setTotalUnits((int) count);
        propertyRepository.save(property);
    }

    // Add a flat to an existing apartment
    @Transactional
    public PropertyUnit addUnit(Long propertyId, PropertyUnit unit) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Property not found"));

        if (property.getPropertyType() == null
                || !property.getPropertyType().toLowerCase()
                        .contains("apartment")) {
            throw new IllegalArgumentException(
                    "Individual units can only be added to apartments");
        }

        unit.setId(null);
        unit.setProperty(property);

        PropertyUnit savedUnit = unitRepository.save(unit);

        updateTotalUnits(property);

        return savedUnit;
    }

    // Update an existing flat
    @Transactional
    public PropertyUnit updateUnit(Long unitId, PropertyUnit updated) {
        PropertyUnit existing = unitRepository.findById(unitId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Flat not found"));

        existing.setUnitNumber(updated.getUnitNumber());
        existing.setPurpose(updated.getPurpose());
        existing.setPrice(updated.getPrice());
        existing.setStatus(updated.getStatus());

        PropertyUnit savedUnit = unitRepository.save(existing);

        updateTotalUnits(existing.getProperty());

        return savedUnit;
    }

    // Delete a flat
    @Transactional
    public void deleteUnit(Long unitId) {
        PropertyUnit existing = unitRepository.findById(unitId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Flat not found"));

        Property property = existing.getProperty();

        unitRepository.delete(existing);
        unitRepository.flush();

        updateTotalUnits(property);
    }
}
