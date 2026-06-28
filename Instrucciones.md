# Auditoría Cruzada de Calidad: Devs vs QA

## Actividad Práctica - Aseguramiento de la Calidad del Software

**NRC:** 30733

---

# Objetivo General

Simular un entorno corporativo real donde coexisten equipos de desarrollo y equipos de aseguramiento de calidad, generando una dinámica de tensión constructiva:

- Los equipos **Dev** construyen un proyecto con defectos intencionales.
- Los equipos **QA** auditan, priorizan y exigen mejoras bajo el estándar **ISO/IEC 25010**.

---

# 1. Distribución de los Grupos

| Rol | Grupos | Responsabilidad |
|------|---------|-----------------|
| Squads de Desarrollo (Devs) | Grupos 1, 2 y 3 | Construyen un proyecto "Legacy" con problemas intencionales inyectados y lo entregan antes de la clase. |
| Squads de QA (Auditores) | Grupos 4, 5, 6 y 7 | Auditan los proyectos, extraen métricas, priorizan deuda técnica y presentan hallazgos ejecutivos. |

## Asignación de proyectos

- Grupo 4 → audita el proyecto del Grupo 1.
- Grupo 5 → audita el proyecto del Grupo 2.
- Grupo 6 → audita el proyecto del Grupo 3.
- Grupo 7 → actúa como **Arquitecto de Calidad**, realizando benchmarking entre los tres proyectos.

---

# Trabajo previo a la clase (Equipos Dev)

Cada grupo Dev debe entregar un repositorio en GitHub con las siguientes características.

## Checklist de vicios a inyectar

| Categoría | Requisito mínimo |
|-----------|------------------|
| Bugs / Confiabilidad | Al menos **3 bugs funcionales** (ej.: división por cero, manejo incorrecto de null, bucles infinitos). |
| Code Smells / Mantenibilidad | Al menos **2 funciones** con complejidad ciclomática >20, **15%** de código duplicado o métodos de más de **50 líneas**. |
| Ausencia de pruebas | Cobertura general inferior al **30%** y **0%** de cobertura en módulos críticos (autenticación, pagos o base de datos). |
| Vulnerabilidades | Al menos **2 Security Hotspots**: credenciales hardcodeadas, SQL sin parametrizar, uso de `eval()` o `exec()`. |
| Dominio del proyecto | Entre **5 y 8 archivos** de código y un módulo crítico claramente identificado (ej.: Procesador de Pagos). |
| Documentación | README con instrucciones de ejecución y una justificación ficticia del estado del código (presión de tiempo, deuda técnica heredada, etc.). |

## Sugerencias de proyectos

- API REST de e-commerce
- Sistema de reservas
- Gestor de tareas con autenticación
- Chatbot simple

---

# 2. Cronograma de la Actividad

## Fase 1: Briefing Corporativo

El docente (CTO) presenta el escenario:

> "Adquirimos tres startups. Cada una dejó un sistema cuya salud es desconocida."

Cada grupo Dev dispone de **2 minutos** para presentar su proyecto y defender por qué el código "está bien así".

Posteriormente se asignan oficialmente los proyectos a los equipos QA.

---

## Fase 2: Minería de Métricas

Los grupos QA:

- Acceden al repositorio.
- Revisan el dashboard de SonarCloud.
- Extraen métricas bajo ISO/IEC 25010.

### Métricas analizadas

- Confiabilidad
- Mantenibilidad
- Seguridad
- Cobertura
- Complejidad

El Grupo 7 construye una tabla comparativa entre los tres proyectos.

Los grupos Dev permanecen disponibles para responder preguntas técnicas.

---

## Fase 3: Diagnóstico y Triaje

Los QA:

- Cruzan métricas con riesgo de negocio.
- Crean entre **3 y 5 Issues** en GitHub.
- Redactan historias de deuda técnica con criterios de aceptación.

El Grupo 7 redacta un reporte de benchmarking respondiendo:

- ¿Qué proyecto adquirir sin refactorizar?
- ¿Cuál representa una bomba de tiempo?
- ¿Qué malas prácticas se repiten?

Los equipos Dev revisan los Issues y preparan su defensa técnica.

---

## Fase 4: Shark Tank de Calidad

Duración:

- **8 minutos por proyecto**
- **6 minutos para el Grupo 7**

### Dinámica

#### 1. Presentación del QA (3 min)

- Semáforo de salud
- Hallazgo crítico
- Propuesta priorizada

#### 2. Defensa del Dev (2 min)

El equipo Dev:

- acepta,
- rechaza,
- o negocia los Issues.

#### 3. Preguntas (3 min)

Preguntas del CTO y del resto de la clase.

### Presentación del Grupo 7

Presenta el benchmarking comparativo, por ejemplo:

> "El proyecto 2 es el más riesgoso porque, aunque tiene menos bugs, su módulo de pagos tiene 0% de cobertura y alta complejidad."

---

## Fase 5: Retroalimentación

Preguntas de reflexión:

1. ¿Fue más difícil crear código malo o detectarlo?
2. ¿Cómo se sintió la tensión Dev vs QA?
3. ¿Cómo integrar Quality Gates en CI/CD para impedir que estos defectos lleguen a producción?

---

# 3. Rúbricas de Evaluación

## Equipos Dev (Grupos 1, 2 y 3)

| Criterio | Excelente (100%) | Aceptable (70%) | Deficiente (40%) |
|----------|------------------|-----------------|------------------|
| Calidad del código malo | Inyecta vicios sutiles y realistas. | Cumple el checklist pero los errores son obvios. | No cumple el checklist o el proyecto no ejecuta. |
| Defensa técnica | Argumenta con criterios de negocio (time-to-market, ROI). | Solo indica que no hubo tiempo. | No defiende el proyecto. |
| Negociación de Issues | Negocia técnicamente y acepta lo evidente. | Acepta todo o rechaza todo sin argumentos. | No participa. |

---

## Equipos QA (Grupos 4, 5 y 6)

| Criterio | Excelente (100%) | Aceptable (70%) | Deficiente (40%) |
|----------|------------------|-----------------|------------------|
| Interpretación de métricas | Relaciona métricas con ISO 25010 y riesgo de negocio. | Lee números sin contexto. | Confunde conceptos. |
| Calidad de los Issues | Tickets completos con contexto, impacto y criterios de aceptación. | Tickets vagos. | No crea tickets. |
| Pitch ejecutivo | Traduce hallazgos técnicos al impacto de negocio. | Exceso de jerga técnica. | No sintetiza. |

---

## Grupo 7 (Arquitecto de Calidad)

| Criterio | Excelente (100%) | Aceptable (70%) | Deficiente (40%) |
|----------|------------------|-----------------|------------------|
| Análisis comparativo | Identifica patrones y establece un ranking justificado. | Solo compara números. | No realiza comparación. |
| Recomendación estratégica | Prioriza proyectos y propone acciones de portafolio. | Solo describe hallazgos. | No presenta conclusiones. |

---

# Objetivo Final

Simular una auditoría de calidad de software en un entorno corporativo, donde los equipos de desarrollo defienden un sistema heredado (Legacy) y los equipos de QA evalúan su estado mediante métricas, estándares ISO/IEC 25010, SonarCloud y reportes de deuda técnica, reproduciendo un proceso similar al de una organización real.
