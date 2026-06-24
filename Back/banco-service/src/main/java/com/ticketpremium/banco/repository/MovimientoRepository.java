package com.ticketpremium.banco.repository;

import com.ticketpremium.banco.model.Cuenta;
import com.ticketpremium.banco.model.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface MovimientoRepository extends JpaRepository<Movimiento, Integer> {
    List<Movimiento> findByCuentaInAndFechaAfter(List<Cuenta> cuentas, LocalDate date);
}
