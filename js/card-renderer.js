/**
 * CardRenderer Module
 * Implementación vinculada a la Skill /renderizar_tarjetas.
 * Genera el markup accesible y reactivo para cada tarjeta y el expediente modal.
 */

const CardRenderer = (() => {

  /**
   * Determina la clase CSS para el badge de estado
   * @param {string} estado 
   * @returns {string}
   */
  const getStatusClass = (estado) => {
    switch (estado) {
      case 'Crítico': return 'critical';
      case 'En Observación': return 'observation';
      case 'Estable': return 'stable';
      case 'Alta': return 'discharge';
      default: return 'stable';
    }
  };

  /**
   * Genera el HTML de una tarjeta individual de paciente
   * @param {Object} patient - Objeto sanitizado por DataSanitizer
   * @returns {string} HTML string
   */
  const createCardHTML = (patient) => {
    const statusClass = getStatusClass(patient.estado);
    const vitals = patient.signos_vitales;

    // Resiliencia visual para tipo de sangre
    const bloodTypeBadge = patient.tipo_sangre
      ? `<span class="split-tag">🩸 ${patient.tipo_sangre}</span>`
      : `<span class="null-safe-badge">S/Grupo</span>`;

    return `
      <article class="patient-card" data-id="${patient.id}" data-status="${patient.estado}" tabindex="0" role="region" aria-label="Ficha de ${patient.nombre_completo}">
        
        <header class="card-header-row">
          <div class="patient-identity">
            <div class="patient-avatar" aria-hidden="true">${patient.initials}</div>
            <div class="patient-names-group">
              <h2 class="patient-fullname">${patient.nombre_completo}</h2>
              <div class="patient-split-names">
                <span class="split-tag">DNI: ${patient.dni}</span>
                ${bloodTypeBadge}
              </div>
            </div>
          </div>
          <span class="status-badge ${statusClass}">
            <span class="pulse-dot" style="background-color: currentColor;"></span>
            ${patient.estado}
          </span>
        </header>

        <div class="card-body-details">
          <div class="diagnosis-box">
            <span class="diagnosis-label">Diagnóstico Principal</span>
            <p class="diagnosis-text">${patient.diagnostico_principal}</p>
          </div>

          <div class="patient-quick-info">
            <div class="info-item">
              <span class="info-label">Habitación</span>
              <span class="info-val">${patient.habitacion}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Edad / Sexo</span>
              <span class="info-val">${patient.edad} · ${patient.genero[0] || 'N/E'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Médico</span>
              <span class="info-val" title="${patient.medico_tratante}">${patient.medico_tratante.split(' ')[0] || 'Dr.'}</span>
            </div>
          </div>

          <div class="vital-signs-bar" aria-label="Signos vitales rápidos">
            <div class="vital-chip" title="Presión Arterial">
              <span class="vital-label">P.A.</span>
              <span class="vital-num">${vitals.presion}</span>
            </div>
            <div class="vital-chip" title="Frecuencia Cardíaca">
              <span class="vital-label">F.C.</span>
              <span class="vital-num">${vitals.frecuencia_cardiaca}</span>
            </div>
            <div class="vital-chip" title="Saturación O2">
              <span class="vital-label">SpO2</span>
              <span class="vital-num">${vitals.saturacion_oxigeno}</span>
            </div>
            <div class="vital-chip" title="Temperatura">
              <span class="vital-label">Temp</span>
              <span class="vital-num">${vitals.temperatura}</span>
            </div>
          </div>
        </div>

        <footer>
          <button type="button" class="view-record-btn" data-action="open-modal" data-id="${patient.id}" aria-label="Abrir historial clínico completo de ${patient.nombre_completo}">
            <span>Ver Expediente Clínico</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </footer>

      </article>
    `;
  };

  /**
   * Renderiza la cuadrícula de tarjetas de pacientes
   * @param {HTMLElement} container 
   * @param {Array} patients - Lista de pacientes sanitizados
   */
  const renderGrid = (container, patients) => {
    if (!container) return;

    if (!patients || patients.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" role="status">
          <div class="empty-state-icon">🔍</div>
          <h3>No se encontraron pacientes</h3>
          <p>No hay registros que coincidan con los criterios de búsqueda o filtros seleccionados.</p>
          <button type="button" class="btn-reset-filters" id="btn-reset-filters">Limpiar Filtros</button>
        </div>
      `;
      return;
    }

    container.innerHTML = patients.map(createCardHTML).join('');
  };

  /**
   * Genera y llena el contenido del modal de expediente clínico
   * @param {HTMLElement} modalDialog 
   * @param {Object} patient 
   */
  const populateModal = (modalDialog, patient) => {
    if (!modalDialog || !patient) return;

    const statusClass = getStatusClass(patient.estado);
    const vitals = patient.signos_vitales;

    // Resiliencia para Alergias
    let allergiesHTML = '';
    if (patient.alergias.hasAllergies) {
      allergiesHTML = `
        <div class="allergies-list">
          ${patient.alergias.items.map(a => `<span class="allergy-tag">⚠️ ${a}</span>`).join('')}
        </div>
      `;
    } else {
      allergiesHTML = `<span class="null-safe-badge">${patient.alergias.displayText}</span>`;
    }

    // Resiliencia para Teléfono
    const phoneHTML = patient.telefono.isNull
      ? `<span class="null-safe-badge">No registrado</span>`
      : `<a href="tel:${patient.telefono.value}" style="color: var(--accent-cyan); text-decoration: none;">${patient.telefono.displayText}</a>`;

    // Resiliencia para Contacto de Emergencia
    const emergencyHTML = patient.contacto_emergencia.isNull
      ? `<span class="null-safe-badge">Sin contacto de emergencia registrado</span>`
      : `<strong>${patient.contacto_emergencia.nombre}</strong><br><span style="color: var(--text-muted); font-size: 0.85rem;">Tel: ${patient.contacto_emergencia.telefono}</span>`;

    // Resiliencia para Seguro Médico
    const insuranceHTML = patient.seguro_medico.isNull
      ? `<span class="null-safe-badge">${patient.seguro_medico.displayText}</span>`
      : `<span>🛡️ ${patient.seguro_medico.displayText}</span>`;

    // Resiliencia para Tipo de Sangre
    const bloodTypeHTML = patient.tipo_sangre
      ? `<span style="font-weight: 700; color: #f87171;">${patient.tipo_sangre}</span>`
      : `<span class="null-safe-badge">Sin tipificar</span>`;

    modalDialog.innerHTML = `
      <header class="modal-header">
        <div class="modal-title-group">
          <h2>
            ${patient.nombre_completo}
            <span class="modal-record-id">${patient.id}</span>
          </h2>
          <p class="modal-subtitle">DNI: ${patient.dni} · Habitación: ${patient.habitacion} · Dr(a): ${patient.medico_tratante}</p>
        </div>
        <button type="button" class="modal-close-btn" data-action="close-modal" aria-label="Cerrar ventana">&times;</button>
      </header>

      <div class="modal-body">
        
        <!-- Estado y Diagnóstico -->
        <section class="modal-section">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3 class="section-heading">Diagnóstico y Estado Clínico</h3>
            <span class="status-badge ${statusClass}">
              <span class="pulse-dot" style="background-color: currentColor;"></span>
              ${patient.estado}
            </span>
          </div>
          <div class="diagnosis-box">
            <p class="diagnosis-text" style="font-size: 0.95rem;">${patient.diagnostico_principal}</p>
          </div>
        </section>

        <!-- Columnas Separadas: Nombres y Apellidos (Normativa 2 y 5) -->
        <section class="modal-section">
          <h3 class="section-heading">Datos de Filiación (Campos Desagrupados)</h3>
          <div class="modal-grid-2">
            <div class="detail-cell">
              <span class="detail-label">Nombres de Pila</span>
              <div class="detail-value">${patient.nombres}</div>
            </div>
            <div class="detail-cell">
              <span class="detail-label">Apellidos</span>
              <div class="detail-value">${patient.apellidos}</div>
            </div>
            <div class="detail-cell">
              <span class="detail-label">Edad y Género</span>
              <div class="detail-value">${patient.edad} (${patient.genero})</div>
            </div>
            <div class="detail-cell">
              <span class="detail-label">Grupo Sanguíneo</span>
              <div class="detail-value">${bloodTypeHTML}</div>
            </div>
          </div>
        </section>

        <!-- Signos Vitales al Ingreso -->
        <section class="modal-section">
          <h3 class="section-heading">Signos Vitales y Monitoreo</h3>
          <div class="vital-signs-bar" style="grid-template-columns: repeat(4, 1fr); background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div class="vital-chip">
              <span class="vital-label">Presión Arterial</span>
              <span class="vital-num" style="font-size: 0.95rem;">${vitals.presion}</span>
            </div>
            <div class="vital-chip">
              <span class="vital-label">Frecuencia Cardíaca</span>
              <span class="vital-num" style="font-size: 0.95rem;">${vitals.frecuencia_cardiaca}</span>
            </div>
            <div class="vital-chip">
              <span class="vital-label">Saturación O2</span>
              <span class="vital-num" style="font-size: 0.95rem;">${vitals.saturacion_oxigeno}</span>
            </div>
            <div class="vital-chip">
              <span class="vital-label">Temperatura</span>
              <span class="vital-num" style="font-size: 0.95rem;">${vitals.temperatura}</span>
            </div>
          </div>
        </section>

        <!-- Resiliencia y Datos Administrativos -->
        <section class="modal-section">
          <h3 class="section-heading">Contactos y Póliza (Soporte Resiliente de Nulos)</h3>
          <div class="modal-grid-2">
            <div class="detail-cell">
              <span class="detail-label">Teléfono Directo</span>
              <div class="detail-value">${phoneHTML}</div>
            </div>
            <div class="detail-cell">
              <span class="detail-label">Contacto de Emergencia</span>
              <div class="detail-value">${emergencyHTML}</div>
            </div>
            <div class="detail-cell">
              <span class="detail-label">Seguro Médico / Póliza</span>
              <div class="detail-value">${insuranceHTML}</div>
            </div>
            <div class="detail-cell">
              <span class="detail-label">Alergias Medicamentosas</span>
              <div class="detail-value">${allergiesHTML}</div>
            </div>
          </div>
        </section>

        <!-- Notas Clínicas de Evolución -->
        <section class="modal-section">
          <h3 class="section-heading">Notas de Evolución y Tratamiento</h3>
          <div class="evolution-notes-box">
            <p>${patient.notas_evolucion}</p>
            <div style="margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-muted);">
              Fecha de Registro: ${patient.fecha_ingreso_formatted} · Registrado por: ${patient.medico_tratante}
            </div>
          </div>
        </section>

      </div>

      <footer class="modal-footer">
        <button type="button" class="btn-secondary" data-action="close-modal">Cerrar Expediente</button>
      </footer>
    `;
  };

  return {
    renderGrid,
    populateModal,
    getStatusClass
  };

})();

// Exportación modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardRenderer;
}
