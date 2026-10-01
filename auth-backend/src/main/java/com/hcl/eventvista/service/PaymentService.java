package com.hcl.eventvista.service;

import com.hcl.eventvista.dto.PaymentDto;
import com.hcl.eventvista.dto.RazorpayVerifyRequestDto;
import com.hcl.eventvista.entity.Booking;
import com.hcl.eventvista.entity.Payment;
import com.hcl.eventvista.enums.BookingStatus;
import com.hcl.eventvista.exception.BadRequestException;
import com.hcl.eventvista.exception.ResourceNotFoundException;
import com.hcl.eventvista.repository.BookingRepository;
import com.hcl.eventvista.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final RazorpayService razorpayService;
    private final TicketEmailService ticketEmailService;

    /** Tells the frontend whether to open Razorpay or use the demo payment screen. */
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("razorpayEnabled", razorpayService.isEnabled());
        config.put("keyId", razorpayService.isEnabled() ? razorpayService.getKeyId() : "");
        config.put("mailEnabled", ticketEmailService.isEnabled());
        return config;
    }

    /** Demo / offline payment (used when Razorpay keys are not configured). */
    public PaymentDto processPayment(PaymentDto paymentDto) {
        Booking booking = getPayableBooking(paymentDto.getBookingId());
        String method = paymentDto.getPaymentMethod() == null ? "UPI" : paymentDto.getPaymentMethod();
        return savePayment(booking, "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase(), method);
    }

    /** Step 1 of Razorpay: create an order for the booking amount. */
    public Map<String, Object> createRazorpayOrder(Long bookingId) {
        Booking booking = getPayableBooking(bookingId);
        long amountInPaise = booking.getTotalPrice().multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP).longValue();
        String orderId = razorpayService.createOrder(amountInPaise, booking.getBookingReference());

        Map<String, Object> order = new LinkedHashMap<>();
        order.put("orderId", orderId);
        order.put("amount", amountInPaise);
        order.put("currency", "INR");
        order.put("keyId", razorpayService.getKeyId());
        order.put("bookingReference", booking.getBookingReference());
        order.put("customerName", booking.getUser().getName());
        order.put("customerEmail", booking.getUser().getEmail());
        order.put("customerPhone", booking.getUser().getPhone() == null ? "" : booking.getUser().getPhone());
        return order;
    }

    /** Step 2 of Razorpay: verify the signature sent back by the checkout and record the payment. */
    public PaymentDto verifyRazorpayPayment(RazorpayVerifyRequestDto request) {
        Booking booking = getPayableBooking(request.getBookingId());
        boolean valid = razorpayService.verifySignature(
                request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());
        if (!valid) {
            throw new BadRequestException("Payment verification failed. If money was deducted it will be refunded by Razorpay.");
        }
        return savePayment(booking, request.getRazorpayPaymentId(), "RAZORPAY");
    }

    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public PaymentDto getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return mapToDto(payment);
    }

    public PaymentDto getPaymentByBooking(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment for Booking", "id", bookingId));
        return mapToDto(payment);
    }

    private Booking getPayableBooking(Long bookingId) {
        if (bookingId == null) throw new BadRequestException("bookingId is required");
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking was cancelled and cannot be paid");
        }
        if (paymentRepository.findByBookingId(bookingId).isPresent()) {
            throw new BadRequestException("This booking is already paid");
        }
        return booking;
    }

    private PaymentDto savePayment(Booking booking, String transactionId, String method) {
        Payment payment = Payment.builder()
                .transactionId(transactionId)
                .paymentMethod(method)
                .paymentStatus("SUCCESS")
                .amount(booking.getTotalPrice())
                .paymentTime(LocalDateTime.now())
                .booking(booking)
                .build();
        Payment saved = paymentRepository.save(payment);
        ticketEmailService.sendTicket(booking, saved);
        return mapToDto(saved);
    }

    private PaymentDto mapToDto(Payment payment) {
        return PaymentDto.builder()
                .id(payment.getId())
                .transactionId(payment.getTransactionId())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .amount(payment.getAmount())
                .paymentTime(payment.getPaymentTime())
                .bookingId(payment.getBooking().getId())
                .build();
    }
}
