package com.ticketpremium.federacion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ASIENTO", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"codigo_partido", "codigo_localidad", "numero_asiento"})
})
public class Asiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "codigo_partido", referencedColumnName = "CODIGO", nullable = false)
    private PartidoFutbol partido;

    @Column(name = "codigo_localidad", nullable = false, length = 50)
    private String codigoLocalidad;

    @Column(name = "numero_asiento", nullable = false)
    private Integer numeroAsiento;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado; // LIBRE, RESERVADO, COMPRADO

    @Column(name = "cliente_cedula", length = 100)
    private String clienteCedula;

    @Column(name = "cliente_nombre", length = 200)
    private String clienteNombre;

    @Column(name = "factura_id", length = 50)
    private String facturaId;

    @Column(name = "fecha_reserva")
    private LocalDateTime fechaReserva;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PartidoFutbol getPartido() {
        return partido;
    }

    public void setPartido(PartidoFutbol partido) {
        this.partido = partido;
    }

    public String getCodigoLocalidad() {
        return codigoLocalidad;
    }

    public void setCodigoLocalidad(String codigoLocalidad) {
        this.codigoLocalidad = codigoLocalidad;
    }

    public Integer getNumeroAsiento() {
        return numeroAsiento;
    }

    public void setNumeroAsiento(Integer numeroAsiento) {
        this.numeroAsiento = numeroAsiento;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getClienteCedula() {
        return clienteCedula;
    }

    public void setClienteCedula(String clienteCedula) {
        this.clienteCedula = clienteCedula;
    }

    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public String getFacturaId() {
        return facturaId;
    }

    public void setFacturaId(String facturaId) {
        this.facturaId = facturaId;
    }

    public LocalDateTime getFechaReserva() {
        return fechaReserva;
    }

    public void setFechaReserva(LocalDateTime fechaReserva) {
        this.fechaReserva = fechaReserva;
    }
}
