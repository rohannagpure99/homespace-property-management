package com.example.backend.repository;

import com.example.backend.entity.PropertyUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyUnitRepository
        extends JpaRepository<PropertyUnit, Long> {

    List<PropertyUnit> findByProperty_Id(Long propertyId);

    long countByProperty_Id(Long propertyId);
}
