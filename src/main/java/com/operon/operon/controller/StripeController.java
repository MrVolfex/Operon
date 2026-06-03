package com.operon.operon.controller;

import com.operon.operon.model.ClientOrder;
import com.operon.operon.model.Invoice;
import com.operon.operon.repository.ClientOrderRepository;
import com.operon.operon.repository.InvoiceRepository;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
public class StripeController {

    private final InvoiceRepository invoiceRepository;
    private final ClientOrderRepository clientOrderRepository;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/pay/{invoiceId}")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@PathVariable Long invoiceId) throws Exception {
        Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow(() -> new RuntimeException("Invoice not found"));
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long)(invoice.getAmount() * 100))
                .setCurrency("usd")
                .addPaymentMethodType("card")
                .putMetadata("invoiceId", String.valueOf(invoiceId))
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        return ResponseEntity.ok(Map.of("clientSecret", intent.getClientSecret()));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmPayment(@RequestBody Map<String, String> body) throws Exception {
        String paymentIntentId = body.get("paymentIntentId");
        Long invoiceId = Long.parseLong(body.get("invoiceId"));

        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        if (!"succeeded".equals(intent.getStatus())) {
            return ResponseEntity.badRequest().build();
        }

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setIsPaid(true);
        invoiceRepository.save(invoice);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/pay-order/{orderId}")
    public ResponseEntity<Map<String, String>> createOrderPaymentIntent(@PathVariable Long orderId) throws Exception {
        ClientOrder order = clientOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long)(order.getTotal() * 100))
                .setCurrency("usd")
                .addPaymentMethodType("card")
                .putMetadata("orderId", String.valueOf(orderId))
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        return ResponseEntity.ok(Map.of("clientSecret", intent.getClientSecret()));
    }

    @PostMapping("/confirm-order")
    public ResponseEntity<Void> confirmOrderPayment(@RequestBody Map<String, String> body) throws Exception {
        String paymentIntentId = body.get("paymentIntentId");
        Long orderId = Long.parseLong(body.get("orderId"));

        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        if (!"succeeded".equals(intent.getStatus())) {
            return ResponseEntity.badRequest().build();
        }

        ClientOrder order = clientOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setIsPaid(true);
        clientOrderRepository.save(order);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if ("payment_intent.succeeded".equals(event.getType())) {
                PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElseThrow();
                Long invoiceId = Long.parseLong(intent.getMetadata().get("invoiceId"));
                Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow(() -> new RuntimeException("Invoice not found"));
                invoice.setIsPaid(true);
                invoiceRepository.save(invoice);
            }
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
