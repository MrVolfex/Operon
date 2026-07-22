package com.operon.operon.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ClientProfileUpdateRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String phone;
    private String email;
    private String password;
    private String address;
    private String city;
    private String postalCode;
    private String companyName;
    private String pib;
}
