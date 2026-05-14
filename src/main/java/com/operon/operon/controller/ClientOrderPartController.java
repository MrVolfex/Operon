package com.operon.operon.controller;

import com.operon.operon.dto.ClientOrderPartCreateRequest;
import com.operon.operon.dto.ClientOrderPartDTO;
import com.operon.operon.model.OrderStatus;
import com.operon.operon.service.ClientOrderPartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client-order-parts")
@RequiredArgsConstructor
public class ClientOrderPartController {

    private final ClientOrderPartService clientOrderPartService;

    @GetMapping
    public ResponseEntity<List<ClientOrderPartDTO>> getAllClientOrderParts() {
        return ResponseEntity.ok(clientOrderPartService.getAllClientOrderParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientOrderPartDTO> getClientOrderPartById(@PathVariable Long id) {
        return ResponseEntity.ok(clientOrderPartService.getClientOrderPartById(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ClientOrderPartDTO>> getClientOrderPartsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(clientOrderPartService.getClientOrderPartsByClient(clientId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ClientOrderPartDTO>> getClientOrderPartsByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(clientOrderPartService.getClientOrderPartsByStatus(status));
    }

    @GetMapping("/client/{clientId}/status/{status}")
    public ResponseEntity<List<ClientOrderPartDTO>> getClientOrderPartsByClientAndStatus(@PathVariable Long clientId, @PathVariable OrderStatus status) {
        return ResponseEntity.ok(clientOrderPartService.getClientOrderPartsByClientAndStatus(clientId, status));
    }

    @PostMapping
    public ResponseEntity<ClientOrderPartDTO> createClientOrderPart(@Valid @RequestBody ClientOrderPartCreateRequest request) {
        return ResponseEntity.status(201).body(clientOrderPartService.createClientOrderPart(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClientOrderPart(@PathVariable Long id) {
        clientOrderPartService.deleteClientOrderPart(id);
        return ResponseEntity.noContent().build();
    }
}
