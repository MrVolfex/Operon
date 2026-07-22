package com.operon.operon.service;

import com.operon.operon.model.OrderItem;
import com.operon.operon.model.Vehicle;
import com.operon.operon.model.WorkOrder;
import com.operon.operon.repository.VehicleRepository;
import com.operon.operon.repository.WorkOrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class AiAnalysisService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    private final VehicleRepository vehicleRepository;
    private final WorkOrderRepository workOrderRepository;
    private final RestClient restClient;

    public AiAnalysisService(VehicleRepository vehicleRepository, WorkOrderRepository workOrderRepository) {
        this.vehicleRepository = vehicleRepository;
        this.workOrderRepository = workOrderRepository;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.anthropic.com")
                .build();
    }

    @Transactional(readOnly = true)
    public String analyzeVehicleHistory(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vozilo nije pronađeno"));

        List<WorkOrder> workOrders = workOrderRepository.findByVehicle_Id(vehicleId);
        return callGemini(buildPrompt(vehicle, workOrders));
    }

    @Transactional(readOnly = true)
    public String analyzeVehicleHistoryForClient(Long vehicleId, String clientUsername) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vozilo nije pronađeno"));

        if (!vehicle.getClient().getUsername().equals(clientUsername)) {
            throw new SecurityException("Pristup odbijen");
        }

        List<WorkOrder> workOrders = workOrderRepository.findByVehicle_Id(vehicleId);
        return callGemini(buildPrompt(vehicle, workOrders));
    }

    private String buildPrompt(Vehicle vehicle, List<WorkOrder> workOrders) {
        StringBuilder sb = new StringBuilder();
        sb.append("Analiziraj istoriju servisa vozila i daj preporuke vlasniku na srpskom jeziku.\n\n");
        sb.append("VOZILO:\n");
        sb.append("Marka i model: ").append(vehicle.getBrand()).append(" ").append(vehicle.getModel()).append("\n");
        sb.append("Godina: ").append(vehicle.getYear()).append("\n");
        sb.append("Tablice: ").append(vehicle.getLicensePlate()).append("\n");
        sb.append("Kilometraža: ").append(vehicle.getMileage()).append(" km\n");
        sb.append("Registracija ističe: ").append(vehicle.getRegistrationExpiry()).append("\n\n");

        if (workOrders.isEmpty()) {
            sb.append("Vozilo nema istoriju servisa u sistemu.\n");
        } else {
            sb.append("ISTORIJA SERVISA (").append(workOrders.size()).append(" naloga):\n");
            for (WorkOrder wo : workOrders) {
                sb.append("\n- Datum: ").append(wo.getOpenedAt().toLocalDate());
                sb.append(", Status: ").append(wo.getStatus());
                if (wo.getDescription() != null && !wo.getDescription().isBlank()) {
                    sb.append("\n  Opis: ").append(wo.getDescription());
                }
                List<OrderItem> items = wo.getOrderItems();
                if (!items.isEmpty()) {
                    sb.append("\n  Stavke:");
                    for (OrderItem item : items) {
                        if (item.getServiceType() != null) {
                            sb.append("\n    [Usluga] ").append(item.getServiceType().getType());
                        } else if (item.getPart() != null) {
                            sb.append("\n    [Deo] ").append(item.getPart().getName())
                              .append(" (").append(item.getPart().getBrand()).append(")");
                        }
                    }
                }
            }
        }

        sb.append("\n\nNa osnovu ove istorije daj:\n");
        sb.append("1. Ocenu redovnosti održavanja\n");
        sb.append("2. Šta uskoro treba servisirati\n");
        sb.append("3. Uočene obrasce ili zabrinjavajuće trendove\n");
        sb.append("4. Opštu preporuku vlasniku\n");
        sb.append("\nBudi koncizan i praktičan. Koristi srpski jezik.");

        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", "claude-haiku-4-5-20251001",
                "max_tokens", 1024,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        try {
            Map<String, Object> response = restClient.post()
                    .uri("/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
            return (String) content.get(0).get("text");
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            System.err.println("Gemini API greška [" + e.getStatusCode() + "]: " + body);
            if (e.getStatusCode().value() == 429) {
                throw new RuntimeException("AI servis je trenutno preopterećen. Pokušaj ponovo za nekoliko sekundi.");
            }
            if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
                throw new RuntimeException("Neispravan Gemini API key.");
            }
            throw new RuntimeException("Greška pri pozivu AI servisa [" + e.getStatusCode() + "]: " + body);
        }
    }
}
