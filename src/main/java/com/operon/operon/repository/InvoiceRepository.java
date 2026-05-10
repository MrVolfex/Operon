package com.operon.operon.repository;

import com.operon.operon.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByNumber(String number);
    Optional<Invoice> findByWorkOrder_Id(Long workOrderId);
    List<Invoice> findByClient_Id(Long clientId);
    List<Invoice> findByIsPaid(Boolean isPaid);
    List<Invoice> findByClient_IdAndIsPaid(Long clientId, Boolean isPaid);

}
