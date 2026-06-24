package com.ticketpremium.banco.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "MOVIMIENTO")
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COD_MOVIMIENTO")
    private Integer codMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "NUM_CUENTA", nullable = false)
    private Cuenta cuenta;

    @Column(name = "TIPO", nullable = false, length = 3)
    private String tipo; // "DEP" o "RET"

    @Column(name = "VALOR", nullable = false)
    private Double valor;

    @Column(name = "FECHA", nullable = false)
    private LocalDate fecha;

    // Getters and Setters
    public Integer getCodMovimiento() {
        return codMovimiento;
    }

    public void setCodMovimiento(Integer codMovimiento) {
        this.codMovimiento = codMovimiento;
    }

    public Cuenta getCuenta() {
        return cuenta;
    }

    public void setCuenta(Cuenta cuenta) {
        this.cuenta = cuenta;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
}
