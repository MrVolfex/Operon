package com.operon.operon.dto;

import com.operon.operon.model.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter@Setter@AllArgsConstructor@NoArgsConstructor
public class AppointmentDTO {
    private Long id;
    private LocalDateTime scheduledAt;
    private AppointmentStatus status;
    private String note;
    private Long clientId;
    private Long vehicleId;
}
