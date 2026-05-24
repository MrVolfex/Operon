package com.operon.operon.controller;

import com.operon.operon.dto.WorkOrderDTO;
import com.operon.operon.service.ClientService;
import com.operon.operon.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/my-work-orders")
@RequiredArgsConstructor
public class ClientWorkOrderController {

    private final WorkOrderService workOrderService;
    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<List<WorkOrderDTO>> getMyWorkOrders(Authentication authentication) {
        Long clientId = clientService.getClientByUsername(authentication.getName()).getId();
        return ResponseEntity.ok(workOrderService.getWorkOrdersByClient(clientId));
    }
}
