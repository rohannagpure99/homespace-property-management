
package com.example.backend.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Property name is required")
    @Size(max = 100, message = "Property name cannot exceed 100 characters")
    private String propertyName;

    @NotBlank(message = "Property type is required")
    private String propertyType;

    @NotBlank(message = "Address is required")
    private String address;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    public String getImageUrl() {
    return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
    }

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private Double price;

    @NotBlank(message = "Status is required")
    private String status;


    public Property() {
    }

    public Property(Long id, String propertyName, String propertyType,
                    String address, Double price, String status) {
        this.id = id;
        this.propertyName = propertyName;
        this.propertyType = propertyType;
        this.address = address;
        this.price = price;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPropertyName() {
        return propertyName;
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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
