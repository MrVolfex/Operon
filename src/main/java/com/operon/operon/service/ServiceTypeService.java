package com.operon.operon.service;

import com.operon.operon.dto.ServiceTypeCreateRequest;
import com.operon.operon.dto.ServiceTypeDTO;
import com.operon.operon.model.ServiceType;
import com.operon.operon.repository.ServiceTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceTypeService {

    private final ServiceTypeRepository serviceTypeRepository;

    public List<ServiceTypeDTO> getAllServiceTypes() {
        return serviceTypeRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ServiceTypeDTO getServiceTypeById(Long id) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ServiceType not found with id: " + id));
        return toDTO(serviceType);
    }

    public List<ServiceTypeDTO> getServiceTypesByType(String type) {
        return serviceTypeRepository.findByType(type)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ServiceTypeDTO createServiceType(ServiceTypeCreateRequest request) {
        ServiceType serviceType = new ServiceType();
        serviceType.setType(request.getType());
        serviceType.setPrice(request.getPrice());
        serviceType.setDuration(request.getDuration());
        return toDTO(serviceTypeRepository.save(serviceType));
    }

    public ServiceTypeDTO updateServiceType(Long id, ServiceTypeCreateRequest request) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ServiceType not found with id: " + id));
        serviceType.setType(request.getType());
        serviceType.setPrice(request.getPrice());
        serviceType.setDuration(request.getDuration());
        return toDTO(serviceTypeRepository.save(serviceType));
    }

    public void deleteServiceType(Long id) {
        if (!serviceTypeRepository.existsById(id)) {
            throw new RuntimeException("ServiceType not found with id: " + id);
        }
        serviceTypeRepository.deleteById(id);
    }

    private ServiceTypeDTO toDTO(ServiceType serviceType) {
        ServiceTypeDTO dto = new ServiceTypeDTO();
        dto.setId(serviceType.getId());
        dto.setType(serviceType.getType());
        dto.setPrice(serviceType.getPrice());
        dto.setDuration(serviceType.getDuration());
        return dto;
    }
}
