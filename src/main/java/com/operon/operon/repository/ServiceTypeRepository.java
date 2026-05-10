package com.operon.operon.repository;

import com.operon.operon.model.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {

    List<ServiceType> findByType(String type);

}
