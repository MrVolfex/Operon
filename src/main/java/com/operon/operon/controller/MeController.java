package com.operon.operon.controller;

import com.operon.operon.dto.ClientDTO;
import com.operon.operon.dto.ClientProfileUpdateRequest;
import com.operon.operon.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


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

    @PatchMapping("/profile-image")
    public ResponseEntity<ClientDTO> updateProfileImage(Authentication authentication,
                                                         @RequestBody java.util.Map<String, String> body) {
        String username = authentication.getName();
        ClientDTO current = clientService.getClientByUsername(username);
        return ResponseEntity.ok(clientService.updateProfileImage(current.getId(), body.get("imageUrl")));
    }

    @PutMapping
    public ResponseEntity<ClientDTO> updateCurrentClient(Authentication authentication,
                                                          @RequestBody @Valid ClientProfileUpdateRequest request) {
        String username = authentication.getName();
        ClientDTO current = clientService.getClientByUsername(username);
        return ResponseEntity.ok(clientService.updateCurrentClient(current.getId(), request));
    }
}
