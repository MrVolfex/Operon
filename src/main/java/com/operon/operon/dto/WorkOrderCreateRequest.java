package com.operon.operon.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkOrderCreateRequest {
    @NotNull
    private Long workerId;

    @NotNull
    private Long vehicleId;

    private String description;
}
