package com.hcl.eventvista.service;

import com.hcl.eventvista.dto.VenueDto;
import com.hcl.eventvista.entity.Venue;
import com.hcl.eventvista.exception.ResourceNotFoundException;
import com.hcl.eventvista.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueDto createVenue(VenueDto venueDto) {
        Venue venue = mapToEntity(venueDto);
        Venue savedVenue = venueRepository.save(venue);
        return mapToDto(savedVenue);
    }

    public VenueDto getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));
        return mapToDto(venue);
    }

    public List<VenueDto> getAllVenues() {
        return venueRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<VenueDto> getVenuesByCity(String city) {
        return venueRepository.findByCityContainingIgnoreCase(city)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public VenueDto updateVenue(Long id, VenueDto venueDto) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));

        venue.setName(venueDto.getName());
        venue.setAddress(venueDto.getAddress());
        venue.setCity(venueDto.getCity());
        venue.setCapacity(venueDto.getCapacity());
        venue.setContactEmail(venueDto.getContactEmail());
        venue.setContactPhone(venueDto.getContactPhone());
        venue.setImageUrl(venueDto.getImageUrl());

        Venue updatedVenue = venueRepository.save(venue);
        return mapToDto(updatedVenue);
    }

    public void deleteVenue(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));
        venueRepository.delete(venue);
    }

    private VenueDto mapToDto(Venue venue) {
        return VenueDto.builder()
                .id(venue.getId())
                .name(venue.getName())
                .address(venue.getAddress())
                .city(venue.getCity())
                .capacity(venue.getCapacity())
                .contactEmail(venue.getContactEmail())
                .contactPhone(venue.getContactPhone())
                .imageUrl(venue.getImageUrl())
                .build();
    }

    private Venue mapToEntity(VenueDto venueDto) {
        return Venue.builder()
                .id(venueDto.getId())
                .name(venueDto.getName())
                .address(venueDto.getAddress())
                .city(venueDto.getCity())
                .capacity(venueDto.getCapacity())
                .contactEmail(venueDto.getContactEmail())
                .contactPhone(venueDto.getContactPhone())
                .imageUrl(venueDto.getImageUrl())
                .build();
    }
}