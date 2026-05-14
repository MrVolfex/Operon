package com.operon.operon.dto;

import com.operon.operon.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentCreateRequest {
    @NotNull
    private LocalDateTime scheduledAt;

    private AppointmentStatus status;

    private String note;

    @NotNull
    private Long clientId;

    @NotNull
    private Long vehicleId;
}
