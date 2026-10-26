
package com.example.backend.service;

import com.example.backend.dto.MonthlyTrendDTO;
import com.example.backend.dto.ReportsSummaryDTO;
import com.example.backend.repository.PropertyRepository;
import com.example.backend.repository.OwnerRepository;
import com.example.backend.repository.TenantRepository;
import com.example.backend.repository.EnquiryRepository;
import com.example.backend.repository.SiteVisitRepository;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ReportsService {

    private final PropertyRepository propertyRepository;
    private final OwnerRepository ownerRepository;
    private final TenantRepository tenantRepository;
    private final EnquiryRepository enquiryRepository;
    private final SiteVisitRepository siteVisitRepository;

    public ReportsService(
            PropertyRepository propertyRepository,
            OwnerRepository ownerRepository,
            TenantRepository tenantRepository,
            EnquiryRepository enquiryRepository,
            SiteVisitRepository siteVisitRepository) {

        this.propertyRepository = propertyRepository;
        this.ownerRepository = ownerRepository;
        this.tenantRepository = tenantRepository;
        this.enquiryRepository = enquiryRepository;
        this.siteVisitRepository = siteVisitRepository;
    }

    public ReportsSummaryDTO getSummary() {
        return new ReportsSummaryDTO(
                propertyRepository.count(),
                ownerRepository.count(),
                tenantRepository.count(),
                enquiryRepository.count(),
                siteVisitRepository.count()
        );
    }
        public List<MonthlyTrendDTO> getMonthlyTrends() {
        return List.of();
    }

    
}
