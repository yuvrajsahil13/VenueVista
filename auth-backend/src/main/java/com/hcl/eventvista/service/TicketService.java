package com.hcl.eventvista.service;

import com.hcl.eventvista.dto.TicketDto;
import com.hcl.eventvista.entity.Event;
import com.hcl.eventvista.entity.Ticket;
import com.hcl.eventvista.exception.ResourceNotFoundException;
import com.hcl.eventvista.repository.EventRepository;
import com.hcl.eventvista.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;

    public TicketDto createTicket(TicketDto ticketDto) {
        Event event = eventRepository.findById(ticketDto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", ticketDto.getEventId()));

        Ticket ticket = mapToEntity(ticketDto, event);
        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToDto(savedTicket);
    }

    // Naya method jo saari tickets fetch karega
    public List<TicketDto> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TicketDto getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        return mapToDto(ticket);
    }

    public List<TicketDto> getTicketsByEvent(Long eventId) {
        return ticketRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void deleteTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
        ticketRepository.delete(ticket);
    }

    private TicketDto mapToDto(Ticket ticket) {
        return TicketDto.builder()
                .id(ticket.getId())
                .ticketType(ticket.getTicketType())
                .price(ticket.getPrice())
                .totalQuantity(ticket.getTotalQuantity())
                .availableQuantity(ticket.getAvailableQuantity())
                .eventId(ticket.getEvent().getId())
                .build();
    }

    private Ticket mapToEntity(TicketDto ticketDto, Event event) {
        return Ticket.builder()
                .id(ticketDto.getId())
                .ticketType(ticketDto.getTicketType())
                .price(ticketDto.getPrice())
                .totalQuantity(ticketDto.getTotalQuantity())
                .availableQuantity(ticketDto.getAvailableQuantity())
                .event(event)
                .build();
    }
}