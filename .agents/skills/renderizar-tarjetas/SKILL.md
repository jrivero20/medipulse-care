---
name: renderizar-tarjetas
description: Orquesta la construcción y renderizado de tarjetas de pacientes y fichas clínicas interactivas con manejo seguro de nulos.
commands:
  - /renderizar_tarjetas
---

# Skill: Renderizado de Tarjetas Clínicas (/renderizar_tarjetas)

Esta skill orquesta la renderización dinámica y resiliente de los componentes visuales de pacientes en el frontend.

## Flujo de Ejecución del Comando `/renderizar_tarjetas`:

1. **Recepción del Dataset**:
   - Obtener los registros de pacientes desde `data/pacientes.json`.
2. **Pase por Sanitizador**:
   - Inyectar cada objeto en `DataSanitizer.sanitizePatient(patient)`.
   - Extraer `nombres`, `apellidos`, badges seguros para alergias, teléfonos y signos vitales.
3. **Generación del DOM de Tarjeta**:
   - Crear tarjeta con `card-patient`.
   - Incluir avatar generado con iniciales.
   - Insertar badge de estado clínico (`Crítico`, `En Observación`, `Estable`, `Alta`).
   - Añadir desglose de signos vitales (Presión, FC, SpO2, Temp).
   - Añadir botón de acción interactivo para abrir el expediente completo.
4. **Resiliencia de Renderizado**:
   - Comprobar que ningún nodo genere excepciones por variables nulas o indefinidas.
   - Si se detecta un valor ausente, renderizar el placeholder visual `.badge-null-safe`.

## Ejemplo de Invocación:
Cuando el usuario o el agente invoque `/renderizar_tarjetas`, la función modular `CardRenderer.renderGrid(container, patients)` se ejecuta reactivamente sobre el contenedor `#patients-grid`.
