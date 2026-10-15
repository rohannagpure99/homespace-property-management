package com.example.backend.service;
import com.example.backend.entity.Owner;
import com.example.backend.repository.OwnerRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class OwnerService {

    private final OwnerRepository ownerRepository;
    public OwnerService(OwnerRepository ownerRepository) {
        this.ownerRepository = ownerRepository;
    }

    public List<Owner> getAllOwners() {
        return ownerRepository.findAll();
    }

    public Owner addOwner(Owner owner) {
        owner.setId(null);
        return ownerRepository.save(owner);
    }

    public Owner getOwnerById(Long id) {
        return ownerRepository.findById(id).orElse(null);
    }

    public Owner updateOwner(Long id, Owner updatedOwner) {
        Optional<Owner> result = ownerRepository.findById(id);
        if (result.isEmpty()) {
            return null;
        }

        Owner existing = result.get();
        existing.setName(updatedOwner.getName());
        existing.setEmail(updatedOwner.getEmail());
        existing.setPhone(updatedOwner.getPhone());
        existing.setAddress(updatedOwner.getAddress());
        return ownerRepository.save(existing);
    }

    public boolean deleteOwner(Long id) {
        if (!ownerRepository.existsById(id)) {
            return false;
        }

        ownerRepository.deleteById(id);
        return true;
    }
}
