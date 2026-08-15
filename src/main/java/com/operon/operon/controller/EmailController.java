package com.operon.operon.controller;

import com.operon.operon.model.Client;
import com.operon.operon.repository.ClientRepository;
import com.operon.operon.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;
    private final ClientRepository clientRepository;

    @PostMapping("/reminder/{clientId}")
    public ResponseEntity<Void> sendReminder(
            @PathVariable Long clientId,
            @RequestParam String subject,
            @RequestBody String htmlBody) throws Exception {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        emailService.sendEmail(client.getEmail(), subject, htmlBody);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/to-all-clients")
    public ResponseEntity<Void> toAllClients(
            @RequestParam String subject,
            @RequestBody String htmlBody) throws Exception {

        List<Client> clients = clientRepository.findAll();
        for (Client client : clients) {
            if (client.getEmail() != null && !client.getEmail().isBlank()) {
                emailService.sendEmail(client.getEmail(), subject, htmlBody);
            }
        }
        return ResponseEntity.ok().build();
    }
}
