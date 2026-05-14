package com.operon.operon.dto;

import com.operon.operon.model.OrderStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ClientOrderPartDTO {
    private Long id;
    private Integer quantity;
    private Double unitPrice;
    private LocalDateTime orderedAt;
    private OrderStatus status;
    private Long clientId;
    private Long partId;
}
