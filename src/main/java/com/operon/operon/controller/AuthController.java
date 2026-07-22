package com.operon.operon.controller;

import com.operon.operon.dto.ClientDTO;
import com.operon.operon.dto.LoginRequest;
import com.operon.operon.dto.LoginResponse;
import com.operon.operon.security.ClientDetailsService;
import com.operon.operon.security.JwtUtil;
import com.operon.operon.security.WorkerDetailsService;
import com.operon.operon.service.ClientService;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager workerAuthManager;
    private final AuthenticationManager clientAuthManager;
    private final JwtUtil jwtUtil;
    private final ClientService clientService;

    public AuthController(WorkerDetailsService workerDetailsService,
                          ClientDetailsService clientDetailsService,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          ClientService clientService) {

        DaoAuthenticationProvider workerProvider = new DaoAuthenticationProvider(workerDetailsService);
        workerProvider.setPasswordEncoder(passwordEncoder);
        this.workerAuthManager = new ProviderManager(workerProvider);

        DaoAuthenticationProvider clientProvider = new DaoAuthenticationProvider(clientDetailsService);
        clientProvider.setPasswordEncoder(passwordEncoder);
        this.clientAuthManager = new ProviderManager(clientProvider);

        this.jwtUtil = jwtUtil;
        this.clientService = clientService;
    }

    @PostMapping("/worker/login")
    public ResponseEntity<LoginResponse> workerLogin(@RequestBody LoginRequest request) {
        var auth = workerAuthManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        String token = jwtUtil.generateToken(request.getUsername());
        String role = auth.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(new LoginResponse(token, role));
    }


    @PostMapping("/client/login")
    public ResponseEntity<LoginResponse> clientLogin(@RequestBody LoginRequest request) {
        var auth = clientAuthManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        String token = jwtUtil.generateToken(request.getUsername());
        String role = auth.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(new LoginResponse(token, role));
    }

    @PostMapping("/client/google")
    public ResponseEntity<LoginResponse> googleClientLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        Map<String, String> info;
        try {
            info = RestClient.create()
                    .get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Invalid Google token");
        }
        String email = info != null ? info.get("email") : null;
        if (email == null) throw new RuntimeException("Invalid Google token");

        ClientDTO client = clientService.findOrCreateGoogleClient(
                email,
                info.get("given_name"),
                info.get("family_name"),
                info.get("picture")
        );
        String token = jwtUtil.generateToken(client.getUsername());
        return ResponseEntity.ok(new LoginResponse(token, "ROLE_CLIENT"));
    }

}
