
package com.example.backend.dto;

public class ReportsSummaryDTO {

    private long totalProperties;
    private long totalOwners;
    private long totalTenants;
    private long totalEnquiries;
    private long totalSiteVisits;

    public ReportsSummaryDTO() {
    }

    public ReportsSummaryDTO(
            long totalProperties,
            long totalOwners,
            long totalTenants,
            long totalEnquiries,
            long totalSiteVisits) {
        this.totalProperties = totalProperties;
        this.totalOwners = totalOwners;
        this.totalTenants = totalTenants;
        this.totalEnquiries = totalEnquiries;
        this.totalSiteVisits = totalSiteVisits;
    }

    public long getTotalProperties() {
        return totalProperties;
    }

    public void setTotalProperties(long totalProperties) {
        this.totalProperties = totalProperties;
    }

    public long getTotalOwners() {
        return totalOwners;
    }

    public void setTotalOwners(long totalOwners) {
        this.totalOwners = totalOwners;
    }

    public long getTotalTenants() {
        return totalTenants;
    }

    public void setTotalTenants(long totalTenants) {
        this.totalTenants = totalTenants;
    }

    public long getTotalEnquiries() {
        return totalEnquiries;
    }

    public void setTotalEnquiries(long totalEnquiries) {
        this.totalEnquiries = totalEnquiries;
    }

    public long getTotalSiteVisits() {
        return totalSiteVisits;
    }

    public void setTotalSiteVisits(long totalSiteVisits) {
        this.totalSiteVisits = totalSiteVisits;
    }
}
