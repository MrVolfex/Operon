package com.operon.operon.repository;

import com.operon.operon.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByWorkOrder_Id(Long workOrderId);
    List<OrderItem> findByPart_Id(Long partId);
    List<OrderItem> findByServiceType_Id(Long serviceTypeId);

}
