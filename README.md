# 🩺 MediPulse Care - Buscador de Historiales Clínicos

> **Proyecto Final: Curso de Desarrollo con Inteligencia Artificial**  
> *Aplicación web interactiva construida bajo el principio estricto de **Cero Código Manual** y orquestación técnica avanzada con Agentes IA.*

---

## 📋 Resumen de Cumplimiento de Normativas

| Normativa del Curso | Estado | Implementación en el Proyecto |
| :--- | :---: | :--- |
| **1. Cero Código Manual** | ✅ Cumplido | El 100% de la arquitectura, componentes HTML5, estilos CSS3 y lógica JavaScript modular fue generado mediante prompting orquestado. |
| **2. Contexto de Datos (MCP / JSON)** | ✅ Cumplido | Archivo [`data/pacientes.json`](./data/pacientes.json) inyectado dinámicamente, con casos límite de registros incompletos y nombres agrupados. |
| **3. Skills / Comandos Personalizados** | ✅ Cumplido | Skill configurada en [`.agents/skills/renderizar-tarjetas/SKILL.md`](./.agents/skills/renderizar-tarjetas/SKILL.md) y comando `/renderizar_tarjetas`. |
| **4. Agentes Personalizados** | ✅ Cumplido | Agente especializado en [`.agents/agents/auditor-datos-salud.md`](./.agents/agents/auditor-datos-salud.md) y reglas en [`.agents/rules/reglas-salud.md`](./.agents/rules/reglas-salud.md). |
| **5. Refactorización y Depuración Autónoma** | ✅ Cumplido | Capa [`js/data-sanitizer.js`](./js/data-sanitizer.js) con división de nombres en columnas separadas y tolerancia absoluta a `null` / `undefined`. |
| **6. Despliegue a Producción** | ✅ Listo | Arquitectura estática sin dependencias de compilación, lista para publicar en 1 clic en Netlify, Vercel o GitHub Pages. |

---

## 🚀 Características Principales

1. **Buscador Reactivo Multicriterio**:
   - Búsqueda en tiempo real por Nombres, Apellidos, DNI, Diagnóstico o Habitación.
2. **División Inteligente de Nombres**:
   - Transforma campos agrupados (`"Elena Sofía Morales Rivas"`) en Nombres de pila (`"Elena Sofía"`) y Apellidos (`"Morales Rivas"`), visibles en la ficha clínica.
3. **Resiliencia Defensiva a Nulos (Null-Safety)**:
   - Pacientes con `telefono: null`, `alergias: null`, `contacto_emergencia: null` o `seguro_medico: null` reciben badges amigables (`"No registrado"`, `"Sin alergias conocidas"`, `"Particular"`) evitando cualquier excepción en la consola (`TypeError`).
4. **Métricas en Vivo**:
   - Conteo reactivo de pacientes totales, casos críticos, en observación y estables.
5. **Filtros por Nivel de Triaje**:
   - Acceso rápido a: *Todos*, *🔴 Crítico*, *🟡 En Observación*, *🟢 Estable*, *⚪ Alta*.
6. **Diseño de Alto Impacto (HealthTech UI)**:
   - Soporte para **Modo Oscuro** y **Modo Claro**.
   - Glassmorphism, micro-animaciones en tarjetas y badges pulsantes.
   - Modal accesible con expediente médico completo.

---

## 📂 Estructura del Repositorio

```
proyecto_IA/
│
├── .agents/
│   ├── agents/
│   │   └── auditor-datos-salud.md      # Agente Especializado de Auditoría (Normativa 4)
│   ├── rules/
│   │   └── reglas-salud.md             # Reglas de codificación y resiliencia
│   └── skills/
│       └── renderizar-tarjetas/        # Skill y comando /renderizar_tarjetas (Normativa 3)
│           └── SKILL.md
│
├── data/
│   └── pacientes.json                  # Dataset con casos límite de prueba (Normativa 2)
│
├── css/
│   ├── variables.css                   # Tokens de diseño, tipografía y temas
│   ├── base.css                        # Layout, métricas y barra de búsqueda
│   └── components.css                  # Tarjetas, modales y badges resilientes
│
├── js/
│   ├── data-sanitizer.js               # Separación de nombres y blindaje contra nulos
│   ├── card-renderer.js                # Renderizado de componentes (/renderizar_tarjetas)
│   └── app.js                          # Orquestador general de eventos y filtros
│
├── index.html                          # Punto de entrada de la aplicación
└── README.md                           # Documentación del proyecto
```

---

## 🌐 Guía de Despliegue a Producción (Normativa 6)

Al no requerir dependencias de Node ni pasos de compilación (`npm run build`), el despliegue es inmediato en cualquiera de las siguientes plataformas gratuitas:

### Opción A: Netlify Drop (La más rápida, sin comandos)
1. Ingresa a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra y suelta la carpeta `proyecto_IA` directamente en el navegador.
3. En 5 segundos obtendrás un enlace público funcional (ej. `https://medipulse-care.netlify.app`).

### Opción B: Vercel (Vía GitHub o CLI)
1. Sube este proyecto a un repositorio en GitHub.
2. En [vercel.com](https://vercel.com), haz clic en **Add New Project** e importa el repositorio.
3. En el Framework Preset selecciona **Other** (Root Directory `./`) y haz clic en **Deploy**.

### Opción C: GitHub Pages
1. Sube el proyecto a un repositorio de GitHub.
2. Ve a **Settings > Pages**.
3. En **Branch**, selecciona `main` y la carpeta `/ (root)`. Haz clic en **Save**.
4. Tu web estará publicada en `https://<tu-usuario>.github.io/<nombre-repo>/`.

---

## 🛠️ Comandos de Agente Disponibles
- `/renderizar_tarjetas`: Reconstruye y valida la visualización de la cuadrícula de pacientes en base a los datos sanitizados.
- En la consola del navegador (`F12`), también puedes ejecutar `window.renderizar_tarjetas()` para auditar el renderizado en tiempo real.
