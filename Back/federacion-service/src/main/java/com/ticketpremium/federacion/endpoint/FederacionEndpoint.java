package com.ticketpremium.federacion.endpoint;

import com.ticketpremium.federacion.model.Asiento;
import com.ticketpremium.federacion.model.LocalidadPartido;
import com.ticketpremium.federacion.model.PartidoFutbol;
import com.ticketpremium.federacion.service.FederacionService;
import com.ticketpremium.soap.models.federacion.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Endpoint
public class FederacionEndpoint {

    private static final String NAMESPACE_URI = "http://ticketpremium.com/federacion/ws";

    @Autowired
    private FederacionService federacionService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getPartidosDisponiblesRequest")
    @ResponsePayload
    public GetPartidosDisponiblesResponse getPartidosDisponibles(@RequestPayload GetPartidosDisponiblesRequest request) {
        GetPartidosDisponiblesResponse response = new GetPartidosDisponiblesResponse();
        List<PartidoFutbol> partidos = federacionService.getPartidosDisponibles();

        for (PartidoFutbol p : partidos) {
            PartidoSoap pSoap = new PartidoSoap();
            pSoap.setCodigo(p.getCodigo());
            pSoap.setEquipoLocal(p.getEquipoLocal());
            pSoap.setEquipoVisita(p.getEquipoVisita());
            pSoap.setFecha(p.getFecha().format(DATE_FORMATTER));
            pSoap.setLugar(p.getLugar());
            response.getPartidos().add(pSoap);
        }

        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getLocalidadesPorPartidoRequest")
    @ResponsePayload
    public GetLocalidadesPorPartidoResponse getLocalidadesPorPartido(@RequestPayload GetLocalidadesPorPartidoRequest request) {
        GetLocalidadesPorPartidoResponse response = new GetLocalidadesPorPartidoResponse();
        List<LocalidadPartido> localidades = federacionService.getLocalidadesPorPartido(request.getCodigoPartido());

        for (LocalidadPartido lp : localidades) {
            LocalidadPartidoSoap lpSoap = new LocalidadPartidoSoap();
            lpSoap.setCodigoLocalidad(lp.getCodigoLocalidad());
            lpSoap.setDisponibilidad(lp.getDisponibilidad());
            lpSoap.setPrecio(lp.getPrecio());
            response.getLocalidades().add(lpSoap);
        }

        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "decrementarDisponibilidadRequest")
    @ResponsePayload
    public DecrementarDisponibilidadResponse decrementarDisponibilidad(@RequestPayload DecrementarDisponibilidadRequest request) {
        DecrementarDisponibilidadResponse response = new DecrementarDisponibilidadResponse();
        FederacionService.DecrementResult result = federacionService.decrementarDisponibilidad(
                request.getCodigoPartido(),
                request.getCodigoLocalidad(),
                request.getCantidad()
        );
        response.setSuccess(result.isSuccess());
        response.setMensaje(result.getMensaje());
        return response;
    }

    // ===== ENDPOINTS DE RESERVA DE ASIENTOS =====

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "reservarAsientoRequest")
    @ResponsePayload
    public ReservarAsientoResponse reservarAsiento(@RequestPayload ReservarAsientoRequest request) {
        ReservarAsientoResponse response = new ReservarAsientoResponse();
        FederacionService.AsientoResult result = federacionService.reservarAsiento(
                request.getCodigoPartido(),
                request.getCodigoLocalidad(),
                request.getNumeroAsiento(),
                request.getClienteCedula(),
                request.getClienteNombre()
        );
        response.setSuccess(result.isSuccess());
        response.setMensaje(result.getMensaje());
        if (result.getAsiento() != null) {
            response.setAsiento(mapAsientoToSoap(result.getAsiento()));
        }
        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "confirmarCompraAsientoRequest")
    @ResponsePayload
    public ConfirmarCompraAsientoResponse confirmarCompraAsiento(@RequestPayload ConfirmarCompraAsientoRequest request) {
        ConfirmarCompraAsientoResponse response = new ConfirmarCompraAsientoResponse();
        FederacionService.AsientoResult result = federacionService.confirmarCompraAsiento(
                request.getCodigoPartido(),
                request.getCodigoLocalidad(),
                request.getNumeroAsiento(),
                request.getClienteCedula(),
                request.getFacturaId()
        );
        response.setSuccess(result.isSuccess());
        response.setMensaje(result.getMensaje());
        if (result.getAsiento() != null) {
            response.setAsiento(mapAsientoToSoap(result.getAsiento()));
        }
        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "liberarAsientoRequest")
    @ResponsePayload
    public LiberarAsientoResponse liberarAsiento(@RequestPayload LiberarAsientoRequest request) {
        LiberarAsientoResponse response = new LiberarAsientoResponse();
        FederacionService.AsientoResult result = federacionService.liberarAsiento(
                request.getCodigoPartido(),
                request.getCodigoLocalidad(),
                request.getNumeroAsiento(),
                request.getClienteCedula()
        );
        response.setSuccess(result.isSuccess());
        response.setMensaje(result.getMensaje());
        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "consultarAsientosRequest")
    @ResponsePayload
    public ConsultarAsientosResponse consultarAsientos(@RequestPayload ConsultarAsientosRequest request) {
        ConsultarAsientosResponse response = new ConsultarAsientosResponse();
        List<Asiento> asientos = federacionService.consultarAsientos(
                request.getCodigoPartido(),
                request.getCodigoLocalidad()
        );
        for (Asiento a : asientos) {
            response.getAsientos().add(mapAsientoToSoap(a));
        }
        return response;
    }

    // ===== HELPER =====

    private AsientoSoap mapAsientoToSoap(Asiento asiento) {
        AsientoSoap soap = new AsientoSoap();
        soap.setNumeroAsiento(asiento.getNumeroAsiento());
        soap.setCodigoLocalidad(asiento.getCodigoLocalidad());
        soap.setEstado(asiento.getEstado());
        if (asiento.getClienteCedula() != null) {
            soap.setClienteCedula(asiento.getClienteCedula());
        }
        if (asiento.getClienteNombre() != null) {
            soap.setClienteNombre(asiento.getClienteNombre());
        }
        if (asiento.getFacturaId() != null) {
            soap.setFacturaId(asiento.getFacturaId());
        }
        return soap;
    }
}
