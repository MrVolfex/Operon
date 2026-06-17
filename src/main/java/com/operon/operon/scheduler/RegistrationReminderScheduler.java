package com.operon.operon.scheduler;

import com.operon.operon.model.Notification;
import com.operon.operon.model.Vehicle;
import com.operon.operon.repository.NotificationRepository;
import com.operon.operon.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RegistrationReminderScheduler {

    private final VehicleRepository vehicleRepository;
    private final NotificationRepository notificationRepository;

    // Pokreće se svaki dan u 09:00
    @Scheduled(cron = "0 0 9 * * *")
    public void sendRegistrationReminders() {
        LocalDate today = LocalDate.now();
        List<Vehicle> vehicles = vehicleRepository.findAll();

        for (Vehicle vehicle : vehicles) {
            if (vehicle.getRegistrationExpiry() == null) continue;
            if (vehicle.getClient() == null) continue;

            long daysUntilExpiry = ChronoUnit.DAYS.between(today, vehicle.getRegistrationExpiry());

            if (daysUntilExpiry == 30) {
                sendIfNotSent(vehicle, 30);
            } else if (daysUntilExpiry == 7) {
                sendIfNotSent(vehicle, 7);
            }
        }
    }

    private void sendIfNotSent(Vehicle vehicle, int days) {
        String content = buildMessage(vehicle, days);
        Long clientId = vehicle.getClient().getId();

        if (notificationRepository.existsByClient_IdAndContent(clientId, content)) return;

        Notification notification = new Notification();
        notification.setContent(content);
        notification.setClient(vehicle.getClient());
        notificationRepository.save(notification);
    }

    private String buildMessage(Vehicle vehicle, int days) {
        return String.format(
            "Reminder: Registration for your %s %s (%s) expires in %d day%s.",
            vehicle.getBrand(), vehicle.getModel(), vehicle.getLicensePlate(),
            days, days == 1 ? "" : "s"
        );
    }
}
