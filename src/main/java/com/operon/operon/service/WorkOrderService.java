package com.operon.operon.service;

import com.operon.operon.dto.WorkOrderCreateRequest;
import com.operon.operon.dto.WorkOrderDTO;
import com.operon.operon.model.Vehicle;
import com.operon.operon.model.WorkOrder;
import com.operon.operon.model.WorkOrderStatus;
import com.operon.operon.model.Worker;
import com.operon.operon.repository.VehicleRepository;
import com.operon.operon.repository.WorkOrderRepository;
import com.operon.operon.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkOrderService {
    private final WorkOrderRepository workOrderRepository;
    private final WorkerRepository workerRepository;
    private final VehicleRepository vehicleRepository;

    public List<WorkOrderDTO> getAllWorkOrder(){
        return workOrderRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public WorkOrderDTO getWorkOrderById(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("WorkOrder not found with id: " + id));
        return toDTO(workOrder);
    }
    public List<WorkOrderDTO> getWorkOrdersByVehicle(Long vehicleId) {
        return workOrderRepository.findByVehicle_Id(vehicleId).stream().map(this::toDTO).collect(Collectors.toList());
    }
    public List<WorkOrderDTO> getWorkOrdersByWorker(Long workerId) {
        return workOrderRepository.findByWorker_Id(workerId).stream().map(this::toDTO).collect(Collectors.toList());
    }
    public List<WorkOrderDTO> getWorkOrdersByStatus(WorkOrderStatus status) {
        return workOrderRepository.findByStatus(status).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public WorkOrderDTO createWorkOrder(WorkOrderCreateRequest request) {
        Worker worker= workerRepository.findById(request.getWorkerId()).orElseThrow(()->new RuntimeException("Worker not found wiht id: "+request.getWorkerId()));
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId()).orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + request.getVehicleId()));

        WorkOrder workOrder = new WorkOrder();
        workOrder.setWorker(worker);
        workOrder.setVehicle(vehicle);

        workOrder.setDescription(request.getDescription());
        workOrder.setOpenedAt(LocalDateTime.now());
        workOrder.setStatus(WorkOrderStatus.PENDING);

        return toDTO(workOrderRepository.save(workOrder));
    }

    public WorkOrderDTO updateStatus(Long id, WorkOrderStatus status){
        WorkOrder workOrder= workOrderRepository.findById(id).orElseThrow(()->new RuntimeException("WorkOrder not found"));
        workOrder.setStatus(status);
        if(status==WorkOrderStatus.COMPLETED || status==WorkOrderStatus.CANCELLED){
            workOrder.setClosedAt(LocalDateTime.now());
        }
        return toDTO(workOrderRepository.save(workOrder));
    }
    public void deleteWorkOrder(Long id) {
        if (!workOrderRepository.existsById(id)) {
            throw new RuntimeException("WorkOrder not found with id: " + id);
        }
        workOrderRepository.deleteById(id);
    }


    private WorkOrderDTO toDTO(WorkOrder workOrder) {
        WorkOrderDTO dto = new WorkOrderDTO();
        dto.setId(workOrder.getId());
        dto.setOpenedAt(workOrder.getOpenedAt());
        dto.setClosedAt(workOrder.getClosedAt());
        dto.setStatus(workOrder.getStatus());

        dto.setDescription(workOrder.getDescription());

        dto.setWorkerId(workOrder.getWorker().getId());

        dto.setVehicleId(workOrder.getVehicle().getId());
        dto.setTotal(workOrder.getTotal());
        return dto;
    }
}
