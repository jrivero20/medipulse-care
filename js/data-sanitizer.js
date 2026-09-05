/**
 * DataSanitizer Module
 * Encargado de la sanitización, división de campos agrupados y resiliencia
 * ante variables nulas o indefinidas en el dataset clínico.
 */

const DataSanitizer = (() => {

  /**
   * Divide un nombre completo en Nombres y Apellidos.
   * Maneja nombres compuestos de 2, 3 o más términos de forma inteligente.
   * @param {string|null|undefined} fullName 
   * @returns {{ nombres: string, apellidos: string, displayNames: string }}
   */
  const splitFullName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') {
      return {
        nombres: 'Nombre No Registrado',
        apellidos: '',
        displayNames: 'Paciente Anónimo'
      };
    }

    const words = fullName.trim().split(/\s+/);

    if (words.length === 1) {
      return {
        nombres: words[0],
        apellidos: 'No registrado',
        displayNames: words[0]
      };
    }

    if (words.length === 2) {
      return {
        nombres: words[0],
        apellidos: words[1],
        displayNames: `${words[0]} ${words[1]}`
      };
    }

    if (words.length === 3) {
      return {
        nombres: words[0],
        apellidos: `${words[1]} ${words[2]}`,
        displayNames: `${words[0]} ${words[1]} ${words[2]}`
      };
    }

    // 4 o más palabras: primeros dos nombres, el resto apellidos
    const middleIndex = Math.floor(words.length / 2);
    const nombres = words.slice(0, middleIndex).join(' ');
    const apellidos = words.slice(middleIndex).join(' ');

    return {
      nombres,
      apellidos,
      displayNames: `${nombres} ${apellidos}`
    };
  };

  /**
   * Genera iniciales a partir de un nombre para el avatar.
   * @param {string} nombres 
   * @param {string} apellidos 
   * @returns {string}
   */
  const getInitials = (nombres, apellidos) => {
    const firstInitial = (nombres?.[0] || 'P').toUpperCase();
    const lastInitial = (apellidos?.[0] || '').toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  /**
   * Formatea una fecha ISO a un formato legible en español.
   * @param {string|null} isoString 
   * @returns {string}
   */
  const formatDate = (isoString) => {
    if (!isoString) return 'Fecha no especificada';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Fecha no disponible';
    }
  };

  /**
   * Sanitiza un registro de paciente completo aplicando defensas estrictas
   * contra valores nulos o indefinidos para evitar fallos de renderizado.
   * @param {Object} rawPatient 
   * @returns {Object} Paciente sanitizado con fallbacks visuales
   */
  const sanitizePatient = (rawPatient) => {
    if (!rawPatient || typeof rawPatient !== 'object') {
      return null;
    }

    // División de nombres
    const nameData = splitFullName(rawPatient.nombre_completo);

    // Identificador
    const id = rawPatient.id ?? `MED-${Math.floor(Math.random() * 9000 + 1000)}`;

    // DNI / Identificación
    const dni = rawPatient.dni ? String(rawPatient.dni) : 'Sin documento';

    // Edad y Género
    const edad = typeof rawPatient.edad === 'number' ? `${rawPatient.edad} años` : 'Edad no indicada';
    const genero = rawPatient.genero ?? 'No especificado';

    // Tipo de Sangre
    const tipo_sangre = rawPatient.tipo_sangre ?? null;

    // Estado Clínico
    const estadoValido = ['Crítico', 'En Observación', 'Estable', 'Alta'];
    const estado = estadoValido.includes(rawPatient.estado) ? rawPatient.estado : 'Estable';

    // Diagnóstico
    const diagnostico_principal = rawPatient.diagnostico_principal?.trim() || 'Evaluación médica general en curso';

    // Habitación / Ubicación
    const habitacion = rawPatient.habitacion?.trim() || 'Área de Triaje';

    // Médico Tratante
    const medico_tratante = rawPatient.medico_tratante?.trim() || 'Médico de Guardia';

    // Signos Vitales con fallback individual
    const rawVitals = rawPatient.signos_vitales || {};
    const signos_vitales = {
      presion: rawVitals.presion ?? 'S/R',
      frecuencia_cardiaca: typeof rawVitals.frecuencia_cardiaca === 'number' ? `${rawVitals.frecuencia_cardiaca} lpm` : 'S/R',
      saturacion_oxigeno: typeof rawVitals.saturacion_oxigeno === 'number' ? `${rawVitals.saturacion_oxigeno}%` : 'S/R',
      temperatura: typeof rawVitals.temperatura === 'number' ? `${rawVitals.temperatura} °C` : 'S/R'
    };

    // Alergias (puede ser null, undefined, array vacío o array con datos)
    let alergiasInfo = {
      items: [],
      hasAllergies: false,
      displayText: 'Sin alergias reportadas'
    };

    if (Array.isArray(rawPatient.alergias) && rawPatient.alergias.length > 0) {
      alergiasInfo = {
        items: rawPatient.alergias.filter(a => typeof a === 'string' && a.trim().length > 0),
        hasAllergies: true,
        displayText: rawPatient.alergias.join(', ')
      };
    } else if (rawPatient.alergias === null) {
      alergiasInfo.displayText = 'No registradas (Pendiente interrogatorio)';
    }

    // Teléfono
    const telefono = {
      value: rawPatient.telefono ?? null,
      displayText: rawPatient.telefono ? String(rawPatient.telefono) : 'No registrado',
      isNull: !rawPatient.telefono
    };

    // Contacto de Emergencia
    const rawContact = rawPatient.contacto_emergencia;
    const contacto_emergencia = {
      nombre: rawContact?.nombre ?? 'Sin contacto asignado',
      telefono: rawContact?.telefono ?? 'No disponible',
      isNull: !rawContact || (!rawContact.nombre && !rawContact.telefono)
    };

    // Seguro Médico
    const seguro_medico = {
      value: rawPatient.seguro_medico ?? null,
      displayText: (rawPatient.seguro_medico && rawPatient.seguro_medico.trim().length > 0)
        ? rawPatient.seguro_medico
        : 'Particular (Sin cobertura)',
      isNull: !rawPatient.seguro_medico || rawPatient.seguro_medico.trim().length === 0
    };

    // Notas de Evolución
    const notas_evolucion = rawPatient.notas_evolucion?.trim() || 'Sin notas registradas en este turno.';

    return {
      id,
      nombre_completo: nameData.displayNames,
      nombres: nameData.nombres,
      apellidos: nameData.apellidos,
      initials: getInitials(nameData.nombres, nameData.apellidos),
      dni,
      edad,
      genero,
      tipo_sangre,
      estado,
      diagnostico_principal,
      fecha_ingreso_raw: rawPatient.fecha_ingreso,
      fecha_ingreso_formatted: formatDate(rawPatient.fecha_ingreso),
      habitacion,
      medico_tratante,
      signos_vitales,
      alergias: alergiasInfo,
      telefono,
      contacto_emergencia,
      seguro_medico,
      notas_evolucion
    };
  };

  /**
   * Sanitiza una lista completa de pacientes
   * @param {Array} rawList 
   * @returns {Array} Lista sanitizada
   */
  const sanitizePatientList = (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map(sanitizePatient).filter(Boolean);
  };

  return {
    splitFullName,
    sanitizePatient,
    sanitizePatientList
  };

})();

// Exportación para entornos modulares o global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataSanitizer;
}
