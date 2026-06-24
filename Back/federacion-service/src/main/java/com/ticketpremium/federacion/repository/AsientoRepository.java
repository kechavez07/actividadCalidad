package com.ticketpremium.federacion.repository;

import com.ticketpremium.federacion.model.Asiento;
import com.ticketpremium.federacion.model.PartidoFutbol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AsientoRepository extends JpaRepository<Asiento, Long> {
    
    List<Asiento> findByPartidoAndCodigoLocalidad(PartidoFutbol partido, String codigoLocalidad);
    
    Optional<Asiento> findByPartidoAndCodigoLocalidadAndNumeroAsiento(
            PartidoFutbol partido, String codigoLocalidad, Integer numeroAsiento);
    
    List<Asiento> findByPartidoAndCodigoLocalidadAndEstado(
            PartidoFutbol partido, String codigoLocalidad, String estado);

    long countByPartidoAndCodigoLocalidadAndEstado(
            PartidoFutbol partido, String codigoLocalidad, String estado);

    // Buscar reservas expiradas (más de 10 minutos sin confirmar)
    List<Asiento> findByEstadoAndFechaReservaBefore(String estado, LocalDateTime expiration);
}
