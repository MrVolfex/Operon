package com.operon.operon.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Getter @Setter @NoArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String number;

    @Column(nullable = false)
    private LocalDate issuedAt = LocalDate.now();

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Boolean isPaid = false;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_work_order", nullable = false, unique = true)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_client", nullable = false)
    private Client client;
}
