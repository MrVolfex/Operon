package com.operon.operon.repository;

import com.operon.operon.model.ClientOrderPart;
import com.operon.operon.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClientOrderPartRepository extends JpaRepository<ClientOrderPart, Long> {

    List<ClientOrderPart> findByClient_Id(Long clientId);
    List<ClientOrderPart> findByPart_Id(Long partId);
    List<ClientOrderPart> findByStatus(OrderStatus status);
    List<ClientOrderPart> findByClient_IdAndStatus(Long clientId, OrderStatus status);

}
