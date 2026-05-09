package com.operon.operon.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="clients")
@Getter @Setter @NoArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false,  unique = true)
    private String phone;

    @Column(nullable = false,  unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClientType clientType;
}
