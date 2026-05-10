package com.operon.operon.repository;

import com.operon.operon.model.Client;
import com.operon.operon.model.ClientType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client,Long> {

    Optional<Client> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<Client> findByClientType(ClientType clientType);

}
