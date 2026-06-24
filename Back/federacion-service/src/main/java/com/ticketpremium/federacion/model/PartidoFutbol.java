package com.ticketpremium.federacion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PARTIDO_FUTBOL")
public class PartidoFutbol {

    @Id
    @Column(name = "CODIGO", nullable = false, length = 50)
    private String codigo;

    @Column(name = "EQUIPO_LOCAL", nullable = false, length = 100)
    private String equipoLocal;

    @Column(name = "EQUIPO_VISITA", nullable = false, length = 100)
    private String equipoVisita;

    @Column(name = "FECHA", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "LUGAR", nullable = false, length = 100)
    private String lugar;

    // Getters and Setters
    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getEquipoLocal() {
        return equipoLocal;
    }

    public void setEquipoLocal(String equipoLocal) {
        this.equipoLocal = equipoLocal;
    }

    public String getEquipoVisita() {
        return equipoVisita;
    }

    public void setEquipoVisita(String equipoVisita) {
        this.equipoVisita = equipoVisita;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
    }
}
