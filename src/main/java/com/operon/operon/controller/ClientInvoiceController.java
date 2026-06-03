package com.operon.operon.controller;

import com.operon.operon.dto.InvoiceDTO;
import com.operon.operon.model.Client;
import com.operon.operon.repository.ClientRepository;
import com.operon.operon.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/my-invoices")
@RequiredArgsConstructor
public class ClientInvoiceController {

    private final InvoiceService invoiceService;
    private final ClientRepository clientRepository;

    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getMyInvoices(Authentication authentication) {
        Client client = clientRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        return ResponseEntity.ok(invoiceService.getInvoicesByClient(client.getId()));
    }
}
