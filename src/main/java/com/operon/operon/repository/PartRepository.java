package com.operon.operon.repository;

import com.operon.operon.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, Long> {

    Optional<Part> findByPartNumber(String partNumber);
    boolean existsByPartNumber(String partNumber);
    List<Part> findByBrand(String brand);
    List<Part> findByStockQuantityLessThan(Integer threshold);

}
