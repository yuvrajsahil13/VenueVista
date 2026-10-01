package com.hcl.eventvista.controller;

import com.hcl.eventvista.dto.TicketDto;
import com.hcl.eventvista.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketDto> createTicket(@RequestBody TicketDto ticketDto) {
        return new ResponseEntity<>(ticketService.createTicket(ticketDto), HttpStatus.CREATED);
    }

    // Ye raha naya method jo GET /api/tickets ke liye 200 OK dega
    @GetMapping
    public ResponseEntity<List<TicketDto>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<TicketDto>> getTicketsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(ticketService.getTicketsByEvent(eventId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok("Ticket deleted successfully");
    }
}