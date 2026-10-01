package com.hcl.eventvista.service;

import com.hcl.eventvista.entity.Booking;
import com.hcl.eventvista.entity.Event;
import com.hcl.eventvista.entity.Payment;
import com.hcl.eventvista.entity.Venue;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

/** Emails an e-ticket (with QR code) after a successful payment. Never breaks the payment if mail fails. */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketEmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${spring.mail.username:}")
    private String from;

    public boolean isEnabled() {
        return enabled && from != null && !from.isBlank();
    }

    public void sendTicket(Booking booking, Payment payment) {
        if (!isEnabled()) return;
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn("Mail is enabled but no JavaMailSender is configured");
            return;
        }

        // Read everything now (inside the request), then send in the background
        Event event = booking.getEvent();
        Venue venue = event.getVenue();
        String to = booking.getUser().getEmail();
        String name = booking.getUser().getName();
        String when = event.getStartTime().format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy, h:mm a"));
        String seats = booking.getSeatNumbers() == null ? "General admission" : booking.getSeatNumbers().replace(",", ", ");
        String qrData = "EVENTVISTA|" + booking.getBookingReference() + "|" + event.getTitle() + "|" + seats;
        String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data="
                + URLEncoder.encode(qrData, StandardCharsets.UTF_8);

        String html = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
                  <div style="background:#5b21b6;color:#fff;padding:20px 24px">
                    <h2 style="margin:0">Your EventVista e-ticket</h2>
                    <p style="margin:4px 0 0">Booking %s</p>
                  </div>
                  <div style="padding:24px">
                    <p>Hi %s, you're going! 🎉</p>
                    <h3 style="margin:0 0 4px">%s</h3>
                    <p style="margin:0;color:#475569">%s<br>%s, %s</p>
                    <table style="margin:16px 0;font-size:14px">
                      <tr><td style="color:#64748b;padding-right:16px">Tickets</td><td><b>%d × %s</b></td></tr>
                      <tr><td style="color:#64748b">Seats</td><td><b>%s</b></td></tr>
                      <tr><td style="color:#64748b">Amount paid</td><td><b>₹%s</b></td></tr>
                      <tr><td style="color:#64748b">Transaction</td><td><b>%s</b></td></tr>
                    </table>
                    <div style="text-align:center"><img src="%s" alt="QR code" width="200" height="200"></div>
                    <p style="text-align:center;color:#64748b;font-size:12px">Show this QR code at the venue entrance.</p>
                  </div>
                </div>
                """.formatted(
                esc(booking.getBookingReference()), esc(name), esc(event.getTitle()), when,
                esc(venue.getName()), esc(venue.getCity()),
                booking.getQuantity(), booking.getTicket().getTicketType().name().replace('_', ' '),
                esc(seats), payment.getAmount().toPlainString(), esc(payment.getTransactionId()), qrUrl);

        String subject = "🎟️ Your tickets for " + event.getTitle() + " (" + booking.getBookingReference() + ")";

        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage message = sender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(from);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(html, true);
                sender.send(message);
                log.info("E-ticket emailed to {}", to);
            } catch (Exception e) {
                log.error("Could not send e-ticket email to {}: {}", to, e.getMessage());
            }
        });
    }

    private static String esc(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
