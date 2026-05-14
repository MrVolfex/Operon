package com.operon.operon.dto;

import com.operon.operon.model.ClientType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter@Getter@AllArgsConstructor@NoArgsConstructor
public class ClientDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String phone;
    private String email;
    private ClientType clientType;
}
