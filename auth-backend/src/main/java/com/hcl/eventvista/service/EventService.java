package com.hcl.eventvista.service;

import com.hcl.eventvista.dto.EventDto;
import com.hcl.eventvista.entity.Event;
import com.hcl.eventvista.entity.User;
import com.hcl.eventvista.entity.Venue;
import com.hcl.eventvista.enums.EventCategory;
import com.hcl.eventvista.enums.EventStatus;
import com.hcl.eventvista.exception.ResourceNotFoundException;
import com.hcl.eventvista.repository.EventRepository;
import com.hcl.eventvista.repository.UserRepository;
import com.hcl.eventvista.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    public EventDto createEvent(EventDto eventDto) {
        Venue venue = venueRepository.findById(eventDto.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", eventDto.getVenueId()));

        User organizer = userRepository.findById(eventDto.getOrganizerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", eventDto.getOrganizerId()));

        Event event = mapToEntity(eventDto, venue, organizer);
        Event savedEvent = eventRepository.save(event);
        return mapToDto(savedEvent);
    }

    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        return mapToDto(event);
    }

    public List<EventDto> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getEventsByStatus(EventStatus status) {
        return eventRepository.findByStatus(status)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getEventsByCategory(EventCategory category) {
        return eventRepository.findByCategory(category)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EventDto updateEvent(Long id, EventDto eventDto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        Venue venue = venueRepository.findById(eventDto.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", eventDto.getVenueId()));

        event.setTitle(eventDto.getTitle());
        event.setDescription(eventDto.getDescription());
        event.setCategory(eventDto.getCategory());
        event.setStartTime(eventDto.getStartTime());
        event.setEndTime(eventDto.getEndTime());
        event.setStatus(eventDto.getStatus());
        event.setBannerUrl(eventDto.getBannerUrl());
        event.setVenue(venue);

        Event updatedEvent = eventRepository.save(event);
        return mapToDto(updatedEvent);
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        eventRepository.delete(event);
    }

    private EventDto mapToDto(Event event) {
        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .category(event.getCategory())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .status(event.getStatus())
                .bannerUrl(event.getBannerUrl())
                .venueId(event.getVenue().getId())
                .organizerId(event.getOrganizer().getId())
                .build();
    }

    private Event mapToEntity(EventDto eventDto, Venue venue, User organizer) {
        return Event.builder()
                .id(eventDto.getId())
                .title(eventDto.getTitle())
                .description(eventDto.getDescription())
                .category(eventDto.getCategory())
                .startTime(eventDto.getStartTime())
                .endTime(eventDto.getEndTime())
                .status(eventDto.getStatus())
                .bannerUrl(eventDto.getBannerUrl())
                .venue(venue)
                .organizer(organizer)
                .build();
    }
}