package com.hcl.eventvista.dto;

import com.hcl.eventvista.enums.EventCategory;
import com.hcl.eventvista.enums.EventStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDto {

    private Long id;
    private String title;
    private String description;
    private EventCategory category;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;
    private String bannerUrl;
    private Long venueId;
    private Long organizerId;
}