package com.example.backend.controller;
import com.example.backend.entity.Owner;
import com.example.backend.service.OwnerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/owners")
@CrossOrigin(origins = "http://localhost:5173")
public class OwnerController {
    private final OwnerService ownerService;

    public OwnerController(OwnerService ownerService) {
        this.ownerService = ownerService;
    }

    @GetMapping
    public List<Owner> getAllOwners() {
        return ownerService.getAllOwners();
    }

    @PostMapping
    public ResponseEntity<Owner> addOwner(
            @Valid @RequestBody Owner owner) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ownerService.addOwner(owner));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Owner> getOwnerById(
            @PathVariable Long id) {
        Owner owner = ownerService.getOwnerById(id);
        return owner == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(owner);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Owner> updateOwner(
            @PathVariable Long id,
            @Valid @RequestBody Owner owner) {
        Owner updated = ownerService.updateOwner(id, owner);
        return updated == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOwner(
            @PathVariable Long id) {
        boolean deleted = ownerService.deleteOwner(id);
        return deleted
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}