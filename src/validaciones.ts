/**
 * M4: Módulo de validaciones y manejo de errores para PULSO CLASE
 */

import { OpcionVoto } from './App';

export interface ResultadoValidacion {
  valido: boolean;
  error?: string;
}

/**
 * Valida la selección del voto antes de enviarlo
 */
export function validarSeleccionVoto(opcion: OpcionVoto | null): ResultadoValidacion {
  if (!opcion) {
    return {
      valido: false,
      error: 'Por favor, seleccioná una de las tres opciones para registrar tu pulso.',
    };
  }

  const opcionesValidas: OpcionVoto[] = ['entendi', 'dudas', 'perdi'];
  if (!opcionesValidas.includes(opcion)) {
    return {
      valido: false,
      error: 'La opción de voto seleccionada no es reconocida.',
    };
  }

  return { valido: true };
}

/**
 * Valida el nombre o tema de la clase
 */
export function validarTemaClase(tema: string): ResultadoValidacion {
  const temaLimpio = tema ? tema.trim() : '';
  if (temaLimpio.length === 0) {
    return {
      valido: false,
      error: 'El tema de la clase no puede estar vacío.',
    };
  }

  if (temaLimpio.length > 120) {
    return {
      valido: false,
      error: 'El nombre del tema es demasiado largo (máximo 120 caracteres).',
    };
  }

  return { valido: true };
}

/**
 * Valida y sanitiza el comentario adicional
 */
export function validarComentario(comentario: string): ResultadoValidacion {
  if (!comentario) return { valido: true };

  if (comentario.length > 500) {
    return {
      valido: false,
      error: 'El comentario no puede superar los 500 caracteres.',
    };
  }

  return { valido: true };
}

/**
 * Calcula porcentajes de forma segura evitando división por cero o NaN
 */
export function calcularPorcentajeSeguro(votosOpcion: number, totalVotos: number): number {
  if (!totalVotos || totalVotos <= 0 || isNaN(totalVotos)) return 0;
  if (!votosOpcion || votosOpcion <= 0 || isNaN(votosOpcion)) return 0;
  return Math.round((votosOpcion / totalVotos) * 100);
}
