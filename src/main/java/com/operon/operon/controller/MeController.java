package com.operon.operon.controller;

import com.operon.operon.dto.ClientDTO;
import com.operon.operon.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<ClientDTO> getCurrentClient(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(clientService.getClientByUsername(username));
    }
}
