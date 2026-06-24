package com.ticketpremium.banco.repository;

import com.ticketpremium.banco.model.Amortizacion;
import com.ticketpremium.banco.model.Credito;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AmortizacionRepository extends JpaRepository<Amortizacion, Integer> {
    List<Amortizacion> findByCreditoOrderByNumCuotaAsc(Credito credito);
}
