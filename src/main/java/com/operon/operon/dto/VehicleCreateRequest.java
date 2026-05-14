package com.operon.operon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class VehicleCreateRequest {

    @NotBlank
    private String licensePlate;

    @NotBlank
    private String vin;

    @NotBlank
    private String brand;

    @NotBlank
    private String model;

    @NotNull @Positive
    private Integer year;

    @NotNull @Positive
    private Integer mileage;

    @NotNull
    private LocalDate registrationDate;

    @NotNull
    private LocalDate registrationExpiry;

    @NotNull
    private Long clientId;
}
