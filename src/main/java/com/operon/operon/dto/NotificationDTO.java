package com.operon.operon.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String content;
    private LocalDateTime sentAt;
    private Boolean isDelivered;
    private Long clientId;
}
