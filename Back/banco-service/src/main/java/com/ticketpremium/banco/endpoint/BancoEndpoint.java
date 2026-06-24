package com.ticketpremium.banco.endpoint;

import com.ticketpremium.banco.model.Amortizacion;
import com.ticketpremium.banco.service.BancoService;
import com.ticketpremium.soap.models.banco.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

@Endpoint
public class BancoEndpoint {

    private static final String NAMESPACE_URI = "http://ticketpremium.com/banco/ws";

    @Autowired
    private BancoService bancoService;

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "verificarSujetoCreditoRequest")
    @ResponsePayload
    public VerificarSujetoCreditoResponse verificarSujetoCredito(@RequestPayload VerificarSujetoCreditoRequest request) {
        VerificarSujetoCreditoResponse response = new VerificarSujetoCreditoResponse();
        BancoService.VerificationResult result = bancoService.verificarSujetoCredito(request.getCedula());
        response.setEsSujeto(result.isEsSujeto());
        response.setMensaje(result.getMensaje());
        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "obtenerMontoMaximoRequest")
    @ResponsePayload
    public ObtenerMontoMaximoResponse obtenerMontoMaximo(@RequestPayload ObtenerMontoMaximoRequest request) {
        ObtenerMontoMaximoResponse response = new ObtenerMontoMaximoResponse();
        double amount = bancoService.obtenerMontoMaximo(request.getCedula());
        response.setMontoMaximo(amount);
        if (amount > 0) {
            response.setMensaje("Monto máximo de crédito aprobado: $" + amount);
        } else {
            response.setMensaje("No califica para crédito o capacidad de pago nula.");
        }
        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "registrarCreditoAmortizacionRequest")
    @ResponsePayload
    public RegistrarCreditoAmortizacionResponse registrarCredito(@RequestPayload RegistrarCreditoAmortizacionRequest request) {
        RegistrarCreditoAmortizacionResponse response = new RegistrarCreditoAmortizacionResponse();
        BancoService.LoanResult result = bancoService.registrarCreditoAmortizacion(
                request.getCedula(),
                request.getMonto(),
                request.getPlazoMeses()
        );

        response.setAprobado(result.isAprobado());
        response.setMensaje(result.getMensaje());

        for (Amortizacion a : result.getTablaAmortizacion()) {
            Cuota cuotaSoap = new Cuota();
            cuotaSoap.setNumeroCuota(a.getNumCuota());
            cuotaSoap.setValorCuota(a.getValorCuota());
            cuotaSoap.setInteresPagado(a.getInteresPagado());
            cuotaSoap.setCapitalPagado(a.getCapitalPagado());
            cuotaSoap.setSaldo(a.getSaldoRestante());
            response.getTablaAmortizacion().add(cuotaSoap);
        }

        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "loginRequest")
    @ResponsePayload
    public LoginResponse login(@RequestPayload LoginRequest request) {
        LoginResponse response = new LoginResponse();
        BancoService.LoginResult result = bancoService.login(request.getUsuario(), request.getContrasena());
        response.setAutenticado(result.isAutenticado());
        response.setMensaje(result.getMensaje());
        if (result.getRol() != null) {
            response.setRol(result.getRol());
        }
        return response;
    }
}
