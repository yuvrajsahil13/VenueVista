package com.hcl.eventvista.service;

import com.hcl.eventvista.dto.BookingRequestDto;
import com.hcl.eventvista.dto.BookingResponseDto;
import com.hcl.eventvista.entity.Booking;
import com.hcl.eventvista.entity.Event;
import com.hcl.eventvista.entity.Ticket;
import com.hcl.eventvista.entity.User;
import com.hcl.eventvista.enums.BookingStatus;
import com.hcl.eventvista.exception.BadRequestException;
import com.hcl.eventvista.exception.ResourceNotFoundException;
import com.hcl.eventvista.repository.BookingRepository;
import com.hcl.eventvista.repository.EventRepository;
import com.hcl.eventvista.repository.TicketRepository;
import com.hcl.eventvista.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final SeatService seatService;

    @Transactional
    public BookingResponseDto createBooking(BookingRequestDto requestDto) {
        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestDto.getUserId()));

        Event event = eventRepository.findById(requestDto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", requestDto.getEventId()));

        Ticket ticket = ticketRepository.findById(requestDto.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", requestDto.getTicketId()));

        if (!ticket.getEvent().getId().equals(event.getId())) {
            throw new BadRequestException("This ticket does not belong to the selected event");
        }

        Integer quantity = requestDto.getQuantity();
        if (quantity == null || quantity < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        // ----- Seat selection -----
        List<String> seats = normalizeSeats(requestDto.getSeatNumbers());
        if (!seats.isEmpty()) {
            if (seats.size() != quantity) {
                throw new BadRequestException("Please select exactly " + quantity + " seat(s)");
            }
            Set<String> validSeats = seatService.getSeatLabelsForVenue(event.getVenue().getId());
            if (!validSeats.isEmpty()) {
                List<String> invalid = seats.stream().filter(s -> !validSeats.contains(s)).toList();
                if (!invalid.isEmpty()) {
                    throw new BadRequestException("Seat(s) not found at this venue: " + String.join(", ", invalid));
                }
            }
            Set<String> taken = new HashSet<>(getReservedSeats(event.getId()));
            List<String> clash = seats.stream().filter(taken::contains).toList();
            if (!clash.isEmpty()) {
                throw new BadRequestException("Sorry, these seats were just booked by someone else: " + String.join(", ", clash));
            }
        }

        if (ticket.getAvailableQuantity() < quantity) {
            throw new BadRequestException("Not enough tickets available");
        }

        ticket.setAvailableQuantity(ticket.getAvailableQuantity() - quantity);
        ticketRepository.save(ticket);

        BigDecimal totalPrice = ticket.getPrice().multiply(BigDecimal.valueOf(quantity));

        Booking booking = Booking.builder()
                .bookingReference("EV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .quantity(quantity)
                .totalPrice(totalPrice)
                .status(BookingStatus.CONFIRMED)
                .bookingTime(LocalDateTime.now())
                .seatNumbers(seats.isEmpty() ? null : String.join(",", seats))
                .user(user)
                .event(event)
                .ticket(ticket)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponseDto(savedBooking);
    }

    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public BookingResponseDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return mapToResponseDto(booking);
    }

    public List<BookingResponseDto> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /** Seat labels already taken for an event (cancelled bookings release their seats). */
    public List<String> getReservedSeats(Long eventId) {
        return bookingRepository.findByEventId(eventId).stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .map(Booking::getSeatNumbers)
                .filter(Objects::nonNull)
                .flatMap(s -> Arrays.stream(s.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        Ticket ticket = booking.getTicket();
        ticket.setAvailableQuantity(ticket.getAvailableQuantity() + booking.getQuantity());
        ticketRepository.save(ticket);
    }

    private List<String> normalizeSeats(List<String> seats) {
        if (seats == null) return List.of();
        return seats.stream()
                .filter(Objects::nonNull)
                .map(s -> s.trim().toUpperCase())
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    private BookingResponseDto mapToResponseDto(Booking booking) {
        return BookingResponseDto.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .quantity(booking.getQuantity())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .bookingTime(booking.getBookingTime())
                .seatNumbers(booking.getSeatNumbers())
                .userId(booking.getUser().getId())
                .eventId(booking.getEvent().getId())
                .ticketId(booking.getTicket().getId())
                .build();
    }
}
