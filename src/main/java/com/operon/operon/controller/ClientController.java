package com.operon.operon.controller;

import com.operon.operon.dto.ClientCreateRequest;
import com.operon.operon.dto.ClientDTO;
import com.operon.operon.dto.LoginResponse;
import com.operon.operon.dto.VehicleDTO;
import com.operon.operon.model.ClientType;
import com.operon.operon.security.JwtUtil;
import com.operon.operon.service.ClientService;
import com.operon.operon.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping ("/api/clients")
@RequiredArgsConstructor
public class ClientController {
    private final ClientService clientService;
    private final VehicleService vehicleService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<ClientDTO>> getAllClients(){
        return ResponseEntity.ok(clientService.getAllClients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientDTO> getClientById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientByID(id));
    }

    @PostMapping
    public ResponseEntity<LoginResponse> createClient(@RequestBody @Valid ClientCreateRequest request) {
        clientService.createClient(request);
        String token = jwtUtil.generateToken(request.getUsername());

        return ResponseEntity.status(201).body(new LoginResponse(token, "CLIENT"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientDTO> updateClient(@PathVariable Long id, @RequestBody @Valid ClientCreateRequest request) {
        return ResponseEntity.ok(clientService.updateClient(id,request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/type/{clientType}")
    public ResponseEntity<List<ClientDTO>> getClientsByType(@PathVariable ClientType clientType) {
        return ResponseEntity.ok(clientService.getClientsByType(clientType));
    }

    @GetMapping("/{id}/vehicles")
    public ResponseEntity<List<VehicleDTO>> getVehiclesByClient(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehiclesByClientId(id));
    }

}



