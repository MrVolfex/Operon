package com.operon.operon.dto;

import com.operon.operon.model.WorkOrderStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkOrderDTO {
    private Long id;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private WorkOrderStatus status;
    private String description;
    private Long workerId;
    private Long vehicleId;
    private Double total;


    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleLicensePlate;

    private Long appointmentId;
    private String clientFirstName;
    private String clientLastName;
}
