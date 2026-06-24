package com.ticketpremium.banco.repository;

import com.ticketpremium.banco.model.Cliente;
import com.ticketpremium.banco.model.Credito;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CreditoRepository extends JpaRepository<Credito, Integer> {
    boolean existsByClienteAndActivo(Cliente cliente, Boolean activo);
    List<Credito> findByCliente(Cliente cliente);
}
