package com.operon.operon.dto;

import lombok.Data;

@Data
public class ServiceTypeDTO {
    private Long id;
    private String type;
    private Double price;
    private Integer duration;
}
