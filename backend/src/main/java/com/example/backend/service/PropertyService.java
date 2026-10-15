
package com.example.backend.service;
import com.example.backend.entity.Property;
import com.example.backend.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public Property addProperty(Property property) {
        property.setId(null);
        return propertyRepository.save(property);
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id).orElse(null);
    }

    public Property updateProperty(Long id, Property updated) {
        Property existing = getPropertyById(id);

        if (existing == null) {
            return null;
        }

        existing.setPropertyName(updated.getPropertyName());
        existing.setPropertyType(updated.getPropertyType());
        existing.setAddress(updated.getAddress());
        existing.setPrice(updated.getPrice());
        existing.setStatus(updated.getStatus());

        return propertyRepository.save(existing);
    }

    public boolean deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            return false;
        }

        propertyRepository.deleteById(id);
        return true;
    }

    public List<Property> searchProperties(
            String keyword,
            String type,
            String status,
            Double minPrice,
            Double maxPrice) {

        return propertyRepository.findAll().stream()
                .filter(p -> keyword == null || keyword.isBlank()
                        || contains(p.getPropertyName(), keyword)
                        || contains(p.getAddress(), keyword))
                .filter(p -> type == null || type.isBlank()
                        || (p.getPropertyType() != null
                        && p.getPropertyType().equalsIgnoreCase(type)))
                .filter(p -> status == null || status.isBlank()
                        || (p.getStatus() != null
                        && p.getStatus().equalsIgnoreCase(status)))
                .filter(p -> minPrice == null
                        || (p.getPrice() != null && p.getPrice() >= minPrice))
                .filter(p -> maxPrice == null
                        || (p.getPrice() != null && p.getPrice() <= maxPrice))
                .toList();
    }

    private boolean contains(String value, String keyword) {
        return value != null
                && value.toLowerCase(Locale.ROOT)
                .contains(keyword.toLowerCase(Locale.ROOT));
    }

    public Map<String, Object> getDashboardStatistics() {
        List<Property> properties = propertyRepository.findAll();
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = properties.size();
        long available = properties.stream()
                .filter(p -> "Available".equalsIgnoreCase(p.getStatus()))
                .count();
        long rented = properties.stream()
                .filter(p -> "Rented".equalsIgnoreCase(p.getStatus()))
                .count();
        double totalValue = properties.stream()
                .filter(p -> p.getPrice() != null)
                .mapToDouble(Property::getPrice)
                .sum();
        stats.put("totalProperties", total);
        stats.put("availableProperties", available);
        stats.put("rentedProperties", rented);
        stats.put("totalListedValue", totalValue);
        return stats;
    }
}
