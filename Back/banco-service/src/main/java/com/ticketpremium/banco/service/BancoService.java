package com.ticketpremium.banco.service;

import com.ticketpremium.banco.model.*;
import com.ticketpremium.banco.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class BancoService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private CuentaRepository cuentaRepository;

    @Autowired
    private MovimientoRepository movimientoRepository;

    @Autowired
    private CreditoRepository creditoRepository;

    @Autowired
    private AmortizacionRepository amortizacionRepository;

    private static final double TASA_INTERES_ANUAL = 0.165; // 16.5%

    public Optional<Cliente> findClienteByCedula(String cedula) {
        return clienteRepository.findByCedula(cedula);
    }

    public VerificationResult verificarSujetoCredito(String cedula) {
        Optional<Cliente> optCliente = clienteRepository.findByCedula(cedula);
        if (optCliente.isEmpty()) {
            return new VerificationResult(false, "El cliente no está registrado en el banco.");
        }

        Cliente cliente = optCliente.get();

        // 1. Verificar género y edad (si es masculino, no debe ser menor de 25 años)
        if ("M".equalsIgnoreCase(cliente.getGenero())) {
            int edad = Period.between(cliente.getFechaNacimiento(), LocalDate.now()).getYears();
            if (edad < 25) {
                return new VerificationResult(false, "El solicitante masculino debe tener al menos 25 años de edad.");
            }
        }

        // 2. Verificar que posea al menos una transacción de depósito en el último mes
        List<Cuenta> cuentas = cuentaRepository.findByCliente(cliente);
        if (cuentas.isEmpty()) {
            return new VerificationResult(false, "El cliente no posee cuentas en este banco.");
        }

        LocalDate unMesAtras = LocalDate.now().minusDays(30);
        List<Movimiento> movimientosMes = movimientoRepository.findByCuentaInAndFechaAfter(cuentas, unMesAtras);
        boolean tieneDeposito = movimientosMes.stream()
                .anyMatch(m -> "DEP".equalsIgnoreCase(m.getTipo()) && m.getValor() > 0);

        if (!tieneDeposito) {
            return new VerificationResult(false, "El cliente no tiene transacciones de depósito en el último mes.");
        }

        // 3. Verificar que actualmente no tenga un crédito activo en el banco
        boolean tieneCreditoActivo = creditoRepository.existsByClienteAndActivo(cliente, true);
        if (tieneCreditoActivo) {
            return new VerificationResult(false, "El cliente actualmente posee un crédito activo.");
        }

        return new VerificationResult(true, "El cliente es sujeto de crédito.");
    }

    public double obtenerMontoMaximo(String cedula) {
        VerificationResult verResult = verificarSujetoCredito(cedula);
        if (!verResult.isEsSujeto()) {
            return 0.0;
        }

        Cliente cliente = clienteRepository.findByCedula(cedula).get();
        List<Cuenta> cuentas = cuentaRepository.findByCliente(cliente);

        LocalDate tresMesesAtras = LocalDate.now().minusMonths(3);
        List<Movimiento> movimientosTrimestre = movimientoRepository.findByCuentaInAndFechaAfter(cuentas, tresMesesAtras);

        // Calcular promedios de depósitos y retiros
        double totalDepositos = movimientosTrimestre.stream()
                .filter(m -> "DEP".equalsIgnoreCase(m.getTipo()))
                .mapToDouble(Movimiento::getValor)
                .sum();

        double totalRetiros = movimientosTrimestre.stream()
                .filter(m -> "RET".equalsIgnoreCase(m.getTipo()))
                .mapToDouble(Movimiento::getValor)
                .sum();

        double promedioDepositos = totalDepositos / 3.0;
        double promedioRetiros = totalRetiros / 3.0;

        // Fórmula: ((Promedio Depósitos - Promedio Retiros) * 30%) * 6
        double diferencia = promedioDepositos - promedioRetiros;
        if (diferencia <= 0) {
            return 0.0;
        }

        double montoMax = (diferencia * 0.30) * 6;
        return round(montoMax);
    }

    @Transactional
    public LoanResult registrarCreditoAmortizacion(String cedula, double monto, int plazoMeses) {
        VerificationResult verResult = verificarSujetoCredito(cedula);
        if (!verResult.isEsSujeto()) {
            return new LoanResult(false, "El cliente no cumple con los requisitos del crédito: " + verResult.getMensaje(), Collections.emptyList());
        }

        double montoMax = obtenerMontoMaximo(cedula);
        if (monto > montoMax) {
            return new LoanResult(false, "El monto solicitado (" + monto + ") supera el monto máximo autorizado (" + montoMax + ").", Collections.emptyList());
        }

        if (plazoMeses < 3 || plazoMeses > 18) {
            return new LoanResult(false, "El plazo debe estar entre 3 y 18 meses.", Collections.emptyList());
        }

        Cliente cliente = clienteRepository.findByCedula(cedula).get();

        // Crear Crédito
        Credito credito = new Credito();
        credito.setCliente(cliente);
        credito.setMonto(monto);
        credito.setPlazoMeses(plazoMeses);
        credito.setTasaInteres(TASA_INTERES_ANUAL);
        credito.setFechaAprobacion(LocalDate.now());
        credito.setActivo(true);
        credito = creditoRepository.save(credito);

        // Generar Tabla de Amortización (Cuota Fija)
        double tasaPeriodo = TASA_INTERES_ANUAL / 12.0;
        double factor = Math.pow(1 + tasaPeriodo, -plazoMeses);
        double valorCuota = round(monto / ((1.0 - factor) / tasaPeriodo));

        List<Amortizacion> cuotas = new ArrayList<>();
        double saldoRestante = monto;

        for (int i = 1; i <= plazoMeses; i++) {
            double interes = round(saldoRestante * tasaPeriodo);
            double capital;
            
            if (i == plazoMeses) {
                // Última cuota ajusta para evitar decimales flotantes residuales
                capital = round(saldoRestante);
                valorCuota = round(capital + interes);
                saldoRestante = 0.0;
            } else {
                capital = round(valorCuota - interes);
                saldoRestante = round(saldoRestante - capital);
            }

            Amortizacion cuota = new Amortizacion();
            cuota.setCredito(credito);
            cuota.setNumCuota(i);
            cuota.setValorCuota(valorCuota);
            cuota.setInteresPagado(interes);
            cuota.setCapitalPagado(capital);
            cuota.setSaldoRestante(saldoRestante);
            cuotas.add(amortizacionRepository.save(cuota));
        }

        return new LoanResult(true, "Crédito registrado con éxito.", cuotas);
    }

    // ===== LOGIN =====
    private static final String DEFAULT_USER = "MONSTER";
    private static final String DEFAULT_PASS = "MONSTER9";

    public LoginResult login(String usuario, String contrasena) {
        if (DEFAULT_USER.equals(usuario) && DEFAULT_PASS.equals(contrasena)) {
            return new LoginResult(true, "Autenticación exitosa. Bienvenido " + usuario + ".", "ADMIN");
        }
        return new LoginResult(false, "Credenciales incorrectas.", null);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // Helper classes
    public static class VerificationResult {
        private final boolean esSujeto;
        private final String mensaje;

        public VerificationResult(boolean esSujeto, String mensaje) {
            this.esSujeto = esSujeto;
            this.mensaje = mensaje;
        }

        public boolean isEsSujeto() {
            return esSujeto;
        }

        public String getMensaje() {
            return mensaje;
        }
    }

    public static class LoanResult {
        private final boolean aprobado;
        private final String mensaje;
        private final List<Amortizacion> tablaAmortizacion;

        public LoanResult(boolean aprobado, String mensaje, List<Amortizacion> tablaAmortizacion) {
            this.aprobado = aprobado;
            this.mensaje = mensaje;
            this.tablaAmortizacion = tablaAmortizacion;
        }

        public boolean isAprobado() {
            return aprobado;
        }

        public String getMensaje() {
            return mensaje;
        }

        public List<Amortizacion> getTablaAmortizacion() {
            return tablaAmortizacion;
        }
    }

    public static class LoginResult {
        private final boolean autenticado;
        private final String mensaje;
        private final String rol;

        public LoginResult(boolean autenticado, String mensaje, String rol) {
            this.autenticado = autenticado;
            this.mensaje = mensaje;
            this.rol = rol;
        }

        public boolean isAutenticado() {
            return autenticado;
        }

        public String getMensaje() {
            return mensaje;
        }

        public String getRol() {
            return rol;
        }
    }
}
