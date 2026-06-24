# Proyecto Práctico Ticket Premium - FIFA 2026

## 1. Contexto general

La empresa intermediadora **TicketPremium** comercializa boletos para espectáculos deportivos, principalmente partidos de fútbol.

La **Federación Internacional de Fútbol FIFA** contrató a la empresa **TicketPremium** para manejar la venta de boletos de todos los partidos del campeonato mundial de fútbol a desarrollarse en el año **2026** en tres países sede: **Estados Unidos, Canadá y México**.

Para la comercialización de boletos, TicketPremium se conecta mediante un **servicio web** con la Federación Internacional de Fútbol, con el objetivo de obtener información referente a:

- Encuentros deportivos.
- Precios.
- Disponibilidad de cada localidad.

Los partidos de fútbol, de acuerdo con el estadio donde se realizan y los equipos que juegan, ofertan diferentes tipos de localidades.

---

## 2. Aplicación "Federación de Fútbol"

La aplicación de la Federación de Fútbol debe funcionar como un sistema independiente que expone servicios web para que TicketPremium pueda consultar partidos, consultar localidades y actualizar disponibilidad.

### 2.1. Tabla `PARTIDO_FUTBOL`

Se debe implementar la tabla `PARTIDO_FUTBOL`, la cual contendrá los siguientes campos:

| Campo | Descripción |
|---|---|
| `CODIGO` | Código identificador de un espectáculo. |
| `EQUIPO_LOCAL` | Nombre del equipo local. |
| `EQUIPO_VISITA` | Nombre del equipo visitante. |
| `FECHA` | Fecha y hora de realización del partido de fútbol. |
| `LUGAR` | Descripción del lugar donde se realizará el partido. |

### 2.2. Tabla `LOCALIDAD_PARTIDO`

Se debe implementar la tabla `LOCALIDAD_PARTIDO`. Esta tabla se utiliza para definir la disponibilidad y costo de cada una de las diferentes localidades para un partido determinado.

Columnas principales:

| Campo | Descripción |
|---|---|
| `CODIGO_LOCALIDAD` | Código identificador de la localidad. Ejemplos: `PALCO`, `TRIBUNA`, `GENERAL`, `GENERAL_VISITA`, etc. |
| `DISPONIBILIDAD` | Número de boletos disponibles para esa localidad. |
| `PRECIO` | Precio unitario de cada localidad. |

> Nota: las tablas `PARTIDO_FUTBOL` y `LOCALIDAD_PARTIDO` deben estar relacionadas.

### 2.3. Web Service: partidos disponibles

Se debe implementar un Web Service que despliegue los partidos de fútbol disponibles.

Condición para considerar un partido disponible:

```text
FECHA >= fecha actual
```

### 2.4. Web Service: localidades disponibles por partido

Se debe implementar un Web Service que despliegue las diferentes localidades con su respectivo precio.

Reglas:

- Solo se deben desplegar localidades cuya `DISPONIBILIDAD` sea mayor a cero.
- El Web Service debe recibir como parámetro el código del partido para el cual se desea obtener las localidades.

### 2.5. Web Service: decremento de disponibilidad

Se debe implementar un Web Service que decremente el valor de `DISPONIBILIDAD`.

Este Web Service será invocado cuando el cliente compre un boleto de determinada localidad.

---

## 3. Aplicación Web "TicketPremium"

La aplicación TicketPremium debe consumir los servicios web expuestos por la aplicación Federación de Fútbol.

### 3.1. Despliegue de partidos disponibles

Debe existir una funcionalidad para desplegar los partidos de fútbol disponibles.

Para esto se debe crear un cliente de:

- Consola.
- Escritorio.
- Web.
- Móvil.

Cada cliente debe invocar el Web Service especificado en la sección **2.3**.

### 3.2. Despliegue de localidades por espectáculo

Debe existir una funcionalidad que despliegue las localidades con su respectivo precio para el espectáculo seleccionado en la funcionalidad anterior.

### 3.3. Registro de compra y generación de factura

Debe existir una funcionalidad que registre la compra de boletos y genere la factura final de acuerdo con la selección del usuario.

Consideraciones:

- Se debe incluir el valor de **IVA** en la factura.
- Se puede comprar boletos para varios partidos.
- Se pueden comprar varias localidades por partido.

### 3.4. Reporte: resumen de ventas de un partido

Se debe generar un reporte denominado **"Resumen de Ventas de un Partido"**.

El reporte debe presentar de forma resumida la información de ventas realizadas.

Ejemplo:

```text
Partido: Equipo A vs Equipo B
Fecha: 11-Abril-2015
```

| Localidad | Vendidos | Total recaudado |
|---|---:|---:|
| GENERAL | 1456 | 8500 |
| TRIBUNA | 300 | 6000 |
| PALCO | 50 | 1500 |

> Nota: para el diseño del reporte puede realizarse una interfaz web simple que presente la tabla de resultados. No es necesario programar impresión, exportación ni utilizar herramientas especializadas de generación de reportes.

---

## 4. Sistema de la Comercializadora de Localidades

Para este sistema se debe definir un modelo de datos que permita realizar la facturación de la venta de localidades a los diferentes partidos.

El sistema de facturación debe realizar el CRUD usando el patrón arquitectónico **Modelo Vista Controlador (MVC)** para las diferentes tablas necesarias, entre ellas:

- Países.
- Estadios.
- Localidades.
- Partidos.
- Clientes.

### 4.1. Formas de pago

El sistema debe permitir dos formas de pago:

1. **Efectivo**.
2. **Crédito Directo**.

#### Pago en efectivo

Para compras en efectivo se debe aplicar un descuento del **12%** sobre el precio de venta.

#### Pago con crédito directo

Cuando la forma de pago seleccionada sea **Crédito Directo**, el sistema debe invocar un servicio web para saber si el comprador es sujeto de crédito.

Si la respuesta es positiva y el valor de la compra es menor o igual que el crédito máximo aprobado, se procede a realizar la facturación.

> Observación del documento original: en esta parte se menciona "el valor del teléfono que desea comprar", pero por contexto del proyecto debe interpretarse como el valor de la compra de partidos/localidades.

---

## 5. Módulo de Crédito

El módulo de crédito debe permitir verificar si una persona es sujeto o no de crédito.

Si la persona es sujeto de crédito, se debe verificar adicionalmente el monto máximo de crédito autorizado.

Si el precio de la compra de partidos y localidades por partido es menor o igual al monto máximo aprobado, el módulo debe aprobar automáticamente la transacción y registrar la respectiva tabla de amortización del préstamo.

### 5.1. Reglas para verificar si una persona es sujeto de crédito

Para verificar si una persona es sujeto de crédito se deben aplicar las siguientes reglas:

1. Verificar si el solicitante es cliente de la empresa que comercializa los partidos con sus localidades.
2. Verificar que el cliente posea al menos una transacción de depósito en el último mes.
3. Verificar que el cliente no sea menor de **25 años** si su género es masculino.
4. Verificar que el cliente actualmente no tenga un crédito activo en el banco.

### 5.2. Reglas para obtener el monto máximo del crédito

Para obtener el monto máximo del crédito se deben aplicar las siguientes reglas:

1. Obtener el promedio de todos los depósitos de los últimos 3 meses.
2. Obtener el promedio de todos los retiros de los últimos 3 meses.
3. El monto máximo del crédito será un porcentaje de la diferencia entre el promedio de depósitos y el promedio de retiros, multiplicado por 6.

El documento contiene dos valores distintos para el porcentaje:

- Texto: **35%** de la diferencia.
- Fórmula escrita: **30%**.

Fórmula indicada en el documento:

```text
((Promedio Depósitos - Promedio Retiros) * 30%) * 6
```

> Observación importante para implementación: se debe confirmar con el docente si el porcentaje correcto es 35% o 30%.

### 5.3. Condiciones para crear la tabla de amortización

Si el crédito es aprobado, se debe crear la tabla de amortización considerando lo siguiente:

1. El tipo de crédito es de **cuota fija**; todos los meses se debe pagar la misma cuota.
2. El pago de cada cuota es mensual.
3. El cliente escoge el plazo del crédito.
4. El plazo debe ser mayor o igual a **3 meses** y menor o igual a **18 meses**.
5. La tasa de interés es del **16.5% anual**.

### 5.4. Fórmula para calcular la cuota fija

Para calcular la cuota fija de pago se debe utilizar la siguiente fórmula:

```text
                 Valor LocalidadesPorPartido
Cuota = --------------------------------------------------
        1 - ((1 + TasaPeriodo) ^ -NumeroCuotas)
        --------------------------------------------------
                          TasaPeriodo
```

Otra forma equivalente de expresar la fórmula es:

```text
Cuota = ValorLocalidadesPorPartido / ((1 - (1 + TasaPeriodo)^(-NumeroCuotas)) / TasaPeriodo)
```

Donde:

```text
TasaPeriodo = 16.5% / 12
```

También se puede comprobar el valor usando la función `PAGO` de Excel.

### 5.5. Formato de tabla de amortización

La tabla de amortización debe tener el siguiente formato:

| # Cuota | Valor Cuota | Interés Pagado | Capital Pagado | Saldo |
|---:|---:|---:|---:|---:|
|  |  |  |  |  |

La tabla de amortización debe reflejar todas las cuotas que el cliente pagará para cancelar la totalidad del crédito más los intereses generados.

### 5.6. Ejemplo de tabla de amortización

Datos de ejemplo del documento:

| Concepto | Valor |
|---|---:|
| Valor préstamo | 450 |
| Cuotas | 6 |
| Tasa interés anual | 16.50% |
| Cuota | 78.65 |

Tabla de ejemplo:

| # Cuota | Valor Cuota | Interés Pagado | Capital Pagado | Saldo |
|---:|---:|---:|---:|---:|
| 0 |  |  |  | 450.00 |
| 1 | 78.65 | 6.19 | 72.46 | 377.54 |
| 2 | 78.65 | 5.19 | 73.46 | 304.08 |
| 3 | 78.65 | 4.18 | 74.47 | 229.61 |
| 4 | 78.65 | 3.16 | 75.49 | 154.12 |
| 5 | 78.65 | 2.12 | 76.53 | 77.59 |
| 6 | 78.65 | 1.07 | 77.58 | 0.00 |

---

## 6. Template del estadio / mapa de localidades

Cuando se reserve o adquiera una localidad, debe implementarse un template del estadio, indicado en el documento como **MASUPs WEB**, que permita identificar:

- Qué localidades han sido compradas.
- Qué localidades han sido reservadas.
- Qué localidades están libres por partido.
- En qué factura fue comprada una localidad.
- Qué cliente compró la localidad.
- Quién está sentado en esa localidad.

---

## 7. Consideraciones adicionales

### 7.1. Modelo base del CORE Bancario

El sistema CORE del Banco tiene el siguiente modelo de base de datos.

#### Tabla `CLIENTE`

| Campo | Tipo | Clave |
|---|---|---|
| `COD_CLIENTE` | `int` | PK |
| `CEDULA` | `varchar(100)` |  |
| `NOMBRE` | `varchar(100)` |  |
| `GENERO` | `varchar(1)` |  |
| `FECHA_NACIMIENTO` | `date` |  |

#### Tabla `CUENTA`

| Campo | Tipo | Clave |
|---|---|---|
| `NUM_CUENTA` | `VARCHAR(8)` | PK |
| `COD_CLIENTE` | `int` | FK |
| `SALDO` | `NUMERIC(10,2)` |  |

#### Tabla `MOVIMIENTO`

| Campo | Tipo | Clave |
|---|---|---|
| `COD_MOVIMIENTO` | `INT` | PK |
| `NUM_CUENTA` | `VARCHAR(8)` | FK |
| `TIPO` | `VARCHAR(3)` |  |
| `VALOR` | `NUMERIC(10,2)` |  |
| `FECHA` | `DATE` |  |

Relaciones:

- `CLIENTE` se relaciona con `CUENTA` mediante `COD_CLIENTE`.
- `CUENTA` se relaciona con `MOVIMIENTO` mediante `NUM_CUENTA`.

### 7.2. Modelo de base de datos de facturación

En base a la descripción funcional, se debe crear e implementar el modelo de base de datos del sistema de facturación de la Comercializadora de Localidades a Partidos.

### 7.3. Modelo de base de datos del módulo de crédito

En base a la descripción funcional, se debe crear e implementar el modelo de base de datos del módulo de crédito en el mismo esquema del CORE Bancario.

Solo es necesario guardar:

- Datos del crédito.
- Tabla de amortización.

### 7.4. Dos aplicaciones web diferentes

Se debe demostrar la existencia de dos aplicaciones web diferentes:

1. **Core Bancario con módulo de crédito**: expone únicamente los servicios web que serán invocados por la segunda aplicación.
2. **Comercializadora de localidades por partidos / TicketPremium**: consume los servicios del Core Bancario y de la Federación de Fútbol.

---

## 8. Restricciones del proyecto

1. Se debe evidenciar que el sistema de **TicketPremium** y el de la **Federación de Fútbol** son dos sistemas diferentes.
2. La integración de los sistemas debe realizarse utilizando **Web Services SOAP**.
3. La herramienta/tecnología principal solicitada para la integración es **Java**.

---

## 9. Datos de referencia para registros de prueba

El documento indica que se deben tomar como referencia las imágenes incluidas para crear registros en las diferentes tablas de las bases de datos de las dos empresas.

### 9.1. Grupos de referencia del Mundial 2026

| Grupo | Equipos |
|---|---|
| Grupo A | México, Corea del Sur, Sudáfrica, República Checa |
| Grupo B | Canadá, Suiza, Catar, Bosnia |
| Grupo C | Brasil, Marruecos, Escocia, Haití |
| Grupo D | Estados Unidos, Australia, Paraguay, Turquía |
| Grupo E | Alemania, Ecuador, Costa de Marfil, Curazao |
| Grupo F | Países Bajos, Japón, Túnez, Suecia |
| Grupo G | Bélgica, Irán, Egipto, Nueva Zelanda |
| Grupo H | España, Uruguay, Arabia Saudí, Cabo Verde |
| Grupo I | Francia, Senegal, Noruega, Irak |
| Grupo J | Argentina, Austria, Argelia, Jordania |
| Grupo K | Portugal, Colombia, Uzbekistán, RD Congo |
| Grupo L | Inglaterra, Croacia, Panamá, Ghana |

### 9.2. Partidos de referencia visibles en las imágenes

> Nota: los siguientes partidos fueron transcritos desde imágenes del documento. Algunas imágenes son capturas de video y contienen texto pequeño, por lo que estos datos deben validarse antes de usarse como carga definitiva en base de datos.

#### 11 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| México vs Sudáfrica | Estadio Ciudad de México | Grupo A | MX 13:00 / ARG 16:00 / ESP 20:00 |
| Corea del Sur vs UEFA D | Estadio Guadalajara | Grupo A | MX 20:00 / ARG 21:00 / ESP 03:00 |

#### 12 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| Canadá vs UEFA A | Toronto Stadium | Grupo C | MX 13:00 / ARG 16:00 / ESP 20:00 |
| Estados Unidos vs Paraguay | Los Angeles Stadium | Grupo D | MX 19:00 / ARG 22:00 / ESP 02:00 |

#### 13 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| Catar vs Suiza | San Francisco Area Stadium | Grupo B | MX 13:00 / ARG 16:00 / ESP 20:00 |
| Brasil vs Marruecos | New Jersey Stadium | Grupo C | MX 16:00 / ARG 19:00 / ESP 23:00 |
| Haití vs Escocia | Boston Stadium | Grupo C | MX 19:00 / ARG 22:00 / ESP 02:00 |
| Australia vs UEFA C | BC Place Vancouver | Grupo D | MX 22:00 / ARG 01:00 / ESP 05:00 |

#### 14 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| Alemania vs Curazao | Houston Stadium | Grupo E | MX 11:00 / ARG 14:00 / ESP 18:00 |
| Países Bajos vs Japón | Dallas Stadium | Grupo F | MX 14:00 / ARG 17:00 / ESP 21:00 |
| Costa de Marfil vs Ecuador | Philadelphia Stadium | Grupo E | MX 17:00 / ARG 20:00 / ESP 00:00 |
| UEFA B vs Túnez | Estadio Monterrey | Grupo F | MX 20:00 / ARG 23:00 / ESP 03:00 |

#### 15 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| España vs Cabo Verde | Atlanta Stadium | Grupo H | MX 10:00 / ARG 13:00 / ESP 17:00 |
| Bélgica vs Egipto | Seattle Stadium | Grupo G | MX 13:00 / ARG 16:00 / ESP 20:00 |
| Arabia Saudita vs Uruguay | Miami Stadium | Grupo H | MX 16:00 / ARG 19:00 / ESP 23:00 |
| Irán vs Nueva Zelanda | Los Angeles Stadium | Grupo G | MX 19:00 / ARG 22:00 / ESP 02:00 |
| Francia vs Senegal | New Jersey Stadium | Grupo I | MX 13:00 / ARG 16:00 / ESP 20:00 |
| Repechaje 2 vs Noruega | Boston Stadium | Grupo I | MX 16:00 / ARG 19:00 / ESP 23:00 |
| Argentina vs Argelia | Kansas City Stadium | Grupo J | MX 17:00 / ARG 20:00 / ESP 00:00 |
| Austria vs Jordania | San Francisco Area Stadium | Grupo J | MX 20:00 / ARG 23:00 / ESP 03:00 |

#### 16 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| Portugal vs Repechaje 1 | Houston Stadium | Grupo K | MX 11:00 / ARG 14:00 / ESP 18:00 |
| Inglaterra vs Croacia | Dallas Stadium | Grupo L | MX 14:00 / ARG 17:00 / ESP 21:00 |
| Ghana vs Panamá | Toronto Stadium | Grupo L | MX 17:00 / ARG 20:00 / ESP 00:00 |
| Uzbekistán vs Colombia | Estadio Ciudad de México | Grupo K | MX 20:00 / ARG 23:00 / ESP 03:00 |

#### 17 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| UEFA D vs Sudáfrica | Atlanta Stadium | Grupo A | MX 10:00 / ARG 13:00 / ESP 17:00 |
| Suiza vs UEFA A | Los Angeles Stadium | Grupo B | MX 13:00 / ARG 16:00 / ESP 20:00 |
| Canadá vs Catar | BC Place Vancouver | Grupo B | MX 16:00 / ARG 19:00 / ESP 23:00 |
| México vs Corea del Sur | Estadio Guadalajara | Grupo A | MX 19:00 / ARG 22:00 / ESP 02:00 |

#### 19 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| Estados Unidos vs Australia | Seattle Stadium | Grupo D | MX 13:00 / ARG 16:00 / ESP 20:00 |
| Escocia vs Marruecos | Boston Stadium | Grupo C | MX 16:00 / ARG 19:00 / ESP 23:00 |
| Brasil vs Haití | Philadelphia Stadium | Grupo C | MX 19:00 / ARG 22:00 / ESP 02:00 |
| UEFA C vs Paraguay | San Francisco Area Stadium | Grupo D | MX 22:00 / ARG 01:00 / ESP 05:00 |

#### 20 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| Países Bajos vs UEFA B | Houston Stadium | Grupo F | MX 11:00 / ARG 14:00 / ESP 18:00 |
| Alemania vs Costa de Marfil | Toronto Stadium | Grupo E | MX 14:00 / ARG 17:00 / ESP 21:00 |
| Ecuador vs Curazao | Kansas City Stadium | Grupo E | MX 20:00 / ARG 21:00 / ESP 03:00 |
| Túnez vs Japón | Dallas Stadium | Grupo F | MX 22:00 / ARG 01:00 / ESP 05:00 |

#### 21 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| España vs Arabia Saudita | Atlanta Stadium | Grupo H | MX 10:00 / ARG 13:00 / ESP 17:00 |
| Bélgica vs Irán | Los Angeles Stadium | Grupo G | MX 13:00 / ARG 16:00 / ESP 20:00 |
| Uruguay vs Cabo Verde | Miami Stadium | Grupo H | MX 16:00 / ARG 19:00 / ESP 23:00 |
| Nueva Zelanda vs Egipto | BC Place Vancouver | Grupo G | MX 19:00 / ARG 22:00 / ESP 02:00 |

#### 22 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| Argentina vs Australia | Dallas Stadium | Grupo J | MX 11:00 / ARG 14:00 / ESP 18:00 |
| Francia vs Repechaje 2 | Philadelphia Stadium | Grupo I | MX 15:00 / ARG 18:00 / ESP 22:00 |
| Noruega vs Senegal | New York/New Jersey Stadium | Grupo I | MX 18:00 / ARG 21:00 / ESP 01:00 |
| Jordania vs Argelia | San Francisco Area Stadium | Grupo J | MX 21:00 / ARG 00:00 / ESP 04:00 |

#### 23 de junio

| Partido | Estadio / lugar | Grupo | Horarios visibles |
|---|---|---|---|
| Portugal vs Uzbekistán | Houston Stadium | Grupo K | MX 11:00 / ARG 14:00 / ESP 18:00 |
| Inglaterra vs Ghana | Boston Stadium | Grupo L | MX 14:00 / ARG 17:00 / ESP 21:00 |
| Panamá vs Croacia | Toronto Stadium | Grupo L | MX 17:00 / ARG 20:00 / ESP 00:00 |
| Colombia vs Repechaje 1 | Estadio Guadalajara | Grupo K | MX 20:00 / ARG 23:00 / ESP 03:00 |

#### 24 de junio / partidos en captura de video

| Partido | Observación |
|---|---|
| Suiza vs Canadá | Visible en captura de video. |
| UEFA A vs Catar | Visible en captura de video. |
| Brasil vs Escocia | Visible en captura de video. |
| Marruecos vs Haití | Visible en captura de video. |
| UEFA D vs México | Visible parcialmente en captura de video. |
| Sudáfrica vs Corea del Sur | Visible parcialmente en captura de video. |
| Curazao vs Costa de Marfil | Visible en captura de video. |
| Ecuador vs Alemania | Visible en captura de video. |
| Japón vs UEFA B | Visible en captura de video. |
| Túnez vs Países Bajos | Visible en captura de video. |
| UEFA C vs Estados Unidos | Visible en captura de video. |
| Paraguay vs Australia | Visible parcialmente en captura de video. |

#### 25 de junio / partidos en captura de video

| Partido | Observación |
|---|---|
| Noruega vs Francia | Visible en captura de video. |
| Senegal vs Repechaje 2 | Visible en captura de video. |
| Cabo Verde vs Arabia Saudita | Visible en captura de video. |
| Uruguay vs España | Visible en captura de video. |
| Egipto vs Irán | Visible en captura de video. |
| Nueva Zelanda vs Bélgica | Visible en captura de video. |

#### 27 de junio / partidos en captura de video

| Partido | Observación |
|---|---|
| Panamá vs Inglaterra | Visible en captura de video. |
| Croacia vs Ghana | Visible en captura de video. |
| Colombia vs Portugal | Visible en captura de video; en la imagen puede confundirse con Ecuador por la resolución. |
| Repechaje 1 vs Uzbekistán | Visible en captura de video. |
| Argelia vs Australia | Visible en captura de video. |
| Jordania vs Argentina | Visible en captura de video. |

### 9.3. Referencia de fases eliminatorias

La última imagen contiene una referencia visual del cuadro de eliminación directa.

Datos legibles principales:

- **Octavos de final**: sedes visibles como Philadelphia, New York, Los Angeles, Monterrey, Toronto, San Francisco, Seattle, Boston, Ciudad de México, Atlanta, Miami, Houston, Dallas, Vancouver y Kansas City.
- **Cuartos de final**: sedes visibles como Boston, Los Angeles, Miami y Kansas City.
- **Semifinales**:
  - Dallas: 14 de julio.
  - Atlanta: 15 de julio.
- **Tercer lugar**:
  - Miami: 18 de julio.
- **Final**:
  - New York: 19 de julio.

### 9.4. Enlace de referencia

El documento incluye el siguiente enlace:

```text
https://www.youtube.com/watch?v=L30mwhP3X3E
```

---

## 10. Resumen técnico para el agente

### Sistemas involucrados

| Sistema | Responsabilidad principal | Integración |
|---|---|---|
| Federación de Fútbol | Administrar partidos, localidades, precios y disponibilidad. | Expone servicios SOAP. |
| TicketPremium / Comercializadora | Vender boletos, facturar, generar reportes y consultar disponibilidad. | Consume servicios SOAP de Federación y Core Bancario. |
| Core Bancario + Crédito | Verificar sujeto de crédito, monto máximo, créditos activos y amortización. | Expone servicios SOAP para TicketPremium. |

### Servicios mínimos esperados

| Servicio | Sistema que lo expone | Consumidor | Propósito |
|---|---|---|---|
| Consultar partidos disponibles | Federación de Fútbol | TicketPremium | Listar partidos con `FECHA >= fecha actual`. |
| Consultar localidades por partido | Federación de Fútbol | TicketPremium | Listar localidades con disponibilidad mayor a cero. |
| Decrementar disponibilidad | Federación de Fútbol | TicketPremium | Restar disponibilidad cuando se compra boleto. |
| Verificar sujeto de crédito | Core Bancario | TicketPremium | Validar si cliente puede comprar con crédito directo. |
| Obtener monto máximo aprobado | Core Bancario | TicketPremium | Calcular monto máximo según movimientos bancarios. |
| Registrar crédito y amortización | Core Bancario | TicketPremium/Core | Guardar crédito aprobado y cuotas. |

### Entidades funcionales mínimas sugeridas

Estas entidades no aparecen todas definidas explícitamente en el documento, pero se derivan de los requerimientos:

- `Pais`.
- `Estadio`.
- `Partido` / `PartidoFutbol`.
- `Localidad`.
- `LocalidadPartido`.
- `Cliente`.
- `Factura`.
- `DetalleFactura`.
- `FormaPago`.
- `Asiento` o `UbicacionEstadio`.
- `ReservaLocalidad`.
- `Credito`.
- `TablaAmortizacion` / `CuotaCredito`.
- `Movimiento`.
- `Cuenta`.

### Reglas críticas de negocio

1. Solo se muestran partidos futuros o del día actual.
2. Solo se muestran localidades con disponibilidad mayor a cero.
3. Al comprar una localidad, debe decrementarse la disponibilidad.
4. La factura debe incluir IVA.
5. La compra puede incluir varios partidos y varias localidades por partido.
6. El pago en efectivo aplica descuento del 12%.
7. El pago con crédito directo requiere validación mediante Web Service.
8. El cliente masculino menor de 25 años no cumple la regla de crédito.
9. El cliente no debe tener crédito activo.
10. El cliente debe tener al menos un depósito en el último mes.
11. El monto máximo de crédito se calcula usando promedios de depósitos y retiros de los últimos 3 meses.
12. La tabla de amortización usa cuota fija mensual, plazo de 3 a 18 meses y tasa anual de 16.5%.
13. Debe poder identificarse el estado de cada localidad/asiento: libre, reservado o comprado.
14. Debe poder saberse en qué factura fue comprada una localidad, por qué cliente y quién está sentado allí.
15. TicketPremium, Federación de Fútbol y Core Bancario deben evidenciarse como sistemas separados.
16. La integración debe ser mediante SOAP y Java.
