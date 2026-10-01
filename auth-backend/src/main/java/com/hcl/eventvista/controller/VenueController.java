package com.hcl.eventvista.controller;

import com.hcl.eventvista.dto.VenueDto;
import com.hcl.eventvista.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @PostMapping
    public ResponseEntity<VenueDto> createVenue(@RequestBody VenueDto venueDto) {
        return new ResponseEntity<>(venueService.createVenue(venueDto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueDto> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @GetMapping
    public ResponseEntity<List<VenueDto>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/search")
    public ResponseEntity<List<VenueDto>> getVenuesByCity(@RequestParam String city) {
        return ResponseEntity.ok(venueService.getVenuesByCity(city));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueDto> updateVenue(@PathVariable Long id, @RequestBody VenueDto venueDto) {
        return ResponseEntity.ok(venueService.updateVenue(id, venueDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.ok("Venue deleted successfully");
    }
}