package com.operon.operon.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class InvoiceDTO {
    private Long id;
    private String number;
    private LocalDate issuedAt;
    private Double amount;
    private Boolean isPaid;
    private Long workOrderId;
    private Long clientId;
}
