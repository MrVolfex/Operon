package com.operon.operon.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceDTO {
    private Long id;
    private String number;
    private LocalDate issuedAt;
    private Double amount;
    private Boolean isPaid;
    private Long workOrderId;
    private Long clientId;
    private String clientFirstName;
    private String clientLastName;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleLicensePlate;
    private String workOrderDescription;
    private List<OrderItemDTO> items;
}
