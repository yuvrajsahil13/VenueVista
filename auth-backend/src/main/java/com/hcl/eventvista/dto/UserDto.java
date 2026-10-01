package com.hcl.eventvista.dto;

import com.hcl.eventvista.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;
    private String name;
    private String email;
    private String password;
    private Role role;
    private String phone;
}