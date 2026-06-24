package com.ticketpremium.banco.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "CREDITO")
public class Credito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COD_CREDITO")
    private Integer codCredito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COD_CLIENTE", nullable = false)
    private Cliente cliente;

    @Column(name = "MONTO", nullable = false)
    private Double monto;

    @Column(name = "PLAZO_MESES", nullable = false)
    private Integer plazoMeses;

    @Column(name = "TASA_INTERES", nullable = false)
    private Double tasaInteres; // 16.5%

    @Column(name = "FECHA_APROBACION", nullable = false)
    private LocalDate fechaAprobacion;

    @Column(name = "ACTIVO", nullable = false)
    private Boolean activo; // true if not fully paid

    // Getters and Setters
    public Integer getCodCredito() {
        return codCredito;
    }

    public void setCodCredito(Integer codCredito) {
        this.codCredito = codCredito;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Double getMonto() {
        return monto;
    }

    public void setMonto(Double monto) {
        this.monto = monto;
    }

    public Integer getPlazoMeses() {
        return plazoMeses;
    }

    public void setPlazoMeses(Integer plazoMeses) {
        this.plazoMeses = plazoMeses;
    }

    public Double getTasaInteres() {
        return tasaInteres;
    }

    public void setTasaInteres(Double tasaInteres) {
        this.tasaInteres = tasaInteres;
    }

    public LocalDate getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDate fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
