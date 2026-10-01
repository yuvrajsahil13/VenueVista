package com.hcl.eventvista.repository;

import com.hcl.eventvista.entity.Event;
import com.hcl.eventvista.enums.EventCategory;
import com.hcl.eventvista.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatus(EventStatus status);

    List<Event> findByCategory(EventCategory category);

    List<Event> findByVenueId(Long venueId);

    List<Event> findByOrganizerId(Long organizerId);
}