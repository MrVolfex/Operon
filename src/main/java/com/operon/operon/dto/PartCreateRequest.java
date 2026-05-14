package com.operon.operon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class PartCreateRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String partNumber;

    @NotNull
    @Positive
    private Double price;

    @NotNull
    @PositiveOrZero
    private Integer stockQuantity;

    private String brand;
    private String model;

}
