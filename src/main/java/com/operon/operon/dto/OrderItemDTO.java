package com.operon.operon.dto;


import lombok.Data;

@Data
public class OrderItemDTO {
    private Long id;
    private Integer quantity;
    private Double price;
    private Double discount;
    private Long workOrderId;
    private Long partId;
    private Long serviceTypeId;
}