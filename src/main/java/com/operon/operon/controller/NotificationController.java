package com.operon.operon.controller;

import com.operon.operon.dto.NotificationCreateRequest;
import com.operon.operon.dto.NotificationDTO;
import com.operon.operon.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(notificationService.getNotificationsByClient(clientId));
    }

    @GetMapping("/client/{clientId}/undelivered")
    public ResponseEntity<List<NotificationDTO>> getUndeliveredNotificationsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(notificationService.getUndeliveredNotificationsByClient(clientId));
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@Valid @RequestBody NotificationCreateRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }

    @PatchMapping("/{id}/deliver")
    public ResponseEntity<NotificationDTO> markNotificationAsDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markNotificationAsDelivered(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
