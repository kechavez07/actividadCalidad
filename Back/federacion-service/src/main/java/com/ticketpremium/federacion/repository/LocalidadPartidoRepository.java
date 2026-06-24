package com.ticketpremium.federacion.repository;

import com.ticketpremium.federacion.model.LocalidadPartido;
import com.ticketpremium.federacion.model.PartidoFutbol;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LocalidadPartidoRepository extends JpaRepository<LocalidadPartido, Integer> {
    List<LocalidadPartido> findByPartidoAndDisponibilidadGreaterThan(PartidoFutbol partido, Integer value);
    Optional<LocalidadPartido> findByPartidoAndCodigoLocalidad(PartidoFutbol partido, String codigoLocalidad);
}
