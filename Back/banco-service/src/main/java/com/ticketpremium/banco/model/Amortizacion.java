package com.ticketpremium.banco.model;

import jakarta.persistence.*;

@Entity
@Table(name = "TABLA_AMORTIZACION")
public class Amortizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COD_CUOTA")
    private Integer codCuota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COD_CREDITO", nullable = false)
    private Credito credito;

    @Column(name = "NUM_CUOTA", nullable = false)
    private Integer numCuota;

    @Column(name = "VALOR_CUOTA", nullable = false)
    private Double valorCuota;

    @Column(name = "INTERES_PAGADO", nullable = false)
    private Double interesPagado;

    @Column(name = "CAPITAL_PAGADO", nullable = false)
    private Double capitalPagado;

    @Column(name = "SALDO_RESTANTE", nullable = false)
    private Double saldoRestante;

    // Getters and Setters
    public Integer getCodCuota() {
        return codCuota;
    }

    public void setCodCuota(Integer codCuota) {
        this.codCuota = codCuota;
    }

    public Credito getCredito() {
        return credito;
    }

    public void setCredito(Credito credito) {
        this.credito = credito;
    }

    public Integer getNumCuota() {
        return numCuota;
    }

    public void setNumCuota(Integer numCuota) {
        this.numCuota = numCuota;
    }

    public Double getValorCuota() {
        return valorCuota;
    }

    public void setValorCuota(Double valorCuota) {
        this.valorCuota = valorCuota;
    }

    public Double getInteresPagado() {
        return interesPagado;
    }

    public void setInteresPagado(Double interesPagado) {
        this.interesPagado = interesPagado;
    }

    public Double getCapitalPagado() {
        return capitalPagado;
    }

    public void setCapitalPagado(Double capitalPagado) {
        this.capitalPagado = capitalPagado;
    }

    public Double getSaldoRestante() {
        return saldoRestante;
    }

    public void setSaldoRestante(Double saldoRestante) {
        this.saldoRestante = saldoRestante;
    }
}
