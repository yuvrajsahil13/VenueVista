package com.hcl.eventvista.repository;

import com.hcl.eventvista.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByCityContainingIgnoreCase(String city);
}