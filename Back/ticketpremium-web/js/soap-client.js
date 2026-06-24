/**
 * Utilidades para construir y consumir endpoints SOAP mediante Fetch API
 */

const BANCO_WS = '/api/banco/';
const FEDERACION_WS = '/api/federacion/';

class SoapClient {
    
    // Función genérica para enviar peticiones SOAP
    static async sendRequest(url, xmlBody) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml',
                },
                body: xmlBody
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const textResponse = await response.text();
            return this.parseXML(textResponse);
        } catch (error) {
            console.error("SOAP Request Error:", error);
            throw error;
        }
    }

    // Parsea string XML a DOM Object
    static parseXML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        // Revisar si hay un fault
        const fault = xmlDoc.getElementsByTagName("SOAP-ENV:Fault")[0] || xmlDoc.getElementsByTagName("env:Fault")[0];
        if (fault) {
            const faultString = fault.getElementsByTagName("faultstring")[0]?.textContent;
            throw new Error(`SOAP Fault: ${faultString}`);
        }
        
        return xmlDoc;
    }

    // Helper para obtener texto de un nodo de manera segura
    static getNodeText(doc, tagName) {
        const nodes = doc.getElementsByTagNameNS("*", tagName);
        if (nodes.length > 0) return nodes[0].textContent;
        // fallback por si el namespace falla
        const nodesNoNs = doc.getElementsByTagName(tagName);
        return nodesNoNs.length > 0 ? nodesNoNs[0].textContent : null;
    }

    // ==========================================
    // ENDPOINTS BANCO
    // ==========================================

    static async login(usuario, contrasena) {
        const xml = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
               <soapenv:Header/>
               <soapenv:Body>
                  <ws:loginRequest>
                     <ws:usuario>${usuario}</ws:usuario>
                     <ws:contrasena>${contrasena}</ws:contrasena>
                  </ws:loginRequest>
               </soapenv:Body>
            </soapenv:Envelope>`;
            
        const doc = await this.sendRequest(BANCO_WS, xml);
        return {
            autenticado: this.getNodeText(doc, 'autenticado') === 'true',
            mensaje: this.getNodeText(doc, 'mensaje'),
            rol: this.getNodeText(doc, 'rol')
        };
    }

    static async verificarSujetoCredito(cedula) {
        const xml = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
               <soapenv:Header/>
               <soapenv:Body>
                  <ws:verificarSujetoCreditoRequest>
                     <ws:cedula>${cedula}</ws:cedula>
                  </ws:verificarSujetoCreditoRequest>
               </soapenv:Body>
            </soapenv:Envelope>`;
            
        const doc = await this.sendRequest(BANCO_WS, xml);
        return {
            aptoParaCredito: this.getNodeText(doc, 'aptoParaCredito') === 'true',
            mensaje: this.getNodeText(doc, 'mensaje')
        };
    }

    static async obtenerMontoMaximo(cedula) {
        const xml = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
               <soapenv:Header/>
               <soapenv:Body>
                  <ws:obtenerMontoMaximoRequest>
                     <ws:cedula>${cedula}</ws:cedula>
                  </ws:obtenerMontoMaximoRequest>
               </soapenv:Body>
            </soapenv:Envelope>`;
            
        const doc = await this.sendRequest(BANCO_WS, xml);
        return {
            montoMaximoAprobado: parseFloat(this.getNodeText(doc, 'montoMaximoAprobado') || 0)
        };
    }

    static async registrarCreditoAmortizacion(cedula, monto, plazoMeses) {
        const xml = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
               <soapenv:Header/>
               <soapenv:Body>
                  <ws:registrarCreditoAmortizacionRequest>
                     <ws:cedula>${cedula}</ws:cedula>
                     <ws:monto>${monto}</ws:monto>
                     <ws:plazoMeses>${plazoMeses}</ws:plazoMeses>
                  </ws:registrarCreditoAmortizacionRequest>
               </soapenv:Body>
            </soapenv:Envelope>`;
            
        const doc = await this.sendRequest(BANCO_WS, xml);
        
        const cuotasNodes = doc.getElementsByTagNameNS("*", "tablaAmortizacion");
        const fallbackNodes = doc.getElementsByTagName("tablaAmortizacion");
        const list = cuotasNodes.length > 0 ? cuotasNodes : fallbackNodes;
        
        const cuotas = Array.from(list).map(node => ({
            numeroCuota: parseInt(this.getNodeText(node, 'numeroCuota')),
            valorCuota: parseFloat(this.getNodeText(node, 'valorCuota')),
            interesPagado: parseFloat(this.getNodeText(node, 'interesPagado')),
            capitalPagado: parseFloat(this.getNodeText(node, 'capitalPagado')),
            saldo: parseFloat(this.getNodeText(node, 'saldo'))
        }));

        return {
            aprobado: this.getNodeText(doc, 'aprobado') === 'true',
            mensaje: this.getNodeText(doc, 'mensaje'),
            tablaAmortizacion: cuotas
        };
    }

    // ==========================================
    // ENDPOINTS FEDERACION
    // ==========================================

    static async getPartidosDisponibles() {
        const xml = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
               <soapenv:Header/>
               <soapenv:Body>
                  <ws:getPartidosDisponiblesRequest/>
               </soapenv:Body>
            </soapenv:Envelope>`;
            
        const doc = await this.sendRequest(FEDERACION_WS, xml);
        
        const nodes = doc.getElementsByTagNameNS("*", "partidos");
        const fallbackNodes = doc.getElementsByTagName("partidos");
        const list = nodes.length > 0 ? nodes : fallbackNodes;

        return Array.from(list).map(node => ({
            codigo: this.getNodeText(node, 'codigo'),
            equipoLocal: this.getNodeText(node, 'equipoLocal'),
            equipoVisita: this.getNodeText(node, 'equipoVisita'),
            fecha: this.getNodeText(node, 'fecha'),
            lugar: this.getNodeText(node, 'lugar')
        }));
    }

    static async consultarAsientos(codigoPartido, codigoLocalidad) {
        const xml = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
               <soapenv:Header/>
               <soapenv:Body>
                  <ws:consultarAsientosRequest>
                     <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
                     <ws:codigoLocalidad>${codigoLocalidad}</ws:codigoLocalidad>
                  </ws:consultarAsientosRequest>
               </soapenv:Body>
            </soapenv:Envelope>`;
            
        const doc = await this.sendRequest(FEDERACION_WS, xml);
        
        const nodes = doc.getElementsByTagNameNS("*", "asientos");
        const fallbackNodes = doc.getElementsByTagName("asientos");
        const list = nodes.length > 0 ? nodes : fallbackNodes;

        return Array.from(list).map(node => ({
            numeroAsiento: parseInt(this.getNodeText(node, 'numeroAsiento')),
            codigoLocalidad: this.getNodeText(node, 'codigoLocalidad'),
            estado: this.getNodeText(node, 'estado'),
            clienteCedula: this.getNodeText(node, 'clienteCedula'),
            clienteNombre: this.getNodeText(node, 'clienteNombre'),
            facturaId: this.getNodeText(node, 'facturaId')
        }));
    }

    static async reservarAsiento(codigoPartido, codigoLocalidad, numeroAsiento, clienteCedula, clienteNombre) {
        const xml = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
               <soapenv:Header/>
               <soapenv:Body>
                  <ws:reservarAsientoRequest>
                     <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
                     <ws:codigoLocalidad>${codigoLocalidad}</ws:codigoLocalidad>
                     <ws:numeroAsiento>${numeroAsiento}</ws:numeroAsiento>
                     <ws:clienteCedula>${clienteCedula}</ws:clienteCedula>
                     <ws:clienteNombre>${clienteNombre}</ws:clienteNombre>
                  </ws:reservarAsientoRequest>
               </soapenv:Body>
            </soapenv:Envelope>`;
            
        const doc = await this.sendRequest(FEDERACION_WS, xml);
        return {
            success: this.getNodeText(doc, 'success') === 'true',
            mensaje: this.getNodeText(doc, 'mensaje')
        };
    }

    static async confirmarCompraAsiento(codigoPartido, codigoLocalidad, numeroAsiento, clienteCedula, facturaId) {
        const xml = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
               <soapenv:Header/>
               <soapenv:Body>
                  <ws:confirmarCompraAsientoRequest>
                     <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
                     <ws:codigoLocalidad>${codigoLocalidad}</ws:codigoLocalidad>
                     <ws:numeroAsiento>${numeroAsiento}</ws:numeroAsiento>
                     <ws:clienteCedula>${clienteCedula}</ws:clienteCedula>
                     <ws:facturaId>${facturaId}</ws:facturaId>
                  </ws:confirmarCompraAsientoRequest>
               </soapenv:Body>
            </soapenv:Envelope>`;
            
        const doc = await this.sendRequest(FEDERACION_WS, xml);
        return {
            success: this.getNodeText(doc, 'success') === 'true',
            mensaje: this.getNodeText(doc, 'mensaje')
        };
    }

    static async liberarAsiento(codigoPartido, codigoLocalidad, numeroAsiento, clienteCedula) {
        const xml = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
               <soapenv:Header/>
               <soapenv:Body>
                  <ws:liberarAsientoRequest>
                     <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
                     <ws:codigoLocalidad>${codigoLocalidad}</ws:codigoLocalidad>
                     <ws:numeroAsiento>${numeroAsiento}</ws:numeroAsiento>
                     <ws:clienteCedula>${clienteCedula}</ws:clienteCedula>
                  </ws:liberarAsientoRequest>
               </soapenv:Body>
            </soapenv:Envelope>`;
            
        const doc = await this.sendRequest(FEDERACION_WS, xml);
        return {
            success: this.getNodeText(doc, 'success') === 'true',
            mensaje: this.getNodeText(doc, 'mensaje')
        };
    }
}
