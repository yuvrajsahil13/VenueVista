package com.hcl.eventvista.controller;

import com.hcl.eventvista.dto.PaymentDto;
import com.hcl.eventvista.dto.RazorpayVerifyRequestDto;
import com.hcl.eventvista.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** Demo payment (no gateway). */
    @PostMapping
    public ResponseEntity<PaymentDto> processPayment(@RequestBody PaymentDto paymentDto) {
        return new ResponseEntity<>(paymentService.processPayment(paymentDto), HttpStatus.CREATED);
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        return ResponseEntity.ok(paymentService.getConfig());
    }

    @PostMapping("/razorpay/order/{bookingId}")
    public ResponseEntity<Map<String, Object>> createRazorpayOrder(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(bookingId));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<PaymentDto> verifyRazorpayPayment(@RequestBody RazorpayVerifyRequestDto request) {
        return new ResponseEntity<>(paymentService.verifyRazorpayPayment(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDto> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentDto> getPaymentByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBooking(bookingId));
    }
}
