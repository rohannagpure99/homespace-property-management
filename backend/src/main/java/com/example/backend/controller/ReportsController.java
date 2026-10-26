
package com.example.backend.controller;

import com.example.backend.dto.MonthlyTrendDTO;
import com.example.backend.dto.ReportsSummaryDTO;
import com.example.backend.service.ReportsService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    // Get summary counts for the Reports dashboard
    @GetMapping("/summary")
    public ReportsSummaryDTO getSummary() {
        return reportsService.getSummary();
    }

    // Get monthly enquiry and site visit trends
    @GetMapping("/monthly-trends")
    public List<MonthlyTrendDTO> getMonthlyTrends() {
        return reportsService.getMonthlyTrends();
    }
}
