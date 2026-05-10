package com.operon.operon.repository;

import com.operon.operon.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByVin(String vin);
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    boolean existsByVin(String vin);
    boolean existsByLicensePlate(String licensePlate);
    List<Vehicle> findByClient_Id(Long clientId);
}
