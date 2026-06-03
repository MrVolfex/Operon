package com.operon.operon.controller;

import com.operon.operon.dto.AppointmentCreateRequest;
import com.operon.operon.dto.AppointmentDTO;
import com.operon.operon.dto.ClientDTO;
import com.operon.operon.model.Appointment;
import com.operon.operon.service.AppointmentService;
import com.operon.operon.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/my-appointments")
@RequiredArgsConstructor
public class ClientAppointmentController {

    private final AppointmentService appointmentService;
    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments(Authentication authentication) {
        ClientDTO client = clientService.getClientByUsername(authentication.getName());
        return ResponseEntity.ok(appointmentService.getAppointmentsByClientId(client.getId()));
    }

    @PostMapping
    public ResponseEntity<AppointmentDTO> createAppointment(
            Authentication authentication,
            @RequestBody AppointmentCreateRequest request) {
        ClientDTO client = clientService.getClientByUsername(authentication.getName());
        request.setClientId(client.getId());
        return ResponseEntity.status(201).body(appointmentService.createAppointment(request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/booked-slots")
    public ResponseEntity<List<String>> getBookedSlots(@RequestParam LocalDate date) {
        return ResponseEntity.ok(appointmentService.getBookedSlots(date));
    }



}
