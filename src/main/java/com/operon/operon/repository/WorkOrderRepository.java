package com.operon.operon.repository;

import com.operon.operon.model.WorkOrder;
import com.operon.operon.model.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    List<WorkOrder> findByVehicle_Id(Long vehicleId);
    List<WorkOrder> findByWorker_Id(Long workerId);

    List<WorkOrder> findByStatus(WorkOrderStatus status);
    List<WorkOrder> findByWorker_IdAndStatus(Long workerId, WorkOrderStatus status);
    List<WorkOrder> findByVehicle_Client_Id(Long clientId);



}
