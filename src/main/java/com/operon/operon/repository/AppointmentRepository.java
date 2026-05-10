package com.operon.operon.repository;

import com.operon.operon.model.Appointment;
import com.operon.operon.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByClient_Id(Long clientId);
    List<Appointment> findByVehicle_Id(Long vehicleId);
    List<Appointment> findByStatus(AppointmentStatus status);
    List<Appointment> findByClient_IdAndStatus(Long clientId, AppointmentStatus status);

}
