package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.entity.SiteVisit;
import com.example.backend.repository.SiteVisitRepository;

@Service
public class SiteVisitService {

    private final SiteVisitRepository siteVisitRepository;

    public SiteVisitService(SiteVisitRepository siteVisitRepository) {
        this.siteVisitRepository = siteVisitRepository;
    }

    public List<SiteVisit> getAllSiteVisits() {
        return siteVisitRepository.findAll();
    }

    public SiteVisit getSiteVisitById(Long id) {
        return siteVisitRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Site visit not found with ID: " + id));
    }

    public SiteVisit createSiteVisit(SiteVisit siteVisit) {
        siteVisit.setId(null);
        return siteVisitRepository.save(siteVisit);
    }

    public SiteVisit updateSiteVisit(Long id, SiteVisit updatedVisit) {
        SiteVisit existingVisit = getSiteVisitById(id);

        existingVisit.setVisitorName(updatedVisit.getVisitorName());
        existingVisit.setPhone(updatedVisit.getPhone());
        existingVisit.setEmail(updatedVisit.getEmail());
        existingVisit.setPropertyName(updatedVisit.getPropertyName());
        existingVisit.setVisitDate(updatedVisit.getVisitDate());
        existingVisit.setVisitTime(updatedVisit.getVisitTime());
        existingVisit.setStatus(updatedVisit.getStatus());
        existingVisit.setNotes(updatedVisit.getNotes());

        return siteVisitRepository.save(existingVisit);
    }

    public SiteVisit updateStatus(Long id, String status) {
        SiteVisit siteVisit = getSiteVisitById(id);

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        siteVisit.setStatus(status.trim().toUpperCase());

        return siteVisitRepository.save(siteVisit);
    }

    public void deleteSiteVisit(Long id) {
        SiteVisit siteVisit = getSiteVisitById(id);
        siteVisitRepository.delete(siteVisit);
    }
}