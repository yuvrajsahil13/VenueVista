package com.hcl.eventvista.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {

    private Long id;
    private Integer rating;
    private String comment;
    private Long userId;
    private Long eventId;
    private Long venueId;
}