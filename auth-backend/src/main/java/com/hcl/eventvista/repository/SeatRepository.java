package com.hcl.eventvista.repository;

import com.hcl.eventvista.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByVenueId(Long venueId);

    List<Seat> findByVenueIdAndIsReserved(Long venueId, Boolean isReserved);
}