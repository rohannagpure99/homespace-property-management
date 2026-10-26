package com.example.backend.service;

import com.example.backend.entity.Enquiry;
import com.example.backend.repository.EnquiryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;

    public EnquiryService(EnquiryRepository enquiryRepository) {
        this.enquiryRepository = enquiryRepository;
    }

    // Create a new enquiry
    @Transactional
    public Enquiry createEnquiry(Enquiry enquiry) {
        enquiry.setId(null);
        enquiry.setStatus("PENDING");
        enquiry.setAdminResponse(null);

        return enquiryRepository.save(enquiry);
    }

    // Get all enquiries for the admin
    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAll();
    }

    // Track an enquiry using its tracking ID
    public Enquiry trackEnquiry(String trackingId) {
        if (trackingId == null || trackingId.isBlank()) {
            throw new IllegalArgumentException(
                "Please enter a tracking ID."
            );
        }

        String normalizedId = trackingId.trim()
            .toUpperCase(Locale.ROOT);

        if (!normalizedId.matches("HS-ENQ-\\d{5,}")) {
            throw new IllegalArgumentException(
                "Invalid tracking ID. Example: HS-ENQ-00001"
            );
        }

        Long id;

        try {
            id = Long.parseLong(
                normalizedId.substring("HS-ENQ-".length())
            );
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(
                "Invalid tracking ID."
            );
        }

        return enquiryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "No enquiry found for this tracking ID."
            ));
    }

    // Update enquiry status and admin response
    @Transactional
    public Enquiry updateEnquiryStatus(
            Long id,
            String status,
            String adminResponse) {

        Enquiry enquiry = enquiryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "Enquiry not found."
            ));

        Set<String> allowedStatuses = Set.of(
            "PENDING",
            "IN_PROGRESS",
            "RESOLVED",
            "REJECTED"
        );

        if (status == null ||
                !allowedStatuses.contains(
                    status.trim().toUpperCase(Locale.ROOT))) {
            throw new IllegalArgumentException(
                "Invalid status. Use PENDING, IN_PROGRESS, RESOLVED, or REJECTED."
            );
        }

        enquiry.setStatus(
            status.trim().toUpperCase(Locale.ROOT)
        );
        enquiry.setAdminResponse(adminResponse);

        return enquiryRepository.save(enquiry);
    }
}
