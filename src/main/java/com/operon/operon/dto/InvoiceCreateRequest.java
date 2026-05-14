package com.operon.operon.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InvoiceCreateRequest {

    @NotNull
    private Long workOrderId;

    @NotNull
    private Long clientId;
}
