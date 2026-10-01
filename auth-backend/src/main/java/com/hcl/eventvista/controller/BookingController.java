package com.hcl.eventvista.controller;

import com.hcl.eventvista.dto.BookingRequestDto;
import com.hcl.eventvista.dto.BookingResponseDto;
import com.hcl.eventvista.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponseDto> createBooking(@RequestBody BookingRequestDto requestDto) {
        return new ResponseEntity<>(bookingService.createBooking(requestDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDto>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDto> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponseDto>> getBookingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    /** Seats already booked for an event, used to grey them out on the seat map. */
    @GetMapping("/event/{eventId}/reserved-seats")
    public ResponseEntity<List<String>> getReservedSeats(@PathVariable Long eventId) {
        return ResponseEntity.ok(bookingService.getReservedSeats(eventId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok("Booking cancelled successfully");
    }
}
