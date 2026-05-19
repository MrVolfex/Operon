package com.operon.operon.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {
    private final JwtUtil jwtUtil;
    private final ClientDetailsService clientDetailsService;
    private final WorkerDetailsService workerDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtUtil jwtUtil, ClientDetailsService clientDetailsService,
                          WorkerDetailsService workerDetailsService,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtUtil = jwtUtil;
        this.clientDetailsService = clientDetailsService;
        this.workerDetailsService = workerDetailsService;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Order(1)
    public SecurityFilterChain workerFilterChain(HttpSecurity http) throws Exception {

        JwtAuthFilter workerJwtFilter = new JwtAuthFilter(workerDetailsService, jwtUtil);

        http.securityMatcher(
                        "/auth/worker/**","/api/workers/**",
                        "/api/work-orders/**", "/api/order-items/**",
                        "/api/parts/**",      "/api/service-types/**",
                        "/api/dashboard/**",  "/api/invoices/**",
                        "/api/clients/**",    "/api/appointments/**"
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/worker/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/clients").permitAll()
                        .requestMatchers("/api/work-orders/**","/api/appointments/**").hasAnyRole("MECHANIC", "OWNER")
                        .requestMatchers(
                                "/api/order-items/**",
                                "/api/parts/**", "/api/service-types/**"
                        ).hasRole("MECHANIC")
                        .requestMatchers(
                                "/api/dashboard/**", "/api/invoices/**",
                                "/api/clients/**", "/api/appointments/**", "/api/workers/**"
                        ).hasRole("OWNER")
                        .anyRequest().authenticated()
                ).addFilterBefore(workerJwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain clientFilterChain(HttpSecurity http) throws Exception {

        JwtAuthFilter clientJwtFilter = new JwtAuthFilter(clientDetailsService, jwtUtil);

        http.securityMatcher(
                        "/auth/client/**",
                        "/api/vehicles/**",
                        "/api/notifications/**",
                        "/api/client-order-parts/**"
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/client/login").permitAll()
                        .anyRequest().authenticated()
                ).addFilterBefore(clientJwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

}

