package com.example.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.entity.SiteVisit;
import com.example.backend.service.SiteVisitService;

@RestController
@RequestMapping("/api/site-visits")
@CrossOrigin(origins = "http://localhost:5173")
public class SiteVisitController {

    private final SiteVisitService siteVisitService;

    public SiteVisitController(SiteVisitService siteVisitService) {
        this.siteVisitService = siteVisitService;
    }

    @GetMapping
    public ResponseEntity<List<SiteVisit>> getAllSiteVisits() {
        return ResponseEntity.ok(siteVisitService.getAllSiteVisits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteVisit> getSiteVisitById(@PathVariable Long id) {
        return ResponseEntity.ok(siteVisitService.getSiteVisitById(id));
    }

    @PostMapping
    public ResponseEntity<SiteVisit> createSiteVisit(
            @RequestBody SiteVisit siteVisit) {

        SiteVisit savedVisit = siteVisitService.createSiteVisit(siteVisit);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedVisit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteVisit> updateSiteVisit(
            @PathVariable Long id,
            @RequestBody SiteVisit siteVisit) {

        return ResponseEntity.ok(
                siteVisitService.updateSiteVisit(id, siteVisit));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SiteVisit> updateSiteVisitStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        return ResponseEntity.ok(
                siteVisitService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSiteVisit(@PathVariable Long id) {
        siteVisitService.deleteSiteVisit(id);
        return ResponseEntity.noContent().build();
    }
}