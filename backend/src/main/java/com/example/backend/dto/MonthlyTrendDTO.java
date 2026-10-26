
package com.example.backend.dto;

public class MonthlyTrendDTO {

    private String month;
    private long enquiries;
    private long siteVisits;

    public MonthlyTrendDTO() {
    }

    public MonthlyTrendDTO(
            String month,
            long enquiries,
            long siteVisits) {
        this.month = month;
        this.enquiries = enquiries;
        this.siteVisits = siteVisits;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public long getEnquiries() {
        return enquiries;
    }

    public void setEnquiries(long enquiries) {
        this.enquiries = enquiries;
    }

    public long getSiteVisits() {
        return siteVisits;
    }

    public void setSiteVisits(long siteVisits) {
        this.siteVisits = siteVisits;
    }
}
