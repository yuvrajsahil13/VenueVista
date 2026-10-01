package com.hcl.eventvista.service;

import com.hcl.eventvista.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Talks to Razorpay's REST API directly (no SDK needed).
 * Works in Test Mode with keys from https://dashboard.razorpay.com -> Settings -> API Keys.
 */
@Service
public class RazorpayService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    public boolean isEnabled() {
        return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
    }

    public String getKeyId() {
        return keyId;
    }

    /** Creates a Razorpay order and returns its id (order_xxx). Amount is in paise. */
    @SuppressWarnings("rawtypes")
    public String createOrder(long amountInPaise, String receipt) {
        if (!isEnabled()) {
            throw new BadRequestException("Online payment is not configured on the server");
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", amountInPaise);
        body.put("currency", "INR");
        body.put("receipt", receipt);

        try {
            Map response = RestClient.create("https://api.razorpay.com/v1")
                    .post()
                    .uri("/orders")
                    .headers(h -> h.setBasicAuth(keyId, keySecret))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            if (response == null || response.get("id") == null) {
                throw new BadRequestException("Razorpay did not return an order id");
            }
            return String.valueOf(response.get("id"));
        } catch (RestClientException e) {
            throw new BadRequestException("Could not create Razorpay order: " + e.getMessage());
        }
    }

    /** Razorpay signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(hash);
            return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }
}
