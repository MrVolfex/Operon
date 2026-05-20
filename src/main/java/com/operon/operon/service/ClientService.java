package com.operon.operon.service;

import com.operon.operon.dto.ClientCreateRequest;
import com.operon.operon.dto.ClientDTO;
import com.operon.operon.model.Client;
import com.operon.operon.model.ClientType;
import com.operon.operon.model.Worker;
import com.operon.operon.repository.ClientRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    public List<ClientDTO> getAllClients (){
        return clientRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ClientDTO toDTO(Client client){
        return new ClientDTO(
                client.getId(),
                client.getFirstName(),
                client.getLastName(),
                client.getUsername(),
                client.getPhone(),
                client.getEmail(),
                client.getClientType()
        );
    }

    public ClientDTO getClientByID(Long id){
        Client client= clientRepository.findById(id).orElseThrow(()-> new RuntimeException("User with id: "+id+" not found"));
        return toDTO(client);
    }

    public ClientDTO getClientByUsername(String username){
        Client client= clientRepository.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException("Username not found"));
        return toDTO(client);
    }

    public ClientDTO createClient(ClientCreateRequest request){
        if(clientRepository.existsByUsername(request.getUsername())){
            throw new RuntimeException("User already exists "+ request.getUsername());
        }
        if(clientRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("User already exists "+ request.getEmail());
        }
        Client client = new Client();
        client.setFirstName(request.getFirstName());
        client.setLastName(request.getLastName());
        client.setUsername(request.getUsername());
        client.setPassword(passwordEncoder.encode(request.getPassword()));
        client.setPhone(request.getPhone());
        client.setEmail(request.getEmail());
        client.setClientType(request.getClientType());

        clientRepository.save(client);
        return toDTO(client);
    }
    public ClientDTO updateClient(Long id, ClientCreateRequest request) {

        Client client = clientRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User with:" + id + ", not found"));
        client.setFirstName(request.getFirstName());
        client.setLastName(request.getLastName());
        client.setUsername(request.getUsername());
        client.setPhone(request.getPhone());
        client.setEmail(request.getEmail());
        client.setClientType(request.getClientType());

        if(request.getPassword()!=null && !request.getPassword().isBlank()){
            client.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        clientRepository.save(client);
        return toDTO(client);

    }
    public void deleteClient(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
    }
    public List<ClientDTO> getClientsByType(ClientType clientType) {
        return clientRepository.findByClientType(clientType).stream().map(this::toDTO).collect(Collectors.toList());
    }




}
