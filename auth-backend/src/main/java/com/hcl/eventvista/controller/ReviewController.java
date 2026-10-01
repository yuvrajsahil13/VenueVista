package com.hcl.eventvista.controller;

import com.hcl.eventvista.dto.ReviewDto;
import com.hcl.eventvista.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(@RequestBody ReviewDto reviewDto) {
        return new ResponseEntity<>(reviewService.createReview(reviewDto), HttpStatus.CREATED);
    }

    // NAYA ENDPOINT: Saari reviews fetch karne ke liye
    @GetMapping
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    // NAYA ENDPOINT: ID se specific review fetch karne ke liye
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDto> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(reviewService.getReviewsByEvent(eventId));
    }

    // NAYA ENDPOINT: Venue ke hisaab se reviews fetch karne ke liye
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(reviewService.getReviewsByVenue(venueId));
    }
}