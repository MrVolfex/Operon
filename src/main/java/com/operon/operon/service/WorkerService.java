package com.operon.operon.service;

import com.operon.operon.dto.WorkerCreateRequest;
import com.operon.operon.dto.WorkerDTO;
import com.operon.operon.model.Role;
import com.operon.operon.model.Worker;
import com.operon.operon.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final PasswordEncoder passwordEncoder;


    public List<WorkerDTO> getAllWorkers(){
        return workerRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    private WorkerDTO toDTO(Worker worker) {
        return new WorkerDTO(
                worker.getId(),
                worker.getFirstName(),
                worker.getLastName(),
                worker.getEmail(),
                worker.getUsername(),
                worker.getPhone(),
                worker.getRole(),
                worker.getIsActive()
        );
    }

    public WorkerDTO getWorkerById(Long id){
        Worker worker= workerRepository.findById(id).orElseThrow(()-> new UsernameNotFoundException("Worker not found wiht id: "+ id));
        return toDTO(worker);
    }

    public WorkerDTO createWorker (WorkerCreateRequest request){
        if(workerRepository.existsByUsername(request.getUsername())){
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }
        if (workerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }
        Worker worker= new Worker();
        worker.setFirstName(request.getFirstName());
        worker.setLastName(request.getLastName());
        worker.setEmail(request.getEmail());
        worker.setUsername(request.getUsername());
        worker.setPassword(passwordEncoder.encode(request.getPassword()));
        worker.setPhone(request.getPhone());
        worker.setRole(request.getRole());
        worker.setIsActive(true);

        workerRepository.save(worker);
        return toDTO(worker);
    }

    public WorkerDTO UpdateWorker(Long id,WorkerCreateRequest request){
        Worker worker = workerRepository.findById(id).orElseThrow(()->new UsernameNotFoundException("User with:"+id+", not found"));
        worker.setFirstName(request.getFirstName());
        worker.setLastName(request.getLastName());
        worker.setEmail(request.getEmail());
        worker.setUsername(request.getUsername());
        worker.setPhone(request.getPhone());
        worker.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            worker.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        workerRepository.save(worker);
        return toDTO(worker);
    }
    //Soft deleting ili logicno brisanje
    public void deactivateWorker(Long id){
        Worker worker = workerRepository.findById(id).orElseThrow(()->new UsernameNotFoundException("User with:"+id+", not found"));
        worker.setIsActive(false);
        workerRepository.save(worker);
    }

    public List<WorkerDTO> getWorkersByRole(Role role) {
        return workerRepository.findByRole(role)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }




}
