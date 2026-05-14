package com.operon.operon.service;

import com.operon.operon.dto.InvoiceCreateRequest;
import com.operon.operon.dto.InvoiceDTO;
import com.operon.operon.model.Client;
import com.operon.operon.model.Invoice;
import com.operon.operon.model.WorkOrder;
import com.operon.operon.repository.ClientRepository;
import com.operon.operon.repository.InvoiceRepository;
import com.operon.operon.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final WorkOrderRepository workOrderRepository;
    private final ClientRepository clientRepository;

    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public InvoiceDTO getInvoiceById(Long id) {
        return toDTO(invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id)));
    }

    public InvoiceDTO getInvoiceByWorkOrder(Long workOrderId) {
        return toDTO(invoiceRepository.findByWorkOrder_Id(workOrderId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for workOrderId: " + workOrderId)));
    }

    public List<InvoiceDTO> getInvoicesByClient(Long clientId) {
        return invoiceRepository.findByClient_Id(clientId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<InvoiceDTO> getUnpaidInvoices() {
        return invoiceRepository.findByIsPaid(false).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public InvoiceDTO createInvoice(InvoiceCreateRequest request) {
        WorkOrder workOrder = workOrderRepository.findById(request.getWorkOrderId())
                .orElseThrow(() -> new RuntimeException("WorkOrder not found with id: " + request.getWorkOrderId()));

        if (invoiceRepository.findByWorkOrder_Id(workOrder.getId()).isPresent()) {
            throw new IllegalStateException("Invoice for this WorkOrder already exists.");
        }

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));

        Invoice invoice = new Invoice();
        invoice.setWorkOrder(workOrder);
        invoice.setClient(client);
        invoice.setIssuedAt(LocalDate.now());
        invoice.setAmount(workOrder.getTotal());
        invoice.setIsPaid(false);
        invoice.setNumber(generateNumber());

        return toDTO(invoiceRepository.save(invoice));
    }

    public InvoiceDTO markInvoiceAsPaid(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        invoice.setIsPaid(true);
        return toDTO(invoiceRepository.save(invoice));
    }

    public void deleteInvoice(Long id) {
        if (!invoiceRepository.existsById(id)) {
            throw new RuntimeException("Invoice not found with id: " + id);
        }
        invoiceRepository.deleteById(id);
    }

    private String generateNumber() {
        long count = invoiceRepository.count() + 1;
        return String.format("INV-%05d", count);
    }

    private InvoiceDTO toDTO(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(invoice.getId());
        dto.setNumber(invoice.getNumber());
        dto.setIssuedAt(invoice.getIssuedAt());
        dto.setAmount(invoice.getAmount());
        dto.setIsPaid(invoice.getIsPaid());
        dto.setWorkOrderId(invoice.getWorkOrder().getId());
        dto.setClientId(invoice.getClient().getId());
        return dto;
    }
}
