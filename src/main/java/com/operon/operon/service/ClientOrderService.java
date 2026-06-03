package com.operon.operon.service;

import com.operon.operon.dto.CartItemRequest;
import com.operon.operon.dto.ClientOrderDTO;
import com.operon.operon.dto.ClientOrderItemDTO;
import com.operon.operon.model.*;
import com.operon.operon.repository.ClientOrderRepository;
import com.operon.operon.repository.ClientRepository;
import com.operon.operon.repository.NotificationRepository;
import com.operon.operon.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientOrderService {

    private final ClientOrderRepository clientOrderRepository;
    private final ClientRepository clientRepository;
    private final PartRepository partRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public ClientOrderDTO createOrder(String username, List<CartItemRequest> cartItems) {
        Client client = clientRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Client not found: " + username));

        ClientOrder order = new ClientOrder();
        order.setClient(client);
        order.setOrderedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        for (CartItemRequest cartItem : cartItems) {
            Part part = partRepository.findById(cartItem.getPartId())
                    .orElseThrow(() -> new RuntimeException("Part not found: " + cartItem.getPartId()));

            if (part.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalStateException(
                    "Insufficient stock for part: " + part.getName() +
                    " (available: " + part.getStockQuantity() + ")");
            }

            part.setStockQuantity(part.getStockQuantity() - cartItem.getQuantity());
            partRepository.save(part);

            ClientOrderItem item = new ClientOrderItem();
            item.setClientOrder(order);
            item.setPart(part);
            item.setQuantity(cartItem.getQuantity());
            item.setUnitPrice(part.getPrice());
            order.getItems().add(item);
        }

        ClientOrder saved = clientOrderRepository.save(order);

        Notification notification = new Notification();
        notification.setClient(client);
        notification.setContent("Your parts order #" + saved.getId() + " has been placed successfully and is being prepared.");
        notification.setSentAt(LocalDateTime.now());
        notification.setIsDelivered(false);
        notificationRepository.save(notification);

        return toDTO(saved);
    }

    public List<ClientOrderDTO> getOrdersByClient(String username) {
        Client client = clientRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Client not found: " + username));
        return clientOrderRepository.findByClient_IdOrderByOrderedAtDesc(client.getId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ClientOrderDTO toDTO(ClientOrder order) {
        ClientOrderDTO dto = new ClientOrderDTO();
        dto.setId(order.getId());
        dto.setClientId(order.getClient().getId());
        dto.setOrderedAt(order.getOrderedAt());
        dto.setStatus(order.getStatus());
        dto.setItems(order.getItems().stream().map(this::toItemDTO).collect(Collectors.toList()));
        dto.setTotal(order.getTotal());
        dto.setIsPaid(order.getIsPaid());
        return dto;
    }

    private ClientOrderItemDTO toItemDTO(ClientOrderItem item) {
        ClientOrderItemDTO dto = new ClientOrderItemDTO();
        dto.setId(item.getId());
        dto.setPartId(item.getPart().getId());
        dto.setPartName(item.getPart().getName());
        dto.setPartNumber(item.getPart().getPartNumber());
        dto.setPartBrand(item.getPart().getBrand());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        return dto;
    }
}
