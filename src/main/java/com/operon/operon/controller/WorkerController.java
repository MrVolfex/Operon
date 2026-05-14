package com.operon.operon.controller;

import com.operon.operon.dto.WorkerCreateRequest;
import com.operon.operon.dto.WorkerDTO;
import com.operon.operon.model.Role;
import com.operon.operon.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;

    @GetMapping
    public ResponseEntity<List<WorkerDTO>> getAllWorkers(){
        return ResponseEntity.ok(workerService.getAllWorkers());
    }
    @GetMapping("/{id}")
    public ResponseEntity<WorkerDTO> getWorkerById(@PathVariable Long id){
        return  ResponseEntity.ok(workerService.getWorkerById(id));
    }
    @PostMapping
    public ResponseEntity<WorkerDTO> createWorker(@RequestBody @Valid WorkerCreateRequest request){
        return ResponseEntity.status(201).body(workerService.createWorker(request));
    }
    @PutMapping("/{id}")
    public ResponseEntity<WorkerDTO> updateWorker(@PathVariable Long id, @RequestBody @Valid WorkerCreateRequest request){
        return ResponseEntity.ok(workerService.UpdateWorker(id,request));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateWorker(@PathVariable Long id) {
        workerService.deactivateWorker(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/role/{role}")
    public ResponseEntity<List<WorkerDTO>> getWorkersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(workerService.getWorkersByRole(role));
    }

}
