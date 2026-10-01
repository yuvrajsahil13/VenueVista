package com.hcl.eventvista.dto;

import com.hcl.eventvista.enums.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDto {

    private Long id;
    private String bookingReference;
    private Integer quantity;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private LocalDateTime bookingTime;
    private String seatNumbers;
    private Long userId;
    private Long eventId;
    private Long ticketId;
}
