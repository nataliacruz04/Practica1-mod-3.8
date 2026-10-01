/**
 * M5: Inteligencia con salida estructurada JSON
 * Integración con Gemini 3.8 Flash mediante esquema estricto (responseSchema)
 */

export interface RespuestaEstructuradaGemini {
  puntos_repaso: string[];
  resumen_diagnostico: string;
}

export interface SolicitudRepasoPayload {
  tema: string;
  votos: {
    entendi: number;
    dudas: number;
    perdi: number;
  };
  comentarios: {
    opcion: string;
    texto: string;
  }[];
}

/**
 * Solicita al backend la generación de recomendaciones pedagógicas
 * asegurando la recepción de un JSON validado bajo el esquema de Gemini.
 */
export async function solicitarRepasoEstructurado(
  payload: SolicitudRepasoPayload
): Promise<RespuestaEstructuradaGemini> {
  const response = await fetch('/api/generar-repaso', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Error en el servicio de análisis pedagógico (${response.status})`
    );
  }

  const datos: RespuestaEstructuradaGemini = await response.json();

  if (!Array.isArray(datos.puntos_repaso) || typeof datos.resumen_diagnostico !== 'string') {
    throw new Error('La respuesta del modelo de IA no cumple con la estructura JSON esperada.');
  }

  return datos;
}
