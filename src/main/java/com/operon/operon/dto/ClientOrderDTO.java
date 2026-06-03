package com.operon.operon.dto;

import com.operon.operon.model.OrderStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ClientOrderDTO {
    private Long id;
    private Long clientId;
    private LocalDateTime orderedAt;
    private OrderStatus status;
    private List<ClientOrderItemDTO> items;
    private Double total;
    private Boolean isPaid;
}
