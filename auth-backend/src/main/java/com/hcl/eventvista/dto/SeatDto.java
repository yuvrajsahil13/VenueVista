package com.hcl.eventvista.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatDto {

    private Long id;
    private String seatNumber;
    private String seatRow;
    private Boolean isReserved;
    private Long venueId;
}