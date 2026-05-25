package com.operon.operon.service;

import com.operon.operon.dto.WorkOrderCreateRequest;
import com.operon.operon.dto.WorkOrderDTO;
import com.operon.operon.model.*;
import com.operon.operon.repository.AppointmentRepository;
import com.operon.operon.repository.InvoiceRepository;
import com.operon.operon.repository.NotificationRepository;
import com.operon.operon.repository.VehicleRepository;
import com.operon.operon.repository.WorkOrderRepository;
import com.operon.operon.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkOrderService {
    private final WorkOrderRepository workOrderRepository;
    private final WorkerRepository workerRepository;
    private final VehicleRepository vehicleRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;

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

    public WorkOrderDTO createFromAppointment(Long appointmentId, String workerUsername) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + appointmentId));
        Worker worker = workerRepository.findByUsername(workerUsername)
                .orElseThrow(() -> new RuntimeException("Worker not found: " + workerUsername));

        WorkOrder workOrder = new WorkOrder();
        workOrder.setAppointment(appointment);
        workOrder.setVehicle(appointment.getVehicle());
        workOrder.setWorker(worker);
        workOrder.setOpenedAt(LocalDateTime.now());
        workOrder.setStatus(WorkOrderStatus.OPEN);
        workOrder.setDescription(appointment.getNote());

        return toDTO(workOrderRepository.save(workOrder));
    }

    @Transactional
    public WorkOrderDTO updateStatus(Long id, WorkOrderStatus status){
        WorkOrder workOrder= workOrderRepository.findById(id).orElseThrow(()->new RuntimeException("WorkOrder not found"));
        workOrder.setStatus(status);
        if(status==WorkOrderStatus.COMPLETED || status==WorkOrderStatus.CANCELLED){
            workOrder.setClosedAt(LocalDateTime.now());
        }
        WorkOrder saved = workOrderRepository.save(workOrder);
        Client client = saved.getVehicle().getClient();

        if (status == WorkOrderStatus.COMPLETED && invoiceRepository.findByWorkOrder_Id(saved.getId()).isEmpty()) {
            Invoice invoice = new Invoice();
            invoice.setWorkOrder(saved);
            invoice.setClient(client);
            invoice.setIssuedAt(LocalDate.now());
            invoice.setAmount(saved.getTotal());
            invoice.setIsPaid(false);
            long count = invoiceRepository.count() + 1;
            invoice.setNumber(String.format("INV-%05d", count));
            invoiceRepository.save(invoice);
        }

        String statusLabel = switch (status) {
            case OPEN        -> "opened";
            case IN_PROGRESS -> "in progress";
            case COMPLETED   -> "completed";
            case CANCELLED   -> "cancelled";
            default          -> status.name().toLowerCase();
        };
        Notification notification = new Notification();
        notification.setClient(client);
        notification.setContent("Work order #" + saved.getId() + " for your " +
                saved.getVehicle().getBrand() + " " + saved.getVehicle().getModel() +
                " is now " + statusLabel + ".");
        notification.setSentAt(LocalDateTime.now());
        notification.setIsDelivered(false);
        notificationRepository.save(notification);

        return toDTO(saved);
    }
    public void deleteWorkOrder(Long id) {
        if (!workOrderRepository.existsById(id)) {
            throw new RuntimeException("WorkOrder not found with id: " + id);
        }
        workOrderRepository.deleteById(id);
    }
    public List<WorkOrderDTO> getWorkOrdersByClient(Long clientId) {
        return workOrderRepository.findByVehicle_Client_Id(clientId)
                .stream().map(this::toDTO).collect(Collectors.toList());
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
        dto.setVehicleBrand(workOrder.getVehicle().getBrand());
        dto.setVehicleModel(workOrder.getVehicle().getModel());
        dto.setVehicleLicensePlate(workOrder.getVehicle().getLicensePlate());
        dto.setTotal(workOrder.getTotal());
        if (workOrder.getAppointment() != null) {
            dto.setAppointmentId(workOrder.getAppointment().getId());
            dto.setClientFirstName(workOrder.getAppointment().getClient().getFirstName());
            dto.setClientLastName(workOrder.getAppointment().getClient().getLastName());
        }
        return dto;
    }
}
