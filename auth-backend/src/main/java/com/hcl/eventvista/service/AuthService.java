package com.hcl.eventvista.service;

import com.hcl.eventvista.dto.LoginRequestDto;
import com.hcl.eventvista.dto.UserDto;
import com.hcl.eventvista.entity.User;
import com.hcl.eventvista.enums.Role;
import com.hcl.eventvista.exception.BadRequestException;
import com.hcl.eventvista.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public UserDto register(UserDto dto) {
        if (dto.getEmail() == null || dto.getPassword() == null || dto.getName() == null) {
            throw new BadRequestException("Name, email and password are required");
        }
        String email = dto.getEmail().trim().toLowerCase();
        if (Boolean.TRUE.equals(userRepository.existsByEmail(email))) {
            throw new BadRequestException("An account with this email already exists");
        }
        // Public sign-up can only create attendees or organizers, never admins
        Role role = dto.getRole() == Role.ROLE_ORGANIZER ? Role.ROLE_ORGANIZER : Role.ROLE_ATTENDEE;

        User user = User.builder()
                .name(dto.getName())
                .email(email)
                .password(dto.getPassword())
                .phone(dto.getPhone())
                .role(role)
                .build();
        return toDto(userRepository.save(user));
    }

    public UserDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!user.getPassword().equals(request.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        return toDto(user);
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .build();
    }
}
