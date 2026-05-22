package com.operon.operon.dto;

import lombok.Data;

@Data
public class ClientOrderItemDTO {
    private Long id;
    private Long partId;
    private String partName;
    private String partNumber;
    private String partBrand;
    private Integer quantity;
    private Double unitPrice;
}
