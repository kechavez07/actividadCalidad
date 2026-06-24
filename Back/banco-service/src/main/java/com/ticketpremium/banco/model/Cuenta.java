package com.ticketpremium.banco.model;

import jakarta.persistence.*;

@Entity
@Table(name = "CUENTA")
public class Cuenta {

    @Id
    @Column(name = "NUM_CUENTA", length = 8)
    private String numCuenta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COD_CLIENTE", nullable = false)
    private Cliente cliente;

    @Column(name = "SALDO", nullable = false)
    private Double saldo;

    // Getters and Setters
    public String getNumCuenta() {
        return numCuenta;
    }

    public void setNumCuenta(String numCuenta) {
        this.numCuenta = numCuenta;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Double getSaldo() {
        return saldo;
    }

    public void setSaldo(Double saldo) {
        this.saldo = saldo;
    }
}
