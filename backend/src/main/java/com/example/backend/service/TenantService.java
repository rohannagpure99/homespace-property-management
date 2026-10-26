package com.example.backend.service;

import com.example.backend.entity.Tenant;
import com.example.backend.repository.TenantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TenantService {
    private final TenantRepository repository;

    public TenantService(TenantRepository repository) { this.repository = repository; }

    public List<Tenant> findAll() { return repository.findAll(); }

    public Tenant findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));
    }

    public Tenant create(Tenant tenant) {
        validate(tenant, null);
        if (tenant.getStatus() == null || tenant.getStatus().isBlank()) tenant.setStatus("PENDING");
        tenant.setId(null);
        return repository.save(tenant);
    }

    public Tenant update(Long id, Tenant incoming) {
        Tenant current = findById(id);
        validate(incoming, id);
        current.setFullName(incoming.getFullName());
        current.setPhone(incoming.getPhone());
        current.setEmail(incoming.getEmail());
        current.setPropertyId(incoming.getPropertyId());
        current.setUnitId(incoming.getUnitId());
        current.setPropertyName(incoming.getPropertyName());
        current.setUnitNumber(incoming.getUnitNumber());
        current.setMonthlyRent(incoming.getMonthlyRent());
        current.setSecurityDeposit(incoming.getSecurityDeposit());
        current.setLeaseStart(incoming.getLeaseStart());
        current.setLeaseEnd(incoming.getLeaseEnd());
        current.setStatus(incoming.getStatus() == null || incoming.getStatus().isBlank() ? "PENDING" : incoming.getStatus());
        current.setPermanentAddress(incoming.getPermanentAddress());
        current.setNotes(incoming.getNotes());
        return repository.save(current);
    }

    public void delete(Long id) { repository.delete(findById(id)); }

    private void validate(Tenant tenant, Long editingId) {
        if (tenant.getFullName() == null || tenant.getFullName().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tenant name is required");
        if (tenant.getPhone() == null || tenant.getPhone().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required");
        if (tenant.getMonthlyRent() == null || tenant.getMonthlyRent().signum() < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Monthly rent must be zero or more");
        if (tenant.getLeaseStart() == null || tenant.getLeaseEnd() == null || !tenant.getLeaseEnd().isAfter(tenant.getLeaseStart())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lease end date must be after lease start date");
        if (tenant.getUnitId() != null && "ACTIVE".equalsIgnoreCase(tenant.getStatus())) {
            boolean occupied = repository.findAll().stream().anyMatch(existing ->
                tenant.getUnitId().equals(existing.getUnitId()) && "ACTIVE".equalsIgnoreCase(existing.getStatus()) &&
                (editingId == null || !editingId.equals(existing.getId())) &&
                !tenant.getLeaseEnd().isBefore(existing.getLeaseStart()) && !tenant.getLeaseStart().isAfter(existing.getLeaseEnd()));
            if (occupied) throw new ResponseStatusException(HttpStatus.CONFLICT, "This unit already has an overlapping active tenancy");
        }
    }
}
