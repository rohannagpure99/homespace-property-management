package com.example.backend.repository;

import com.example.backend.entity.Enquiry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnquiryRepository
        extends JpaRepository<Enquiry, Long> {

}
