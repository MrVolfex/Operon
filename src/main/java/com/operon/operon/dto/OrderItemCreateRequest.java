package com.operon.operon.dto;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemCreateRequest {

    @NotNull
    private Long workOrderId;

    @NotNull
    @Min(1)
    private Integer quantity;

    private Double discount;

    // Jedan od ova dva mora biti popunjen, druginull
    private Long partId;
    private Long serviceTypeId;
}
