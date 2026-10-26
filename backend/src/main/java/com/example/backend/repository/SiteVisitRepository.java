package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.SiteVisit;

@Repository
public interface SiteVisitRepository extends JpaRepository<SiteVisit, Long> {

}