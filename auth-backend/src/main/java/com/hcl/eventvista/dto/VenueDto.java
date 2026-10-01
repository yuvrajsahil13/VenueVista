package com.hcl.eventvista.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueDto {

    private Long id;
    private String name;
    private String address;
    private String city;
    private Integer capacity;
    private String contactEmail;
    private String contactPhone;
    private String imageUrl;
}