package com.operon.operon.controller;

import com.operon.operon.dto.ServiceTypeCreateRequest;
import com.operon.operon.dto.ServiceTypeDTO;
import com.operon.operon.service.ServiceTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/service-types")
public class ServiceTypeController {

    private final ServiceTypeService serviceTypeService;

    @GetMapping
    public ResponseEntity<List<ServiceTypeDTO>> getAllServiceTypes() {
        return ResponseEntity.ok(serviceTypeService.getAllServiceTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceTypeDTO> getServiceTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceTypeService.getServiceTypeById(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ServiceTypeDTO>> getServiceTypesByType(@PathVariable String type) {
        return ResponseEntity.ok(serviceTypeService.getServiceTypesByType(type));
    }

    @PostMapping
    public ResponseEntity<ServiceTypeDTO> createServiceType(@RequestBody @Valid ServiceTypeCreateRequest request) {
        return ResponseEntity.status(201).body(serviceTypeService.createServiceType(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceTypeDTO> updateServiceType(@PathVariable Long id, @RequestBody @Valid ServiceTypeCreateRequest request) {
        return ResponseEntity.ok(serviceTypeService.updateServiceType(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceType(@PathVariable Long id) {
        serviceTypeService.deleteServiceType(id);
        return ResponseEntity.noContent().build();
    }
}
