package com.hcl.eventvista.repository;

import com.hcl.eventvista.entity.Booking;
import com.hcl.eventvista.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByEventId(Long eventId);

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByStatus(BookingStatus status);
}