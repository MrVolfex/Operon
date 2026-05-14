package com.operon.operon.service;

import com.operon.operon.dto.NotificationCreateRequest;
import com.operon.operon.dto.NotificationDTO;
import com.operon.operon.model.Client;
import com.operon.operon.model.Notification;
import com.operon.operon.repository.ClientRepository;
import com.operon.operon.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ClientRepository clientRepository;

    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public NotificationDTO getNotificationById(Long id) {
        return toDTO(notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id)));
    }

    public List<NotificationDTO> getNotificationsByClient(Long clientId) {
        return notificationRepository.findByClient_Id(clientId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<NotificationDTO> getUndeliveredNotificationsByClient(Long clientId) {
        return notificationRepository.findByClient_IdAndIsDelivered(clientId, false)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public NotificationDTO createNotification(NotificationCreateRequest request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));

        Notification notification = new Notification();
        notification.setClient(client);
        notification.setContent(request.getContent());
        notification.setSentAt(LocalDateTime.now());
        notification.setIsDelivered(false);

        return toDTO(notificationRepository.save(notification));
    }

    public NotificationDTO markNotificationAsDelivered(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setIsDelivered(true);
        return toDTO(notificationRepository.save(notification));
    }

    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }

    private NotificationDTO toDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setContent(notification.getContent());
        dto.setSentAt(notification.getSentAt());
        dto.setIsDelivered(notification.getIsDelivered());
        dto.setClientId(notification.getClient().getId());
        return dto;
    }
}
