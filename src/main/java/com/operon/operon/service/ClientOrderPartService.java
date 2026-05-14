package com.operon.operon.service;

import com.operon.operon.dto.ClientOrderPartCreateRequest;
import com.operon.operon.dto.ClientOrderPartDTO;
import com.operon.operon.model.Client;
import com.operon.operon.model.ClientOrderPart;
import com.operon.operon.model.OrderStatus;
import com.operon.operon.model.Part;
import com.operon.operon.repository.ClientOrderPartRepository;
import com.operon.operon.repository.ClientRepository;
import com.operon.operon.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientOrderPartService {

    private final ClientOrderPartRepository clientOrderPartRepository;
    private final ClientRepository clientRepository;
    private final PartRepository partRepository;

    public List<ClientOrderPartDTO> getAllClientOrderParts() {
        return clientOrderPartRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ClientOrderPartDTO getClientOrderPartById(Long id) {
        return toDTO(clientOrderPartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ClientOrderPart not found with id: " + id)));
    }

    public List<ClientOrderPartDTO> getClientOrderPartsByClient(Long clientId) {
        return clientOrderPartRepository.findByClient_Id(clientId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ClientOrderPartDTO> getClientOrderPartsByStatus(OrderStatus status) {
        return clientOrderPartRepository.findByStatus(status).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ClientOrderPartDTO> getClientOrderPartsByClientAndStatus(Long clientId, OrderStatus status) {
        return clientOrderPartRepository.findByClient_IdAndStatus(clientId, status).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ClientOrderPartDTO createClientOrderPart(ClientOrderPartCreateRequest request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new RuntimeException("Part not found with id: " + request.getPartId()));

        ClientOrderPart order = new ClientOrderPart();
        order.setClient(client);
        order.setPart(part);
        order.setQuantity(request.getQuantity());
        order.setUnitPrice(part.getPrice()); // kopira cenu u trenutku narudžbine
        order.setOrderedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        return toDTO(clientOrderPartRepository.save(order));
    }

    public ClientOrderPartDTO updateClientOrderPartStatus(Long id, OrderStatus status) {
        ClientOrderPart order = clientOrderPartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ClientOrderPart not found with id: " + id));
        order.setStatus(status);
        return toDTO(clientOrderPartRepository.save(order));
    }

    public void deleteClientOrderPart(Long id) {
        if (!clientOrderPartRepository.existsById(id)) {
            throw new RuntimeException("ClientOrderPart not found with id: " + id);
        }
        clientOrderPartRepository.deleteById(id);
    }

    private ClientOrderPartDTO toDTO(ClientOrderPart order) {
        ClientOrderPartDTO dto = new ClientOrderPartDTO();
        dto.setId(order.getId());
        dto.setQuantity(order.getQuantity());
        dto.setUnitPrice(order.getUnitPrice());
        dto.setOrderedAt(order.getOrderedAt());
        dto.setStatus(order.getStatus());
        dto.setClientId(order.getClient().getId());
        dto.setPartId(order.getPart().getId());
        return dto;
    }
}
