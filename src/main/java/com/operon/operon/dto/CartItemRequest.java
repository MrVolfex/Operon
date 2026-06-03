package com.operon.operon.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {

    @NotNull
    private Long partId;

    @NotNull
    @Min(1)
    private Integer quantity;
}
