package com.operon.operon.service;

import com.operon.operon.dto.PartCreateRequest;
import com.operon.operon.dto.PartDTO;
import com.operon.operon.model.Part;
import com.operon.operon.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartService {

    private final PartRepository partRepository;

    public List<PartDTO> getAllParts(){
        return partRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PartDTO getPartById(Long id){
        return toDTO(partRepository.findById(id).orElseThrow(()-> new RuntimeException("Part with id: "+id+" doesn't exists")));
    }

    public PartDTO createPart(PartCreateRequest request ){
        if (partRepository.existsByPartNumber(request.getPartNumber())) {
            throw new RuntimeException("Part with partNumber already exists: " + request.getPartNumber());
        }
        Part part=new Part();
        part.setName(request.getName());
        part.setPartNumber(request.getPartNumber());
        part.setPrice(request.getPrice());
        part.setStockQuantity(request.getStockQuantity());
        part.setBrand(request.getBrand());
        part.setModel(request.getModel());

        partRepository.save(part);
        return toDTO(part);
    }
    public PartDTO updatePart(Long id, PartCreateRequest request ){
        Part part = partRepository.findById(id).orElseThrow(() -> new RuntimeException("Part not found with id: " + id));
        part.setName(request.getName());
        part.setPartNumber(request.getPartNumber());
        part.setPrice(request.getPrice());
        part.setStockQuantity(request.getStockQuantity());
        part.setBrand(request.getBrand());
        part.setModel(request.getModel());

        partRepository.save(part);
        return toDTO(part);
    }

    public void deletePart(Long id) {
        if (!partRepository.existsById(id)) {
            throw new RuntimeException("Part not found with id: " + id);
        }
        partRepository.deleteById(id);
    }
    public List<PartDTO> getLowStockParts(Integer threshold) {
        return partRepository.findByStockQuantityLessThan(threshold).stream().map(this::toDTO).collect(Collectors.toList());
    }


    public List<PartDTO> getPartsByBrand(String brand) {
        return partRepository.findByBrand(brand)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PartDTO getPartByPartNumber(String partNumber) {
        Part part = partRepository.findByPartNumber(partNumber)
                .orElseThrow(() -> new RuntimeException("Part not found with partNumber: " + partNumber));
        return toDTO(part);
    }

    public PartDTO toDTO(Part part){
        PartDTO dto = new PartDTO();
        dto.setId(part.getId());
        dto.setName(part.getName());
        dto.setPartNumber(part.getPartNumber());
        dto.setPrice(part.getPrice());
        dto.setStockQuantity(part.getStockQuantity());
        dto.setBrand(part.getBrand());
        dto.setModel(part.getModel());
        return dto;
    }
}


