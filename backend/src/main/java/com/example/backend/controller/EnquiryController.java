
package com.example.backend.controller;

import com.example.backend.entity.Enquiry;
import com.example.backend.service.EnquiryService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    // Submit a new enquiry
    @PostMapping
    public ResponseEntity<Enquiry> createEnquiry(
            @Valid @RequestBody Enquiry enquiry) {

        Enquiry savedEnquiry =
                enquiryService.createEnquiry(enquiry);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedEnquiry);
    }

    // Get all enquiries
    @GetMapping
    public ResponseEntity<List<Enquiry>> getAllEnquiries() {
        return ResponseEntity.ok(
                enquiryService.getAllEnquiries()
        );
    }

    // Track an enquiry using its tracking ID
    @GetMapping("/track/{trackingId}")
    public ResponseEntity<Enquiry> trackEnquiry(
            @PathVariable String trackingId) {

        return ResponseEntity.ok(
                enquiryService.trackEnquiry(trackingId)
        );
    }

    // Update enquiry status and admin response
    @PutMapping("/{id}/status")
    public ResponseEntity<Enquiry> updateEnquiryStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        Enquiry updatedEnquiry =
                enquiryService.updateEnquiryStatus(
                        id,
                        request.get("status"),
                        request.get("adminResponse")
                );

        return ResponseEntity.ok(updatedEnquiry);
    }
}
