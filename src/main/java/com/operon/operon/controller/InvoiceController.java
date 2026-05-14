package com.operon.operon.controller;

import com.operon.operon.dto.InvoiceCreateRequest;
import com.operon.operon.dto.InvoiceDTO;
import com.operon.operon.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<InvoiceDTO> getInvoiceByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByWorkOrder(workOrderId));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByClient(clientId));
    }

    @GetMapping("/unpaid")
    public ResponseEntity<List<InvoiceDTO>> getUnpaidInvoices() {
        return ResponseEntity.ok(invoiceService.getUnpaidInvoices());
    }

    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@Valid @RequestBody InvoiceCreateRequest request) {
        return ResponseEntity.ok(invoiceService.createInvoice(request));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<InvoiceDTO> markInvoiceAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.markInvoiceAsPaid(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
