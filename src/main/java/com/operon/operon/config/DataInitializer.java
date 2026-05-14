package com.operon.operon.config;

import com.operon.operon.model.Worker;
import com.operon.operon.model.Role;
import com.operon.operon.repository.WorkerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner insertTestData(WorkerRepository workerRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (workerRepository.findByUsername("owner1").isEmpty()) {
                Worker worker = new Worker();
                worker.setFirstName("Test");
                worker.setLastName("Owner");
                worker.setEmail("owner1@operon.com");
                worker.setPhone("+38761000001");
                worker.setUsername("owner1");
                worker.setPassword(passwordEncoder.encode("test123"));
                worker.setRole(Role.OWNER);
                workerRepository.save(worker);
                System.out.println("Test worker inserted: owner1 / test123");
            }
        };
    }
}
