/**
 * MediPulse Health Application Coordinator
 * Controla el ciclo de vida, filtros reactivos, búsqueda, estado y modales.
 */

document.addEventListener('DOMContentLoaded', () => {

  // Referencias al DOM
  const elements = {
    grid: document.getElementById('patients-grid'),
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('search-clear-btn'),
    filterChips: document.querySelectorAll('.filter-chip'),
    resultsCount: document.getElementById('results-count'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    themeText: document.getElementById('theme-text'),
    // Métricas
    metricTotal: document.getElementById('metric-total'),
    metricCritical: document.getElementById('metric-critical'),
    metricObs: document.getElementById('metric-obs'),
    metricStable: document.getElementById('metric-stable'),
    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalDialog: document.getElementById('modal-dialog')
  };

  // Estado de la aplicación
  const state = {
    allPatients: [],
    filteredPatients: [],
    currentFilter: 'all',
    searchTerm: '',
    selectedPatientId: null,
    theme: localStorage.getItem('medipulse-theme') || 'dark'
  };

  /**
   * Inicializa el tema visual (Dark / Light)
   */
  const initTheme = () => {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeButtonUI();
  };

  const toggleTheme = () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('medipulse-theme', state.theme);
    updateThemeButtonUI();
  };

  const updateThemeButtonUI = () => {
    if (elements.themeIcon && elements.themeText) {
      if (state.theme === 'dark') {
        elements.themeIcon.textContent = '☀️';
        elements.themeText.textContent = 'Modo Claro';
      } else {
        elements.themeIcon.textContent = '🌙';
        elements.themeText.textContent = 'Modo Oscuro';
      }
    }
  };

  /**
   * Carga los datos de pacientes exclusivamente desde el archivo contextual data/pacientes.json
   * Cumpliendo la Normativa 2 de la asignación (Contexto de datos externo).
   */
  const loadPatientsData = async () => {
    try {
      const response = await fetch('./data/pacientes.json');
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: No se pudo leer el archivo data/pacientes.json`);
      }
      const rawData = await response.json();
      state.allPatients = DataSanitizer.sanitizePatientList(rawData);
      state.filteredPatients = [...state.allPatients];
      updateMetrics();
      renderCurrentState();
    } catch (error) {
      console.error('Error al cargar data/pacientes.json:', error);
      renderErrorState(error);
    }
  };

  /**
   * Notificación visual en UI si la fuente de datos no responde
   */
  const renderErrorState = (error) => {
    if (!elements.grid) return;
    elements.grid.innerHTML = `
      <div class="empty-state-card" role="alert" style="border-color: var(--status-critical);">
        <div class="empty-state-icon">⚠️</div>
        <h3 style="color: var(--status-critical);">Error de Conexión con el Archivo de Datos</h3>
        <p>No fue posible obtener los registros de <code>data/pacientes.json</code>.</p>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.5rem;">
          ${error.message}
        </p>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
          Asegúrese de servir la aplicación mediante un servidor HTTP local (ej. Live Server, <code>python -m http.server</code>) o en la plataforma de despliegue en la nube.
        </p>
      </div>
    `;
  };

  /**
   * Actualiza los contadores de la barra de métricas
   */
  const updateMetrics = () => {
    const total = state.allPatients.length;
    const critical = state.allPatients.filter(p => p.estado === 'Crítico').length;
    const obs = state.allPatients.filter(p => p.estado === 'En Observación').length;
    const stable = state.allPatients.filter(p => p.estado === 'Estable').length;

    if (elements.metricTotal) elements.metricTotal.textContent = total;
    if (elements.metricCritical) elements.metricCritical.textContent = critical;
    if (elements.metricObs) elements.metricObs.textContent = obs;
    if (elements.metricStable) elements.metricStable.textContent = stable;
  };

  /**
   * Aplica filtros y búsqueda
   */
  const applyFilters = () => {
    const term = state.searchTerm.toLowerCase().trim();

    state.filteredPatients = state.allPatients.filter(patient => {
      // Filtro por estado
      const matchesStatus = state.currentFilter === 'all' || patient.estado.toLowerCase() === state.currentFilter.toLowerCase();

      // Filtro por término de búsqueda (nombre, apellidos, DNI, diagnóstico o habitación)
      const matchesSearch = !term || (
        patient.nombre_completo.toLowerCase().includes(term) ||
        patient.nombres.toLowerCase().includes(term) ||
        patient.apellidos.toLowerCase().includes(term) ||
        patient.dni.toLowerCase().includes(term) ||
        patient.diagnostico_principal.toLowerCase().includes(term) ||
        patient.habitacion.toLowerCase().includes(term) ||
        patient.id.toLowerCase().includes(term)
      );

      return matchesStatus && matchesSearch;
    });

    renderCurrentState();
  };

  /**
   * Renderiza el estado visual actual llamando a CardRenderer
   */
  const renderCurrentState = () => {
    CardRenderer.renderGrid(elements.grid, state.filteredPatients);

    if (elements.resultsCount) {
      elements.resultsCount.textContent = state.filteredPatients.length;
    }

    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.style.display = state.searchTerm ? 'block' : 'none';
    }
  };

  /**
   * Apertura y Cierre del Modal
   */
  const openPatientModal = (patientId) => {
    const patient = state.allPatients.find(p => p.id === patientId);
    if (!patient) return;

    CardRenderer.populateModal(elements.modalDialog, patient);
    elements.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closePatientModal = () => {
    elements.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  /**
   * Asignación de Event Listeners
   */
  const bindEvents = () => {
    // Búsqueda en tiempo real
    elements.searchInput?.addEventListener('input', (e) => {
      state.searchTerm = e.target.value;
      applyFilters();
    });

    // Limpiar búsqueda
    elements.clearSearchBtn?.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchTerm = '';
      applyFilters();
      elements.searchInput.focus();
    });

    // Filtros de estado por chips
    elements.filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        elements.filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentFilter = chip.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });

    // Alternar tema
    elements.themeToggleBtn?.addEventListener('click', toggleTheme);

    // Delegación de eventos en el grid (abrir modal o reset de filtros vacíos)
    elements.grid?.addEventListener('click', (e) => {
      const openBtn = e.target.closest('[data-action="open-modal"]');
      if (openBtn) {
        const patientId = openBtn.getAttribute('data-id');
        openPatientModal(patientId);
        return;
      }

      if (e.target.id === 'btn-reset-filters') {
        state.searchTerm = '';
        state.currentFilter = 'all';
        if (elements.searchInput) elements.searchInput.value = '';
        elements.filterChips.forEach(c => {
          if (c.getAttribute('data-filter') === 'all') c.classList.add('active');
          else c.classList.remove('active');
        });
        applyFilters();
      }
    });

    // Delegación de cierre de modal
    elements.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === elements.modalOverlay || e.target.closest('[data-action="close-modal"]')) {
        closePatientModal();
      }
    });

    // Cierre de modal con tecla Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.modalOverlay.classList.contains('active')) {
        closePatientModal();
      }
    });
  };

  // Comando personalizado accesible desde la consola: /renderizar_tarjetas
  window.renderizar_tarjetas = () => {
    console.log('%c[Skill /renderizar_tarjetas]%c Renderizando componentes de tarjetas clínicas...', 'color: #06b6d4; font-weight: bold;', 'color: inherit;');
    renderCurrentState();
    return `Se renderizaron exitosamente ${state.filteredPatients.length} tarjetas de pacientes.`;
  };

  // Inicialización
  initTheme();
  bindEvents();
  loadPatientsData();

});
