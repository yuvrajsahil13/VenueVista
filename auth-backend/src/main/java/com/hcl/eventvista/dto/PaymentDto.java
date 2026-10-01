package com.hcl.eventvista.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDto {

    private Long id;
    private String transactionId;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal amount;
    private LocalDateTime paymentTime;
    private Long bookingId;
}