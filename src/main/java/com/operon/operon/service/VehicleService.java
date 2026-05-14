package com.operon.operon.service;

import com.operon.operon.dto.VehicleCreateRequest;
import com.operon.operon.dto.VehicleDTO;
import com.operon.operon.model.Client;
import com.operon.operon.model.Vehicle;
import com.operon.operon.repository.ClientRepository;
import com.operon.operon.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ClientRepository clientRepository;

    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public VehicleDTO getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        return toDTO(vehicle);
    }

    public VehicleDTO getVehicleByVin(String vin) {
        Vehicle vehicle = vehicleRepository.findByVin(vin)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with VIN: " + vin));
        return toDTO(vehicle);
    }

    public List<VehicleDTO> getVehiclesByClientId(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new RuntimeException("Client not found with id: " + clientId);
        }
        return vehicleRepository.findByClient_Id(clientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public VehicleDTO createVehicle(VehicleCreateRequest request) {
        if (vehicleRepository.existsByVin(request.getVin())) {
            throw new RuntimeException("Vehicle with VIN already exists: " + request.getVin());
        }
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new RuntimeException("Vehicle with license plate already exists: " + request.getLicensePlate());
        }

        Client client = clientRepository.findById(request.getClientId()).orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));

        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setVin(request.getVin());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setMileage(request.getMileage());
        vehicle.setRegistrationDate(request.getRegistrationDate());
        vehicle.setRegistrationExpiry(request.getRegistrationExpiry());
        vehicle.setClient(client);

        vehicleRepository.save(vehicle);
        return toDTO(vehicle);
    }

    public VehicleDTO updateVehicle(Long id, VehicleCreateRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));

        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setVin(request.getVin());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setMileage(request.getMileage());
        vehicle.setRegistrationDate(request.getRegistrationDate());
        vehicle.setRegistrationExpiry(request.getRegistrationExpiry());
        vehicle.setClient(client);

        vehicleRepository.save(vehicle);
        return toDTO(vehicle);
    }

    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found with id: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    private VehicleDTO toDTO(Vehicle vehicle) {
        return new VehicleDTO(
                vehicle.getId(),
                vehicle.getLicensePlate(),
                vehicle.getVin(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getMileage(),
                vehicle.getRegistrationDate(),
                vehicle.getRegistrationExpiry(),
                vehicle.getClient().getId()
        );
    }
}
