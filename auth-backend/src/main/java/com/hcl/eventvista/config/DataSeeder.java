package com.hcl.eventvista.config;

import com.hcl.eventvista.entity.User;
import com.hcl.eventvista.enums.Role;
import com.hcl.eventvista.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Creates a default admin account on first start so the admin panel can be used. */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (!Boolean.TRUE.equals(userRepository.existsByEmail("admin@eventvista.com"))) {
            userRepository.save(User.builder()
                    .name("EventVista Admin")
                    .email("admin@eventvista.com")
                    .password("admin123")
                    .phone("9999999999")
                    .role(Role.ROLE_ADMIN)
                    .build());
        }
    }
}
