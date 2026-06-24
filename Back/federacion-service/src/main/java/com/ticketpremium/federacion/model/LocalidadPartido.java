package com.ticketpremium.federacion.model;

import jakarta.persistence.*;

@Entity
@Table(name = "LOCALIDAD_PARTIDO", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"codigo_partido", "codigo_localidad"})
})
public class LocalidadPartido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "codigo_partido", referencedColumnName = "CODIGO", nullable = false)
    private PartidoFutbol partido;

    @Column(name = "codigo_localidad", nullable = false, length = 50)
    private String codigoLocalidad; // "PALCO", "TRIBUNA", "GENERAL", "GENERAL_VISITA"

    @Column(name = "disponibilidad", nullable = false)
    private Integer disponibilidad;

    @Column(name = "precio", nullable = false)
    private Double precio;

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
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

    public Integer getDisponibilidad() {
        return disponibilidad;
    }

    public void setDisponibilidad(Integer disponibilidad) {
        this.disponibilidad = disponibilidad;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }
}
