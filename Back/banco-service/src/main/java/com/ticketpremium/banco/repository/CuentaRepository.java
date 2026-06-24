package com.ticketpremium.banco.repository;

import com.ticketpremium.banco.model.Cliente;
import com.ticketpremium.banco.model.Cuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CuentaRepository extends JpaRepository<Cuenta, String> {
    List<Cuenta> findByCliente(Cliente cliente);
}
