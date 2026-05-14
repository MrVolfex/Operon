package com.operon.operon.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Setter@Getter@RequiredArgsConstructor@AllArgsConstructor
public class PartDTO {
    private Long id;
    private String name;
    private String partNumber;
    private Double price;
    private Integer stockQuantity;
    private String brand;
    private String model;
}

