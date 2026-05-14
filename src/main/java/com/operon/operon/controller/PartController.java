package com.operon.operon.controller;

import com.operon.operon.dto.PartCreateRequest;
import com.operon.operon.dto.PartDTO;
import com.operon.operon.service.PartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/parts")
public class PartController {
    private final PartService partService;


    @GetMapping
    public ResponseEntity<List<PartDTO>> getAllParts(){
        return ResponseEntity.ok(partService.getAllParts());
    }
    @GetMapping("/{id}")
    public ResponseEntity<PartDTO> getPartById(@PathVariable Long id){
        return ResponseEntity.ok(partService.getPartById(id));
    }
    @GetMapping("/part-number/{partNumber}")
    public ResponseEntity<PartDTO> getPartByPartNumber(@PathVariable String partNumber){
        return ResponseEntity.ok(partService.getPartByPartNumber(partNumber));
    }
    @GetMapping("/brand/{brand}")
    public ResponseEntity<List<PartDTO>> getPartsByBrand(@PathVariable String brand) {
        return ResponseEntity.ok(partService.getPartsByBrand(brand));
    }
    @GetMapping("/low-stock")
    public ResponseEntity<List<PartDTO>> getLowStockParts(@RequestParam(defaultValue = "2") Integer threshold) {
        return ResponseEntity.ok(partService.getLowStockParts(threshold));
    }
    @PostMapping
    public ResponseEntity<PartDTO> createPart(@RequestBody @Valid PartCreateRequest request){
        return ResponseEntity.status(201).body(partService.createPart(request));
    }
    @PutMapping("/{id}")
    public ResponseEntity<PartDTO> updatePart(@PathVariable Long id, @RequestBody @Valid PartCreateRequest request) {
        return ResponseEntity.ok(partService.updatePart(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        partService.deletePart(id);
        return ResponseEntity.noContent().build();
    }
}
