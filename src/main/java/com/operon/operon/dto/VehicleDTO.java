package com.operon.operon.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class VehicleDTO {
    private Long id;
    private String licensePlate;
    private String vin;
    private String brand;
    private String model;
    private Integer year;
    private Integer mileage;
    private LocalDate registrationDate;
    private LocalDate registrationExpiry;
    private Long clientId;
}
