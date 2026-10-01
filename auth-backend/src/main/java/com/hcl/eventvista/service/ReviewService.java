package com.hcl.eventvista.service;

import com.hcl.eventvista.dto.ReviewDto;
import com.hcl.eventvista.entity.Event;
import com.hcl.eventvista.entity.Review;
import com.hcl.eventvista.entity.User;
import com.hcl.eventvista.entity.Venue;
import com.hcl.eventvista.exception.ResourceNotFoundException;
import com.hcl.eventvista.repository.EventRepository;
import com.hcl.eventvista.repository.ReviewRepository;
import com.hcl.eventvista.repository.UserRepository;
import com.hcl.eventvista.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    public ReviewDto createReview(ReviewDto reviewDto) {
        User user = userRepository.findById(reviewDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reviewDto.getUserId()));

        Event event = null;
        if (reviewDto.getEventId() != null) {
            event = eventRepository.findById(reviewDto.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event", "id", reviewDto.getEventId()));
        }

        Venue venue = null;
        if (reviewDto.getVenueId() != null) {
            venue = venueRepository.findById(reviewDto.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", reviewDto.getVenueId()));
        }

        Review review = Review.builder()
                .rating(reviewDto.getRating())
                .comment(reviewDto.getComment())
                .user(user)
                .event(event)
                .venue(venue)
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToDto(savedReview);
    }

    public List<ReviewDto> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ReviewDto getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        return mapToDto(review);
    }

    public List<ReviewDto> getReviewsByEvent(Long eventId) {
        return reviewRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReviewDto> getReviewsByVenue(Long venueId) {
        return reviewRepository.findByVenueId(venueId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ReviewDto mapToDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .eventId(review.getEvent() != null ? review.getEvent().getId() : null)
                .venueId(review.getVenue() != null ? review.getVenue().getId() : null)
                .build();
    }
}