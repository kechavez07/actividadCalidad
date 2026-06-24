package com.ticketpremium.federacion.repository;

import com.ticketpremium.federacion.model.PartidoFutbol;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PartidoFutbolRepository extends JpaRepository<PartidoFutbol, String> {
    List<PartidoFutbol> findByFechaAfter(LocalDateTime dateTime);
}
