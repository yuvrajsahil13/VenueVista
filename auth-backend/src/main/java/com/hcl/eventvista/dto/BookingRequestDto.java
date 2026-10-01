package com.hcl.eventvista.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestDto {

    private Long userId;
    private Long eventId;
    private Long ticketId;
    private Integer quantity;
    /** Optional: seats picked on the seat map, e.g. ["A1", "A2"] */
    private List<String> seatNumbers;
}
