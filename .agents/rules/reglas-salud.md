---
trigger: always_on
description: Reglas de resiliencia y separación de datos clínicos para el sistema de historiales
---

# Reglas de Codificación y Resiliencia de Datos de Salud

Al trabajar con registros clínicos en la aplicación, todos los agentes y scripts deben cumplir estrictamente:

1. **Separación de Campos Agrupados (Nombre y Apellido)**:
   - Todo campo `nombre_completo` en el origen de datos debe procesarse mediante una función de división de nombres (`splitFullName`).
   - La primera parte representará los nombres de pila y el remanente los apellidos.
   - En la interfaz deben poder visualizarse tanto combinados como en columnas/etiquetas separadas.

2. **Cero Tolerancia a Errores por Valores Nulos (Null-Safety)**:
   - Jamás acceder a propiedades anidadas sin verificación defensiva (uso obligatorio de encadenamiento opcional `?.` y operador de coalescencia nula `??`).
   - Si `telefono` es `null`, mostrar fallback controlado: `"No registrado"`.
   - Si `alergias` es `null` o array vacío `[]`, renderizar badge informativo `"Sin alergias conocidas"` con estilo visual neutro, nunca dejar el contenedor roto o vacío.
   - Si `contacto_emergencia` es `null`, mostrar `"Sin contacto de emergencia asignado"`.
   - Si `seguro_medico` es `null` o vacío, indicar `"Particular / Sin seguro"`.

3. **Jerarquía Visual de Estados Clínicos**:
   - `Crítico`: Color carmesí/rojo vivo con indicador pulsante.
   - `En Observación`: Color ámbar/amarillo cálido.
   - `Estable`: Color esmeralda/verde salud.
   - `Alta`: Color azul pizarra/grisáceo.

4. **Accesibilidad y Semántica**:
   - Todo elemento interactivo (botones de filtro, búsqueda, modal) debe poseer atributos `aria-label`, `role` y `tabindex` correspondientes.
