package com.hcl.eventvista.controller;

import com.hcl.eventvista.dto.SeatDto;
import com.hcl.eventvista.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping
    public ResponseEntity<SeatDto> createSeat(@RequestBody SeatDto seatDto) {
        return new ResponseEntity<>(seatService.createSeat(seatDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SeatDto>> getAllSeats() {
        return ResponseEntity.ok(seatService.getAllSeats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatDto> getSeatById(@PathVariable Long id) {
        return ResponseEntity.ok(seatService.getSeatById(id));
    }

    /** Seat map for a venue. */
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<SeatDto>> getSeatsByVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(seatService.getSeatsByVenue(venueId));
    }

    /** Admin helper: build a rows x seatsPerRow layout in one call. */
    @PostMapping("/venue/{venueId}/generate")
    public ResponseEntity<List<SeatDto>> generateLayout(@PathVariable Long venueId,
                                                        @RequestParam(defaultValue = "8") int rows,
                                                        @RequestParam(defaultValue = "10") int seatsPerRow) {
        return new ResponseEntity<>(seatService.generateLayout(venueId, rows, seatsPerRow), HttpStatus.CREATED);
    }

    @DeleteMapping("/venue/{venueId}")
    public ResponseEntity<String> deleteSeatsByVenue(@PathVariable Long venueId) {
        seatService.deleteSeatsByVenue(venueId);
        return ResponseEntity.ok("Seat layout cleared for venue " + venueId);
    }
}
