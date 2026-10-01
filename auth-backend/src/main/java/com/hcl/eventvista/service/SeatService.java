package com.hcl.eventvista.service;

import com.hcl.eventvista.dto.SeatDto;
import com.hcl.eventvista.entity.Seat;
import com.hcl.eventvista.entity.Venue;
import com.hcl.eventvista.exception.BadRequestException;
import com.hcl.eventvista.exception.ResourceNotFoundException;
import com.hcl.eventvista.repository.SeatRepository;
import com.hcl.eventvista.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final VenueRepository venueRepository;

    public SeatDto createSeat(SeatDto seatDto) {
        Venue venue = venueRepository.findById(seatDto.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", seatDto.getVenueId()));

        Seat seat = mapToEntity(seatDto, venue);
        return mapToDto(seatRepository.save(seat));
    }

    public List<SeatDto> getAllSeats() {
        return seatRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SeatDto getSeatById(Long id) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", id));
        return mapToDto(seat);
    }

    /** All seats of a venue, sorted row then number — this is what the seat map renders. */
    public List<SeatDto> getSeatsByVenue(Long venueId) {
        return seatRepository.findByVenueId(venueId).stream()
                .map(this::mapToDto)
                .sorted(Comparator.comparing(SeatDto::getSeatRow, Comparator.nullsLast(String::compareTo))
                        .thenComparing(s -> seatIndex(s.getSeatNumber())))
                .collect(Collectors.toList());
    }

    /** Fast lookup of valid seat labels, used while validating a booking. */
    public Set<String> getSeatLabelsForVenue(Long venueId) {
        return seatRepository.findByVenueId(venueId).stream()
                .map(Seat::getSeatNumber)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());
    }

    /**
     * Generates a seating layout for a venue, e.g. 10 rows x 12 seats -> A1..J12.
     * Existing seats are left untouched so it can be run again safely.
     */
    @Transactional
    public List<SeatDto> generateLayout(Long venueId, int rows, int seatsPerRow) {
        if (rows < 1 || rows > 26) throw new BadRequestException("Rows must be between 1 and 26");
        if (seatsPerRow < 1 || seatsPerRow > 40) throw new BadRequestException("Seats per row must be between 1 and 40");

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", venueId));

        Set<String> existing = getSeatLabelsForVenue(venueId);
        List<Seat> toSave = new ArrayList<>();

        for (int r = 0; r < rows; r++) {
            String rowLabel = String.valueOf((char) ('A' + r));
            for (int n = 1; n <= seatsPerRow; n++) {
                String label = rowLabel + n;
                if (existing.contains(label)) continue;
                toSave.add(Seat.builder()
                        .seatNumber(label)
                        .seatRow(rowLabel)
                        .isReserved(false)
                        .venue(venue)
                        .build());
            }
        }
        seatRepository.saveAll(toSave);
        return getSeatsByVenue(venueId);
    }

    @Transactional
    public void deleteSeatsByVenue(Long venueId) {
        seatRepository.deleteAll(seatRepository.findByVenueId(venueId));
    }

    /** "A12" -> 12, so seats sort numerically instead of A1, A10, A2. */
    private int seatIndex(String seatNumber) {
        String digits = seatNumber == null ? "" : seatNumber.replaceAll("\\D", "");
        return digits.isEmpty() ? 0 : Integer.parseInt(digits);
    }

    private SeatDto mapToDto(Seat seat) {
        return SeatDto.builder()
                .id(seat.getId())
                .seatNumber(seat.getSeatNumber())
                .seatRow(seat.getSeatRow())
                .isReserved(seat.getIsReserved())
                .venueId(seat.getVenue() != null ? seat.getVenue().getId() : null)
                .build();
    }

    private Seat mapToEntity(SeatDto seatDto, Venue venue) {
        return Seat.builder()
                .id(seatDto.getId())
                .seatNumber(seatDto.getSeatNumber() == null ? null : seatDto.getSeatNumber().toUpperCase())
                .seatRow(seatDto.getSeatRow())
                .isReserved(seatDto.getIsReserved() != null && seatDto.getIsReserved())
                .venue(venue)
                .build();
    }
}
