package com.hcl.eventvista.dto;

import com.hcl.eventvista.enums.TicketType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDto {

    private Long id;
    private TicketType ticketType;
    private BigDecimal price;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private Long eventId;
}