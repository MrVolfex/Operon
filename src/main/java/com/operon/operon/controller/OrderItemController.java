package com.operon.operon.controller;

import com.operon.operon.dto.OrderItemCreateRequest;
import com.operon.operon.dto.OrderItemDTO;
import com.operon.operon.service.OrderItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
@RequiredArgsConstructor
public class OrderItemController {

    private final OrderItemService orderItemService;

    @GetMapping
    public ResponseEntity<List<OrderItemDTO>> getAll() {
        return ResponseEntity.ok(orderItemService.getAllOrderItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItemDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderItemService.getById(id));
    }

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<OrderItemDTO>> getByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(orderItemService.getByWorkOrder(workOrderId));
    }

    @GetMapping("/part/{partId}")
    public ResponseEntity<List<OrderItemDTO>> getByPart(@PathVariable Long partId) {
        return ResponseEntity.ok(orderItemService.getByPart(partId));
    }

    @PostMapping
    public ResponseEntity<OrderItemDTO> createOrderItem(@Valid @RequestBody OrderItemCreateRequest request) {
        return ResponseEntity.ok(orderItemService.createOrderItem(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderItem(@PathVariable Long id) {
        orderItemService.deleteOrderItem(id);
        return ResponseEntity.noContent().build();
    }
}
