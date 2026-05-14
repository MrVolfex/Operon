package com.operon.operon.security;

import com.operon.operon.repository.WorkerRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class WorkerDetailsService implements UserDetailsService {

    private final WorkerRepository workerRepository;


    public WorkerDetailsService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var worker=workerRepository.findByUsername(username).orElseThrow(()->new UsernameNotFoundException("Worker not found: "+ username));
        return User.builder().username(worker.getUsername()).password(worker.getPassword()).roles(worker.getRole().name()).build();
    }
}
