/**
 * M1: Función de registro de votos por tema y comentarios
 * Lógica modular para registrar y acumular votos con sus comentarios vinculados al tema.
 */

import { OpcionVoto, EstadoPulso } from './App';

export interface RegistroVotoEntrada {
  opcion: OpcionVoto;
  tema: string;
  comentario?: string;
}

/**
 * Registra un nuevo voto, incrementa los contadores del termómetro pedagógico
 * y almacena el comentario anónimo asociado al tema de la clase.
 */
export function registrarVoto(
  estadoPrevio: EstadoPulso,
  entrada: RegistroVotoEntrada
): EstadoPulso {
  const temaNormalizado = entrada.tema?.trim() || estadoPrevio.tema || 'Tema de la clase';
  
  const nuevosVotos = {
    entendi: estadoPrevio.votos.entendi + (entrada.opcion === 'entendi' ? 1 : 0),
    dudas: estadoPrevio.votos.dudas + (entrada.opcion === 'dudas' ? 1 : 0),
    perdi: estadoPrevio.votos.perdi + (entrada.opcion === 'perdi' ? 1 : 0),
  };

  const comentariosActualizados = [...estadoPrevio.comentarios];

  if (entrada.comentario && entrada.comentario.trim().length > 0) {
    const fechaActual = new Date();
    const horaStr = fechaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    comentariosActualizados.unshift({
      id: `voto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      opcion: entrada.opcion,
      texto: entrada.comentario.trim(),
      tema: temaNormalizado,
      hora: horaStr,
    });
  }

  return {
    tema: temaNormalizado,
    votos: nuevosVotos,
    comentarios: comentariosActualizados,
  };
}
