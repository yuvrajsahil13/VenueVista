package com.hcl.eventvista.repository;

import com.hcl.eventvista.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByEventId(Long eventId);

    List<Review> findByVenueId(Long venueId);

    List<Review> findByUserId(Long userId);
}