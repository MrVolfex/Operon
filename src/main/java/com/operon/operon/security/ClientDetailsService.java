package com.operon.operon.security;

import com.operon.operon.model.Client;
import com.operon.operon.repository.ClientRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ClientDetailsService implements UserDetailsService {

    private final ClientRepository clientRepository;

    public ClientDetailsService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Client client = clientRepository.findByUsername(username)
                .or(() -> clientRepository.findByEmailIgnoreCase(username))
                .orElseThrow(() -> new UsernameNotFoundException("Client not found: " + username));
        return User.builder().username(client.getUsername()).password(client.getPassword()).roles("CLIENT").build();
    }
}
