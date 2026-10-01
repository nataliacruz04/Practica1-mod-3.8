/**
 * Módulo de persistencia en localStorage para PULSO CLASE (Hito M2)
 */

export const STORAGE_KEY = 'pulso_clase_v1_data';

export interface EstadoPulsoStorage {
  tema: string;
  votos: {
    entendi: number;
    dudas: number;
    perdi: number;
  };
  comentarios: {
    id: string;
    opcion: 'entendi' | 'dudas' | 'perdi';
    texto: string;
    tema: string;
    hora: string;
  }[];
}

/**
 * Lee los datos de la clase desde localStorage con validación defensiva
 */
export function leerDatosAlmacenados(respaldoPorDefecto: EstadoPulsoStorage): EstadoPulsoStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return respaldoPorDefecto;

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.votos &&
      typeof parsed.votos.entendi === 'number' &&
      typeof parsed.votos.dudas === 'number' &&
      typeof parsed.votos.perdi === 'number' &&
      Array.isArray(parsed.comentarios)
    ) {
      return {
        tema: typeof parsed.tema === 'string' && parsed.tema.trim() ? parsed.tema : 'Tema de la clase',
        votos: {
          entendi: parsed.votos.entendi,
          dudas: parsed.votos.dudas,
          perdi: parsed.votos.perdi,
        },
        comentarios: parsed.comentarios,
      };
    }
  } catch (error) {
    console.warn('Error al leer de localStorage, se utilizarán los datos por defecto:', error);
  }
  return respaldoPorDefecto;
}

/**
 * Guarda los datos actuales de la clase en localStorage
 */
export function guardarDatosAlmacenados(datos: EstadoPulsoStorage): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    return true;
  } catch (error) {
    console.error('Error al guardar en localStorage (posible memoria llena o modo privado):', error);
    return false;
  }
}

/**
 * Restablece los contadores para iniciar una nueva clase
 */
export function reiniciarDatosAlmacenados(nuevoTema: string = 'Nueva clase'): EstadoPulsoStorage {
  const limpio: EstadoPulsoStorage = {
    tema: nuevoTema.trim() || 'Nueva clase',
    votos: { entendi: 0, dudas: 0, perdi: 0 },
    comentarios: [],
  };
  guardarDatosAlmacenados(limpio);
  return limpio;
}

/**
 * Genera y descarga un archivo .json con los resultados de la clase actual
 */
export function exportarDatosAJSON(datos: EstadoPulsoStorage): void {
  try {
    const jsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(datos, null, 2));
    const enlace = document.createElement('a');
    const temaFormateado = (datos.tema || 'clase')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/gi, '_');

    enlace.setAttribute('href', jsonString);
    enlace.setAttribute('download', `pulso_clase_${temaFormateado}.json`);
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  } catch (error) {
    console.error('Error al exportar archivo JSON:', error);
  }
}
