package com.operon.operon.repository;

import com.operon.operon.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByClient_Id(Long clientId);
    List<Notification> findByClient_IdAndIsDelivered(Long clientId, Boolean isDelivered);

}
