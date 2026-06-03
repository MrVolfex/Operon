package com.operon.operon.controller;

import com.operon.operon.dto.CartItemRequest;
import com.operon.operon.dto.ClientOrderDTO;
import com.operon.operon.dto.PartDTO;
import com.operon.operon.service.ClientOrderService;
import com.operon.operon.service.PartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client-orders")
@RequiredArgsConstructor
public class ClientOrderController {

    private final ClientOrderService clientOrderService;
    private final PartService partService;

    @GetMapping("/catalog")
    public ResponseEntity<List<PartDTO>> getCatalog() {
        return ResponseEntity.ok(partService.getAllParts());
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<ClientOrderDTO>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(clientOrderService.getOrdersByClient(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<ClientOrderDTO> placeOrder(
            Authentication authentication,
            @Valid @RequestBody List<CartItemRequest> cartItems) {
        return ResponseEntity.status(201).body(clientOrderService.createOrder(authentication.getName(), cartItems));
    }
}
