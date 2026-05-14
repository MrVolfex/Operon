package com.operon.operon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ServiceTypeCreateRequest {

    @NotBlank
    private String type;

    @NotNull
    @Positive
    private Double price;

    @NotNull
    @Positive
    private Integer duration;
}
