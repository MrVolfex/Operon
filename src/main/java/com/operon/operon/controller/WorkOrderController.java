package com.operon.operon.controller;

import com.operon.operon.dto.WorkOrderCreateRequest;
import com.operon.operon.dto.WorkOrderDTO;
import com.operon.operon.model.WorkOrderStatus;
import com.operon.operon.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    public ResponseEntity<List<WorkOrderDTO>> getAllWorkOrders() {
        return ResponseEntity.ok(workOrderService.getAllWorkOrder());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderDTO> getWorkOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<WorkOrderDTO>> getWorkOrdersByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByVehicle(vehicleId));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkOrderDTO>> getWorkOrdersByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByWorker(workerId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<WorkOrderDTO>> getWorkOrdersByStatus(@PathVariable WorkOrderStatus status) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByStatus(status));
    }

    @PostMapping
    public ResponseEntity<WorkOrderDTO> createWorkOrder(@RequestBody @Valid WorkOrderCreateRequest request) {
        return ResponseEntity.status(201).body(workOrderService.createWorkOrder(request));
    }

    @PostMapping("/from-appointment/{appointmentId}")
    public ResponseEntity<WorkOrderDTO> createFromAppointment(
            @PathVariable Long appointmentId,
            Authentication authentication) {
        return ResponseEntity.status(201).body(workOrderService.createFromAppointment(appointmentId, authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WorkOrderDTO> updateStatus(@PathVariable Long id, @RequestParam WorkOrderStatus status) {
        return ResponseEntity.ok(workOrderService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkOrder(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return ResponseEntity.noContent().build();
    }
}
