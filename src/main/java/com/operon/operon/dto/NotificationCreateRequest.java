package com.operon.operon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationCreateRequest {

    @NotNull
    private Long clientId;

    @NotBlank
    private String content;
}
