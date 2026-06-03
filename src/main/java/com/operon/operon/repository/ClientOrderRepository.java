package com.operon.operon.repository;

import com.operon.operon.model.ClientOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClientOrderRepository extends JpaRepository<ClientOrder, Long> {
    List<ClientOrder> findByClient_IdOrderByOrderedAtDesc(Long clientId);
}
