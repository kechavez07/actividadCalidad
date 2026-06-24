# SOAP Services Backend - Ticket Premium FIFA 2026

Este repositorio contiene la implementación del backend de servicios web SOAP para el proyecto **Ticket Premium FIFA 2026**, desarrollado en **Java 21**, **Spring Boot 3** y persistido en **PostgreSQL 16** mediante contenedores Docker.

---

## 🚀 Despliegue del Proyecto

Los servicios y la base de datos se despliegan de manera automatizada utilizando **Docker Compose**.

### 1. Recompilar el Proyecto
Para generar los empaquetados ejecutables Spring Boot de los servicios, ejecuta:
```bash
mvn clean package -DskipTests
```

### 2. Iniciar los Contenedores
Para levantar la base de datos y los microservicios en segundo plano:
```bash
echo "arquitectura" | sudo -S docker compose up --build -d
```

### 3. Detener y Limpiar el Estado
Si deseas reiniciar la base de datos con las semillas de prueba limpias, elimina los contenedores y volúmenes con:
```bash
echo "arquitectura" | sudo -S docker compose down -v
```

---

## 📡 Puertos y Rutas de los Servicios SOAP

Los puertos del host han sido configurados para evitar colisiones con servicios comunes (Jenkins y cAdvisor) en el servidor.

### 1. Core Bancario y Crédito (`banco-service`)
*   **Contrato WSDL (Local):** `http://localhost:18081/ws/banco.wsdl`
*   **Contrato WSDL (Online / Remoto):** `http://209.145.48.25:18081/ws/banco.wsdl`
*   **URL de Consumo (POST):** `http://209.145.48.25:18081/ws`
*   **Target Namespace:** `http://ticketpremium.com/banco/ws`

### 2. Federación de Fútbol (`federacion-service`)
*   **Contrato WSDL (Local):** `http://localhost:18082/ws/federacion.wsdl`
*   **Contrato WSDL (Online / Remoto):** `http://209.145.48.25:18082/ws/federacion.wsdl`
*   **URL de Consumo (POST):** `http://209.145.48.25:18082/ws`
*   **Target Namespace:** `http://ticketpremium.com/federacion/ws`

---

## 📑 Catálogo de Endpoints y XML de Consumo

### 1. Endpoints de Core Bancario (`banco-service`)

#### A. Verificar Sujeto de Crédito (`verificarSujetoCreditoRequest`)
*   **Uso:** Valida si un solicitante es elegible para adquirir boletos a crédito directo.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:verificarSujetoCreditoRequest>
         <ws:cedula>1712345678</ws:cedula>
      </ws:verificarSujetoCreditoRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

#### B. Obtener Monto Máximo de Crédito (`obtenerMontoMaximoRequest`)
*   **Uso:** Retorna el cupo de crédito máximo autorizado para el cliente según el promedio de movimientos de los últimos 3 meses.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:obtenerMontoMaximoRequest>
         <ws:cedula>1712345678</ws:cedula>
      </ws:obtenerMontoMaximoRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

#### C. Registrar Crédito y Tabla de Amortización (`registrarCreditoAmortizacionRequest`)
*   **Uso:** Contrata el crédito, lo guarda en la base de datos y genera las cuotas mensuales de amortización (cuota fija, 16.5% tasa anual).
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:registrarCreditoAmortizacionRequest>
         <ws:cedula>1712345678</ws:cedula>
         <ws:monto>450.00</ws:monto>
         <ws:plazoMeses>6</ws:plazoMeses>
      </ws:registrarCreditoAmortizacionRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

#### D. Login de Usuario (`loginRequest`)
*   **Uso:** Autentica un usuario en el sistema. Credenciales por defecto: `MONSTER` / `MONSTER9`.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:loginRequest>
         <ws:usuario>MONSTER</ws:usuario>
         <ws:contrasena>MONSTER9</ws:contrasena>
      </ws:loginRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

---

### 2. Endpoints de Federación de Fútbol (`federacion-service`)

#### A. Listar Partidos Disponibles (`getPartidosDisponiblesRequest`)
*   **Uso:** Lista todos los encuentros oficiales de FIFA 2026 cuya fecha sea igual o posterior a la hora actual.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:getPartidosDisponiblesRequest/>
   </soapenv:Body>
</soapenv:Envelope>
```

#### B. Obtener Localidades por Partido (`getLocalidadesPorPartidoRequest`)
*   **Uso:** Lista las localidades habilitadas, su disponibilidad y su precio unitario para un partido.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:getLocalidadesPorPartidoRequest>
         <ws:codigoPartido>ARG-AUS</ws:codigoPartido>
      </ws:getLocalidadesPorPartidoRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

#### C. Decrementar Disponibilidad (`decrementarDisponibilidadRequest`)
*   **Uso:** Decrementa el inventario de boletos disponibles en una localidad tras realizar una compra.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:decrementarDisponibilidadRequest>
         <ws:codigoPartido>ARG-AUS</ws:codigoPartido>
         <ws:codigoLocalidad>PALCO</ws:codigoLocalidad>
         <ws:cantidad>1</ws:cantidad>
      </ws:decrementarDisponibilidadRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

#### D. Reservar Asiento (`reservarAsientoRequest`)
*   **Uso:** Reserva un asiento específico para un cliente. Impide que dos personas reserven el mismo asiento. La reserva expira en 10 minutos si no se confirma la compra.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:reservarAsientoRequest>
         <ws:codigoPartido>ARG-AUS</ws:codigoPartido>
         <ws:codigoLocalidad>PALCO</ws:codigoLocalidad>
         <ws:numeroAsiento>1</ws:numeroAsiento>
         <ws:clienteCedula>1712345678</ws:clienteCedula>
         <ws:clienteNombre>Juan Perez</ws:clienteNombre>
      </ws:reservarAsientoRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

#### E. Confirmar Compra de Asiento (`confirmarCompraAsientoRequest`)
*   **Uso:** Confirma la compra de un asiento previamente reservado. Cambia el estado de RESERVADO a COMPRADO y decrementa la disponibilidad general.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:confirmarCompraAsientoRequest>
         <ws:codigoPartido>ARG-AUS</ws:codigoPartido>
         <ws:codigoLocalidad>PALCO</ws:codigoLocalidad>
         <ws:numeroAsiento>1</ws:numeroAsiento>
         <ws:clienteCedula>1712345678</ws:clienteCedula>
         <ws:facturaId>FACT-001</ws:facturaId>
      </ws:confirmarCompraAsientoRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

#### F. Liberar Asiento / Cancelar Reserva (`liberarAsientoRequest`)
*   **Uso:** Libera un asiento reservado (el cliente cancela). Solo funciona con asientos en estado RESERVADO.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:liberarAsientoRequest>
         <ws:codigoPartido>ARG-AUS</ws:codigoPartido>
         <ws:codigoLocalidad>PALCO</ws:codigoLocalidad>
         <ws:numeroAsiento>1</ws:numeroAsiento>
         <ws:clienteCedula>1712345678</ws:clienteCedula>
      </ws:liberarAsientoRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

#### G. Consultar Asientos por Localidad (`consultarAsientosRequest`)
*   **Uso:** Consulta el estado de todos los asientos de una localidad en un partido. Muestra: LIBRE, RESERVADO o COMPRADO, con datos del cliente y factura si aplica.
*   **XML Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:consultarAsientosRequest>
         <ws:codigoPartido>ARG-AUS</ws:codigoPartido>
         <ws:codigoLocalidad>PALCO</ws:codigoLocalidad>
      </ws:consultarAsientosRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

---

## 👥 Datos de Referencia Sembrados para Pruebas

### Clientes y Reglas del Banco (Cédulas de Prueba)

1.  **Cédula `1712345678` (Juan Perez)**: Hombre, 28 años, con depósitos recientes y sin deudas.
    *   *Verificar Crédito:* **APTO (true)**
    *   *Monto Máximo Aprobado:* **$1100.00**
2.  **Cédula `1712345679` (Pedro Gomez)**: Hombre, 20 años.
    *   *Verificar Crédito:* **RECHAZADO (false)** - *Motivo: Los solicitantes hombres deben tener al menos 25 años.*
3.  **Cédula `1712345680` (Maria Lopez)**: Mujer, 22 años, con depósitos recientes.
    *   *Verificar Crédito:* **APTA (true)** - *Nota: La restricción de edad de 25 años solo aplica a género masculino.*
4.  **Cédula `1712345681` (Carlos Ruiz)**: Hombre, 30 años, pero posee un crédito activo vigente.
    *   *Verificar Crédito:* **RECHAZADO (false)** - *Motivo: Posee un crédito activo.*
5.  **Cédula `1712345682` (Luis Torres)**: Hombre, 35 años, sin depósitos registrados en el último mes.
    *   *Verificar Crédito:* **RECHAZADO (false)** - *Motivo: Debe poseer al menos un depósito reciente.*

### Partidos de Fútbol Sembrados (Códigos de Prueba)

*   `ARG-AUS` (Argentina vs Australia)
*   `POR-UZB` (Portugal vs Uzbekistán)
*   `ENG-GHA` (Inglaterra vs Ghana)
*   `COL-REP` (Colombia vs Repechaje 1)
*   `URU-ESP` (Uruguay vs España)
*   `FINAL-2026` (Final FIFA 2026)

---

## 💻 Ejemplos de Consumo con Curl (Online)

Puedes probar los servicios desde tu máquina local usando los siguientes comandos de terminal:

### A. Consultar Partidos Disponibles (Federación)
```bash
curl -X POST -H "Content-Type: text/xml" -d '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws"><soapenv:Header/><soapenv:Body><ws:getPartidosDisponiblesRequest/></soapenv:Body></soapenv:Envelope>' http://209.145.48.25:18082/ws
```

### B. Verificar Sujeto de Crédito - Apto (Banco)
```bash
curl -X POST -H "Content-Type: text/xml" -d '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws"><soapenv:Header/><soapenv:Body><ws:verificarSujetoCreditoRequest><ws:cedula>1712345678</ws:cedula></ws:verificarSujetoCreditoRequest></soapenv:Body></soapenv:Envelope>' http://209.145.48.25:18081/ws
```

### C. Verificar Sujeto de Crédito - Rechazado por Edad (Banco)
```bash
curl -X POST -H "Content-Type: text/xml" -d '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws"><soapenv:Header/><soapenv:Body><ws:verificarSujetoCreditoRequest><ws:cedula>1712345679</ws:cedula></ws:verificarSujetoCreditoRequest></soapenv:Body></soapenv:Envelope>' http://209.145.48.25:18081/ws
```
*   *(Nota: Partidos en el pasado como `MX-ZAF` fueron sembrados en la base de datos pero se excluyen de la consulta de disponibles de acuerdo con las reglas).*
