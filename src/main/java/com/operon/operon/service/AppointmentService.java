package com.operon.operon.service;

import com.operon.operon.dto.AppointmentCreateRequest;
import com.operon.operon.dto.AppointmentDTO;
import com.operon.operon.model.Appointment;
import com.operon.operon.model.AppointmentStatus;
import com.operon.operon.model.Client;
import com.operon.operon.model.Vehicle;
import com.operon.operon.repository.AppointmentRepository;
import com.operon.operon.repository.ClientRepository;
import com.operon.operon.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final ClientRepository clientRepository;
    private final VehicleRepository vehicleRepository;

    public List<AppointmentDTO> getAllAppointments(){
        return appointmentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        return toDTO(appointment);
    }
    public List<AppointmentDTO> getAppointmentsByClientId(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new RuntimeException("Client not found with id: " + clientId);
        }
        return appointmentRepository.findByClient_Id(clientId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByVehicleId(Long vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new RuntimeException("Vehicle not found with id: " + vehicleId);
        }
        return appointmentRepository.findByVehicle_Id(vehicleId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByClientIdAndStatus(Long clientId, AppointmentStatus status) {
        if (!clientRepository.existsById(clientId)) {
            throw new RuntimeException("Client not found with id: " + clientId);
        }
        return appointmentRepository.findByClient_IdAndStatus(clientId, status).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AppointmentDTO createAppointment(AppointmentCreateRequest request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + request.getVehicleId()));

        Appointment appointment = new Appointment();
        appointment.setScheduledAt(request.getScheduledAt());
        appointment.setStatus(request.getStatus() != null ? request.getStatus() : AppointmentStatus.PENDING);
        appointment.setNote(request.getNote());
        appointment.setClient(client);
        appointment.setVehicle(vehicle);

        appointmentRepository.save(appointment);
        return toDTO(appointment);
    }

    public AppointmentDTO updateAppointment(Long id, AppointmentCreateRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + request.getVehicleId()));

        appointment.setScheduledAt(request.getScheduledAt());
        appointment.setStatus(request.getStatus() != null ? request.getStatus() : appointment.getStatus());
        appointment.setNote(request.getNote());
        appointment.setClient(client);
        appointment.setVehicle(vehicle);

        appointmentRepository.save(appointment);
        return toDTO(appointment);
    }

    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    private AppointmentDTO toDTO(Appointment appointment) {
        return new AppointmentDTO(
                appointment.getId(),
                appointment.getScheduledAt(),
                appointment.getStatus(),
                appointment.getNote(),
                appointment.getClient().getId(),
                appointment.getVehicle().getId()
        );
    }
}
