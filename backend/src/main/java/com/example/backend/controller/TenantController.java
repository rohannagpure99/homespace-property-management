package com.example.backend.controller;

import com.example.backend.entity.Tenant;
import com.example.backend.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TenantController {
    private final TenantService service;
    public TenantController(TenantService service) { this.service = service; }

    @GetMapping 
    public List<Tenant> getAll() 
    { return service.findAll(); }

    @GetMapping("/{id}") 
    public Tenant getById(@PathVariable Long id) 
    { return service.findById(id); }

    @PostMapping
    public Tenant create(@Valid @RequestBody Tenant tenant) {
    return service.create(tenant);
    }
    @PutMapping("/{id}") 
    public Tenant update(@PathVariable Long id, @RequestBody Tenant tenant) 
    { return service.update(id, tenant); }

    @DeleteMapping("/{id}") 
    public void delete(@PathVariable Long id)
     { service.delete(id); }
}
