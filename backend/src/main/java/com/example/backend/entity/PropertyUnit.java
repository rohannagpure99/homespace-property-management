
package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(
    name = "property_units",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_property_unit_number",
            columnNames = {"property_id", "unit_number"}
        )
    }
)
public class PropertyUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @NotBlank(message = "Flat number is required")
    @Size(max = 30)
    @Column(name = "unit_number", nullable = false, length = 30)
    private String unitNumber;

    // SALE or RENT
    @NotBlank(message = "Purpose is required")
    @Column(nullable = false, length = 20)
    private String purpose;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    @Column(nullable = false)
    private Double price;

    // AVAILABLE, SOLD, or RENTED
    @NotBlank(message = "Status is required")
    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE";

    public PropertyUnit() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public String getUnitNumber() {
        return unitNumber;
    }

    public void setUnitNumber(String unitNumber) {
        this.unitNumber = unitNumber;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
