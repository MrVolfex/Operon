package com.operon.operon.controller;

import com.operon.operon.dto.VehicleCreateRequest;
import com.operon.operon.dto.VehicleDTO;
import com.operon.operon.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDTO> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @GetMapping("/vin/{vin}")
    public ResponseEntity<VehicleDTO> getVehicleByVin(@PathVariable String vin) {
        return ResponseEntity.ok(vehicleService.getVehicleByVin(vin));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<VehicleDTO>> getVehiclesByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByClientId(clientId));
    }

    @PostMapping
    public ResponseEntity<VehicleDTO> createVehicle(@RequestBody @Valid VehicleCreateRequest request) {
        return ResponseEntity.status(201).body(vehicleService.createVehicle(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDTO> updateVehicle(@PathVariable Long id, @RequestBody @Valid VehicleCreateRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
