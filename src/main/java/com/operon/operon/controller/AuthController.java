package com.operon.operon.controller;

import com.operon.operon.dto.LoginRequest;
import com.operon.operon.dto.LoginResponse;
import com.operon.operon.security.ClientDetailsService;
import com.operon.operon.security.JwtUtil;
import com.operon.operon.security.WorkerDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager workerAuthManager;
    private final AuthenticationManager clientAuthManager;
    private final JwtUtil jwtUtil;

    public AuthController(WorkerDetailsService workerDetailsService,
                          ClientDetailsService clientDetailsService,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {

        DaoAuthenticationProvider workerProvider = new DaoAuthenticationProvider(workerDetailsService);
        workerProvider.setPasswordEncoder(passwordEncoder);
        this.workerAuthManager = new ProviderManager(workerProvider);

        DaoAuthenticationProvider clientProvider = new DaoAuthenticationProvider(clientDetailsService);
        clientProvider.setPasswordEncoder(passwordEncoder);
        this.clientAuthManager = new ProviderManager(clientProvider);

        this.jwtUtil = jwtUtil;
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

}
