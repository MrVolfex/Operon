package com.operon.operon.controller;

import com.operon.operon.dto.AppointmentCreateRequest;
import com.operon.operon.dto.AppointmentDTO;
import com.operon.operon.model.AppointmentStatus;
import com.operon.operon.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<AppointmentDTO>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByClientId(clientId));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<AppointmentDTO>> getByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByVehicleId(vehicleId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AppointmentDTO>> getByStatus(@PathVariable AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(status));
    }

    @GetMapping("/client/{clientId}/status/{status}")
    public ResponseEntity<List<AppointmentDTO>> getByClientAndStatus(
            @PathVariable Long clientId,
            @PathVariable AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByClientIdAndStatus(clientId, status));
    }

    @PostMapping
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody @Valid AppointmentCreateRequest request) {
        return ResponseEntity.status(201).body(appointmentService.createAppointment(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Long id, @RequestBody @Valid AppointmentCreateRequest request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
