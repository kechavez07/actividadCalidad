package com.ticketpremium.federacion.service;

import com.ticketpremium.federacion.model.Asiento;
import com.ticketpremium.federacion.model.LocalidadPartido;
import com.ticketpremium.federacion.model.PartidoFutbol;
import com.ticketpremium.federacion.repository.AsientoRepository;
import com.ticketpremium.federacion.repository.LocalidadPartidoRepository;
import com.ticketpremium.federacion.repository.PartidoFutbolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class FederacionService {

    private static final int MINUTOS_EXPIRACION_RESERVA = 10;

    @Autowired
    private PartidoFutbolRepository partidoRepository;

    @Autowired
    private LocalidadPartidoRepository localidadRepository;

    @Autowired
    private AsientoRepository asientoRepository;

    // ===== ENDPOINTS EXISTENTES =====

    public List<PartidoFutbol> getPartidosDisponibles() {
        LocalDateTime fechaLimite = LocalDateTime.now().minusHours(4);
        return partidoRepository.findByFechaAfter(fechaLimite);
    }

    public List<LocalidadPartido> getLocalidadesPorPartido(String codigoPartido) {
        Optional<PartidoFutbol> optPartido = partidoRepository.findById(codigoPartido);
        if (optPartido.isEmpty()) {
            return Collections.emptyList();
        }
        return localidadRepository.findByPartidoAndDisponibilidadGreaterThan(optPartido.get(), 0);
    }

    @Transactional
    public DecrementResult decrementarDisponibilidad(String codigoPartido, String codigoLocalidad, int cantidad) {
        Optional<PartidoFutbol> optPartido = partidoRepository.findById(codigoPartido);
        if (optPartido.isEmpty()) {
            return new DecrementResult(false, "El partido con código " + codigoPartido + " no existe.");
        }

        Optional<LocalidadPartido> optLocalidad = localidadRepository.findByPartidoAndCodigoLocalidad(optPartido.get(), codigoLocalidad);
        if (optLocalidad.isEmpty()) {
            return new DecrementResult(false, "La localidad " + codigoLocalidad + " no está definida para este partido.");
        }

        LocalidadPartido lp = optLocalidad.get();
        if (lp.getDisponibilidad() < cantidad) {
            return new DecrementResult(false, "No hay suficiente disponibilidad. Quedan " + lp.getDisponibilidad() + " boletos.");
        }

        lp.setDisponibilidad(lp.getDisponibilidad() - cantidad);
        localidadRepository.save(lp);

        return new DecrementResult(true, "Disponibilidad decrementada con éxito. Quedan " + lp.getDisponibilidad() + " boletos.");
    }

    // ===== RESERVA DE ASIENTOS =====

    /**
     * Reserva un asiento específico para un cliente.
     * Evita que dos personas reserven/compren el mismo asiento.
     */
    @Transactional
    public AsientoResult reservarAsiento(String codigoPartido, String codigoLocalidad,
                                         int numeroAsiento, String clienteCedula, String clienteNombre) {
        // Primero liberar reservas expiradas de esta localidad
        liberarReservasExpiradas();

        Optional<PartidoFutbol> optPartido = partidoRepository.findById(codigoPartido);
        if (optPartido.isEmpty()) {
            return new AsientoResult(false, "El partido con código " + codigoPartido + " no existe.", null);
        }

        // Verificar que la localidad existe
        Optional<LocalidadPartido> optLocalidad = localidadRepository.findByPartidoAndCodigoLocalidad(optPartido.get(), codigoLocalidad);
        if (optLocalidad.isEmpty()) {
            return new AsientoResult(false, "La localidad " + codigoLocalidad + " no está definida para este partido.", null);
        }

        // Buscar el asiento específico
        Optional<Asiento> optAsiento = asientoRepository.findByPartidoAndCodigoLocalidadAndNumeroAsiento(
                optPartido.get(), codigoLocalidad, numeroAsiento);

        if (optAsiento.isEmpty()) {
            return new AsientoResult(false, "El asiento #" + numeroAsiento + " no existe en la localidad " + codigoLocalidad + ".", null);
        }

        Asiento asiento = optAsiento.get();

        if ("RESERVADO".equals(asiento.getEstado())) {
            return new AsientoResult(false, "El asiento #" + numeroAsiento + " ya está RESERVADO por otro cliente.", asiento);
        }
        if ("COMPRADO".equals(asiento.getEstado())) {
            return new AsientoResult(false, "El asiento #" + numeroAsiento + " ya fue COMPRADO. No está disponible.", asiento);
        }

        // Reservar el asiento
        asiento.setEstado("RESERVADO");
        asiento.setClienteCedula(clienteCedula);
        asiento.setClienteNombre(clienteNombre);
        asiento.setFechaReserva(LocalDateTime.now());
        asientoRepository.save(asiento);

        return new AsientoResult(true, "Asiento #" + numeroAsiento + " reservado exitosamente para " + clienteNombre + ". La reserva expira en " + MINUTOS_EXPIRACION_RESERVA + " minutos.", asiento);
    }

    /**
     * Confirma la compra de un asiento previamente reservado.
     * Cambia el estado de RESERVADO a COMPRADO y decrementa la disponibilidad.
     */
    @Transactional
    public AsientoResult confirmarCompraAsiento(String codigoPartido, String codigoLocalidad,
                                                 int numeroAsiento, String clienteCedula, String facturaId) {
        Optional<PartidoFutbol> optPartido = partidoRepository.findById(codigoPartido);
        if (optPartido.isEmpty()) {
            return new AsientoResult(false, "El partido con código " + codigoPartido + " no existe.", null);
        }

        Optional<Asiento> optAsiento = asientoRepository.findByPartidoAndCodigoLocalidadAndNumeroAsiento(
                optPartido.get(), codigoLocalidad, numeroAsiento);

        if (optAsiento.isEmpty()) {
            return new AsientoResult(false, "El asiento #" + numeroAsiento + " no existe.", null);
        }

        Asiento asiento = optAsiento.get();

        if ("COMPRADO".equals(asiento.getEstado())) {
            return new AsientoResult(false, "El asiento #" + numeroAsiento + " ya fue comprado.", asiento);
        }

        if ("LIBRE".equals(asiento.getEstado())) {
            return new AsientoResult(false, "El asiento #" + numeroAsiento + " no ha sido reservado. Debe reservarse primero.", asiento);
        }

        // Verificar que el cliente que confirma es el mismo que reservó
        if (!clienteCedula.equals(asiento.getClienteCedula())) {
            return new AsientoResult(false, "La cédula no coincide con la reserva. El asiento fue reservado por otro cliente.", asiento);
        }

        // Confirmar la compra
        asiento.setEstado("COMPRADO");
        asiento.setFacturaId(facturaId);
        asientoRepository.save(asiento);

        // Decrementar disponibilidad en la localidad
        Optional<LocalidadPartido> optLocalidad = localidadRepository.findByPartidoAndCodigoLocalidad(optPartido.get(), codigoLocalidad);
        if (optLocalidad.isPresent()) {
            LocalidadPartido lp = optLocalidad.get();
            if (lp.getDisponibilidad() > 0) {
                lp.setDisponibilidad(lp.getDisponibilidad() - 1);
                localidadRepository.save(lp);
            }
        }

        return new AsientoResult(true, "Asiento #" + numeroAsiento + " comprado exitosamente. Factura: " + facturaId, asiento);
    }

    /**
     * Libera un asiento reservado (el cliente cancela).
     */
    @Transactional
    public AsientoResult liberarAsiento(String codigoPartido, String codigoLocalidad,
                                        int numeroAsiento, String clienteCedula) {
        Optional<PartidoFutbol> optPartido = partidoRepository.findById(codigoPartido);
        if (optPartido.isEmpty()) {
            return new AsientoResult(false, "El partido con código " + codigoPartido + " no existe.", null);
        }

        Optional<Asiento> optAsiento = asientoRepository.findByPartidoAndCodigoLocalidadAndNumeroAsiento(
                optPartido.get(), codigoLocalidad, numeroAsiento);

        if (optAsiento.isEmpty()) {
            return new AsientoResult(false, "El asiento #" + numeroAsiento + " no existe.", null);
        }

        Asiento asiento = optAsiento.get();

        if ("LIBRE".equals(asiento.getEstado())) {
            return new AsientoResult(false, "El asiento #" + numeroAsiento + " ya está libre.", asiento);
        }

        if ("COMPRADO".equals(asiento.getEstado())) {
            return new AsientoResult(false, "El asiento #" + numeroAsiento + " ya fue comprado. No se puede liberar.", asiento);
        }

        // Verificar que el cliente que libera es el mismo que reservó
        if (!clienteCedula.equals(asiento.getClienteCedula())) {
            return new AsientoResult(false, "La cédula no coincide con la reserva.", asiento);
        }

        // Liberar
        asiento.setEstado("LIBRE");
        asiento.setClienteCedula(null);
        asiento.setClienteNombre(null);
        asiento.setFechaReserva(null);
        asientoRepository.save(asiento);

        return new AsientoResult(true, "Asiento #" + numeroAsiento + " liberado exitosamente.", asiento);
    }

    /**
     * Consulta el estado de todos los asientos de una localidad en un partido.
     */
    public List<Asiento> consultarAsientos(String codigoPartido, String codigoLocalidad) {
        Optional<PartidoFutbol> optPartido = partidoRepository.findById(codigoPartido);
        if (optPartido.isEmpty()) {
            return Collections.emptyList();
        }
        return asientoRepository.findByPartidoAndCodigoLocalidad(optPartido.get(), codigoLocalidad);
    }

    /**
     * Libera automáticamente reservas que hayan expirado (más de 10 minutos).
     */
    @Transactional
    public void liberarReservasExpiradas() {
        LocalDateTime expiracion = LocalDateTime.now().minusMinutes(MINUTOS_EXPIRACION_RESERVA);
        List<Asiento> expiradas = asientoRepository.findByEstadoAndFechaReservaBefore("RESERVADO", expiracion);
        for (Asiento a : expiradas) {
            a.setEstado("LIBRE");
            a.setClienteCedula(null);
            a.setClienteNombre(null);
            a.setFechaReserva(null);
            asientoRepository.save(a);
        }
    }

    // ===== HELPER CLASSES =====

    public static class DecrementResult {
        private final boolean success;
        private final String mensaje;

        public DecrementResult(boolean success, String mensaje) {
            this.success = success;
            this.mensaje = mensaje;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMensaje() {
            return mensaje;
        }
    }

    public static class AsientoResult {
        private final boolean success;
        private final String mensaje;
        private final Asiento asiento;

        public AsientoResult(boolean success, String mensaje, Asiento asiento) {
            this.success = success;
            this.mensaje = mensaje;
            this.asiento = asiento;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMensaje() {
            return mensaje;
        }

        public Asiento getAsiento() {
            return asiento;
        }
    }
}
