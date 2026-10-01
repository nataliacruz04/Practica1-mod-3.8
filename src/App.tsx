import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  BarChart3, 
  MessageSquare, 
  Users, 
  RotateCcw, 
  Sparkles, 
  Vote,
  GraduationCap,
  Download,
  BookOpen,
  ArrowRight,
  Lightbulb,
  Loader2,
  HelpCircle
} from 'lucide-react';

export type OpcionVoto = 'entendi' | 'dudas' | 'perdi';

export interface VotoRegistro {
  id: string;
  opcion: OpcionVoto;
  comentario?: string;
  tema: string;
  fecha: string;
}

export interface EstadoPulso {
  tema: string;
  votos: {
    entendi: number;
    dudas: number;
    perdi: number;
  };
  comentarios: {
    id: string;
    opcion: OpcionVoto;
    texto: string;
    tema: string;
    hora: string;
  }[];
}

// Estructura fija requerida para la respuesta de Gemini (responseSchema)
export interface RespuestaRepaso {
  puntos_repaso: string[];
  resumen_diagnostico: string;
}

// JSON de ejemplo de respuesta para probar offline sin consumir cuota de API
export const REPASO_EJEMPLO_OFFLINE: RespuestaRepaso = {
  resumen_diagnostico:
    'El 39% del grupo manifestó dudas o desorientación en el despeje algebraico y el ritmo de la explicación, mientras que la mayoría comprendió el concepto central.',
  puntos_repaso: [
    'Dedicar los primeros 8 minutos a resolver paso a paso en el pizarrón el despeje de la fórmula general, enfatizando el cambio de signos dentro del radicando.',
    'Pedir a los estudiantes resolver un ejercicio en parejas intercambiando cuadernos en el segundo paso para detectar exactamente en qué renglón aparece la traba.',
    'Vincular visualmente las raíces obtenidas con el gráfico de la parábola antes de avanzar con problemas de aplicación en la vida cotidiana.',
  ],
};

const STORAGE_KEY = 'pulso_clase_v1_data';

// Datos de ejemplo para pruebas o demostración
const DATOS_EJEMPLO: EstadoPulso = {
  tema: 'Ecuaciones Cuadráticas',
  votos: {
    entendi: 14,
    dudas: 6,
    perdi: 3,
  },
  comentarios: [
    {
      id: 'demo-1',
      opcion: 'dudas',
      texto: 'Me perdí en el segundo paso del despeje de la fórmula.',
      tema: 'Ecuaciones Cuadráticas',
      hora: '10:42',
    },
    {
      id: 'demo-2',
      opcion: 'perdi',
      texto: 'Fue muy rápido el paso de las diapositivas al final.',
      tema: 'Ecuaciones Cuadráticas',
      hora: '10:44',
    },
    {
      id: 'demo-3',
      opcion: 'entendi',
      texto: 'El ejercicio práctico ayudó mucho a entender.',
      tema: 'Ecuaciones Cuadráticas',
      hora: '10:45',
    },
  ],
};

export default function App() {
  // Estado inicial leyendo localStorage con salvaguarda defensiva
  const [datos, setDatos] = useState<EstadoPulso>(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (
          parsed &&
          parsed.votos &&
          typeof parsed.votos.entendi === 'number' &&
          typeof parsed.votos.dudas === 'number' &&
          typeof parsed.votos.perdi === 'number'
        ) {
          return {
            ...parsed,
            tema: typeof parsed.tema === 'string' && parsed.tema.trim() ? parsed.tema : 'Tema de la clase',
          };
        }
      }
    } catch (e) {
      console.warn('Error leyendo almacenamiento local:', e);
    }
    return DATOS_EJEMPLO;
  });

  // Estado del tema de la clase activo
  const [temaClase, setTemaClase] = useState<string>(datos.tema || 'Ecuaciones Cuadráticas');
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<OpcionVoto | null>(null);
  const [comentario, setComentario] = useState<string>('');
  const [mensajeExito, setMensajeExito] = useState<boolean>(false);
  const [vistaActiva, setVistaActiva] = useState<'votar' | 'resumen'>('votar');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Estados para la llamada a Gemini
  const [repaso, setRepaso] = useState<RespuestaRepaso | null>(null);
  const [cargandoRepaso, setCargandoRepaso] = useState<boolean>(false);
  const [errorRepaso, setErrorRepaso] = useState<string | null>(null);

  // Llamada al endpoint del servidor que consulta a Gemini con responseSchema estructurado
  const handleGenerarRepasoIA = async () => {
    setCargandoRepaso(true);
    setErrorRepaso(null);
    try {
      const res = await fetch('/api/generar-repaso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema: datos.tema || temaClase,
          votos: datos.votos,
          comentarios: datos.comentarios,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Ocurrió un error en el servidor al generar el repaso.');
      }

      if (json && Array.isArray(json.puntos_repaso) && typeof json.resumen_diagnostico === 'string') {
        setRepaso(json);
      } else {
        throw new Error('El formato de respuesta recibido no coincide con el esquema requerido.');
      }
    } catch (err: any) {
      console.warn('Fallo en la llamada a Gemini:', err);
      // REQUISITO 4: Mensaje amigable en español sin tecnicismos ni congelar la app
      setErrorRepaso(
        'No pudimos conectar con el asistente de repaso en este momento. Verificá que la variable GEMINI_API_KEY esté configurada o probá el ejemplo de prueba sin conexión.'
      );
    } finally {
      setCargandoRepaso(false);
    }
  };

  // REQUISITO 5: Cargar JSON de ejemplo offline sin gastar llamadas de API
  const handleCargarEjemploOffline = () => {
    setRepaso(REPASO_EJEMPLO_OFFLINE);
    setErrorRepaso(null);
  };

  // Sincronizar tema si cambia externamente
  useEffect(() => {
    if (datos.tema && datos.tema !== temaClase) {
      setTemaClase(datos.tema);
    }
  }, [datos.tema]);

  // Persistir en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    } catch (error) {
      console.error('Error al guardar en el navegador:', error);
    }
  }, [datos]);

  // Cálculo seguro de votos y porcentajes (previene división por cero)
  const totalVotos = datos.votos.entendi + datos.votos.dudas + datos.votos.perdi;

  const calcularPorcentaje = (cantidad: number): number => {
    if (totalVotos === 0) return 0;
    return Math.round((cantidad / totalVotos) * 100);
  };

  const porcEntendi = calcularPorcentaje(datos.votos.entendi);
  const porcDudas = calcularPorcentaje(datos.votos.dudas);
  const porcPerdi = calcularPorcentaje(datos.votos.perdi);

  // Envío del voto
  const handleEnviarVoto = (e: React.FormEvent) => {
    e.preventDefault();

    if (!opcionSeleccionada) {
      setErrorValidacion('Elegí una opción (Entendí, Tengo dudas o Me perdí) para enviar.');
      return;
    }

    const temaLimpio = temaClase.trim() || 'Tema general';
    setErrorValidacion(null);

    const textoLimpio = comentario.trim();
    const ahora = new Date();
    const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDatos((prev) => {
      const nuevosVotos = {
        ...prev.votos,
        [opcionSeleccionada]: prev.votos[opcionSeleccionada] + 1,
      };

      const nuevosComentarios = textoLimpio
        ? [
            {
              id: Date.now().toString(),
              opcion: opcionSeleccionada,
              texto: textoLimpio,
              tema: temaLimpio,
              hora: horaFormateada,
            },
            ...prev.comentarios,
          ]
        : prev.comentarios;

      return {
        tema: temaLimpio,
        votos: nuevosVotos,
        comentarios: nuevosComentarios,
      };
    });

    setMensajeExito(true);
    setOpcionSeleccionada(null);
    setComentario('');
  };

  // Limpiar para nueva clase (Punto 5: genera estado vacío)
  const handleIniciarNuevaClase = () => {
    if (window.confirm('¿Querés limpiar las respuestas para iniciar una nueva clase en cero?')) {
      const estadoVacio: EstadoPulso = {
        tema: temaClase.trim() || 'Nueva clase',
        votos: { entendi: 0, dudas: 0, perdi: 0 },
        comentarios: [],
      };
      setDatos(estadoVacio);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoVacio));
      } catch (e) {}
      setMensajeExito(false);
      setVistaActiva('resumen');
    }
  };

  // Cargar datos de prueba
  const handleCargarEjemplo = () => {
    setDatos(DATOS_EJEMPLO);
    setTemaClase(DATOS_EJEMPLO.tema);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DATOS_EJEMPLO));
    } catch (e) {}
    setMensajeExito(false);
  };

  // Exportar a JSON
  const handleExportarJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(datos, null, 2));
      const downloadAnchor = document.createElement('a');
      const nombreLimpio = (datos.tema || 'clase').toLowerCase().replace(/[^a-z0-9]/gi, '_');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `pulso_clase_${nombreLimpio}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Error al exportar:', e);
    }
  };

  return (
    // REQUISITO 1: Funciona desde 320px de ancho sin scroll horizontal ni zoom
    // REQUISITO 2: Contraste alto con fondo claro, texto negro sólido y tamaño >= 16px (text-base)
    <div className="min-h-screen bg-slate-200 text-black flex flex-col font-sans antialiased text-base selection:bg-indigo-600 selection:text-white">
      
      {/* Barra de cabecera con alto contraste */}
      <header className="bg-white border-b-2 border-slate-900 sticky top-0 z-20 shadow-sm">
        <div className="w-full max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-black block leading-tight">
                PULSO CLASE
              </span>
              <span className="text-base text-slate-700 font-semibold block leading-tight">
                Pregunta de salida
              </span>
            </div>
          </div>

          {/* Selector de modo accesible con botón táctil grande */}
          <div className="flex bg-slate-100 p-1 rounded-xl border-2 border-slate-900">
            <button
              type="button"
              onClick={() => {
                setVistaActiva('votar');
                setMensajeExito(false);
              }}
              className={`px-3 py-2 rounded-lg text-base font-bold transition-all cursor-pointer ${
                vistaActiva === 'votar'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              Votar
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('resumen')}
              className={`px-3 py-2 rounded-lg text-base font-bold transition-all cursor-pointer ${
                vistaActiva === 'resumen'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'text-black hover:bg-slate-200'
              }`}
            >
              Resumen
            </button>
          </div>

        </div>
      </header>

      {/* Contenedor principal: ancho máximo de celular (320px a 512px) operable con una mano */}
      <main className="flex-1 w-full max-w-lg mx-auto p-3 sm:p-4 flex flex-col gap-4">

        {/* ================================================================= */}
        {/* PANTALLA 1: VOTACIÓN                                              */}
        {/* ================================================================= */}
        {vistaActiva === 'votar' && (
          <div className="flex flex-col gap-4">

            {/* REQUISITO 6: Mensaje de éxito visible, en español y sin tecnicismos */}
            {mensajeExito ? (
              <div className="bg-white border-4 border-emerald-700 rounded-2xl p-5 text-center space-y-4 shadow-md">
                <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-700 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black">
                    ¡Tu respuesta fue guardada!
                  </h2>
                  <p className="text-base text-slate-800 font-medium mt-1 leading-relaxed">
                    Gracias por tu sinceridad. Esto ayuda a repasar lo necesario antes del examen.
                  </p>
                </div>
                
                {/* REQUISITO 4: Un solo botón principal por pantalla */}
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setVistaActiva('resumen')}
                    className="w-full py-4 px-4 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white text-lg font-black rounded-xl border-2 border-slate-900 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Ver resumen de la clase</span>
                    <ArrowRight className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMensajeExito(false);
                      setOpcionSeleccionada(null);
                    }}
                    className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-black text-base font-bold rounded-xl border-2 border-slate-800 cursor-pointer"
                  >
                    Enviar otra respuesta
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnviarVoto} className="bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5">
                
                {/* Título de la pregunta */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-black leading-tight">
                    ¿Cómo te vas de la clase de hoy?
                  </h1>
                  <p className="text-base text-slate-800 font-medium mt-1">
                    Tu respuesta es anónima. Elegí la opción que mejor describa cómo terminaste.
                  </p>
                </div>

                {/* REQUISITO 6: Mensaje de error visible, en español y sin palabras técnicas */}
                {errorValidacion && (
                  <div className="p-4 bg-rose-100 border-3 border-rose-700 rounded-xl text-black text-base font-bold flex items-center gap-2 shadow-xs">
                    <AlertCircle className="w-6 h-6 shrink-0 text-rose-700" />
                    <span>{errorValidacion}</span>
                  </div>
                )}

                {/* REQUISITO 3: Todos los campos con etiqueta visible */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border-2 border-slate-800">
                  <label htmlFor="campo-tema" className="block text-base font-black text-black">
                    Tema de la clase:
                  </label>
                  <input
                    id="campo-tema"
                    type="text"
                    value={temaClase}
                    onChange={(e) => setTemaClase(e.target.value)}
                    placeholder="Escribí el tema visto hoy"
                    className="w-full text-base font-bold text-black bg-white border-2 border-slate-900 rounded-lg p-3 outline-none focus:ring-4 focus:ring-indigo-300"
                  />
                  <p className="text-base text-slate-700 font-semibold">
                    Podés cambiarlo si la clase trató de otro contenido.
                  </p>
                </div>

                {/* REQUISITO 3: Etiqueta visible para el grupo de opciones */}
                <div className="space-y-3">
                  <label className="block text-base font-black text-black">
                    Elegí una de estas tres opciones:
                  </label>

                  {/* Las tres opciones en botones grandes táctiles para usar con el pulgar */}
                  <div className="flex flex-col gap-2.5">
                    
                    {/* OPCIÓN 1: Entendí */}
                    <button
                      type="button"
                      onClick={() => {
                        setOpcionSeleccionada('entendi');
                        setErrorValidacion(null);
                      }}
                      className={`w-full min-h-[64px] p-3 rounded-xl border-3 text-left flex items-center justify-between transition-all cursor-pointer ${
                        opcionSeleccionada === 'entendi'
                          ? 'border-emerald-800 bg-emerald-100 ring-4 ring-emerald-300'
                          : 'border-slate-800 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🟢</span>
                        <div>
                          <strong className="block text-lg font-black text-black leading-tight">
                            Entendí
                          </strong>
                          <span className="text-base text-slate-800 font-semibold block">
                            Me quedó claro el tema
                          </span>
                        </div>
                      </div>
                      <span className={`w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center font-black ${
                        opcionSeleccionada === 'entendi' ? 'bg-emerald-700 text-white' : 'bg-white'
                      }`}>
                        {opcionSeleccionada === 'entendi' ? '✓' : ''}
                      </span>
                    </button>

                    {/* OPCIÓN 2: Tengo dudas */}
                    <button
                      type="button"
                      onClick={() => {
                        setOpcionSeleccionada('dudas');
                        setErrorValidacion(null);
                      }}
                      className={`w-full min-h-[64px] p-3 rounded-xl border-3 text-left flex items-center justify-between transition-all cursor-pointer ${
                        opcionSeleccionada === 'dudas'
                          ? 'border-amber-800 bg-amber-100 ring-4 ring-amber-300'
                          : 'border-slate-800 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🟡</span>
                        <div>
                          <strong className="block text-lg font-black text-black leading-tight">
                            Tengo dudas
                          </strong>
                          <span className="text-base text-slate-800 font-semibold block">
                            Entendí pero me trabo en partes
                          </span>
                        </div>
                      </div>
                      <span className={`w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center font-black ${
                        opcionSeleccionada === 'dudas' ? 'bg-amber-700 text-white' : 'bg-white'
                      }`}>
                        {opcionSeleccionada === 'dudas' ? '✓' : ''}
                      </span>
                    </button>

                    {/* OPCIÓN 3: Me perdí */}
                    <button
                      type="button"
                      onClick={() => {
                        setOpcionSeleccionada('perdi');
                        setErrorValidacion(null);
                      }}
                      className={`w-full min-h-[64px] p-3 rounded-xl border-3 text-left flex items-center justify-between transition-all cursor-pointer ${
                        opcionSeleccionada === 'perdi'
                          ? 'border-rose-800 bg-rose-100 ring-4 ring-rose-300'
                          : 'border-slate-800 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🔴</span>
                        <div>
                          <strong className="block text-lg font-black text-black leading-tight">
                            Me perdí
                          </strong>
                          <span className="text-base text-slate-800 font-semibold block">
                            No pude seguir la lección
                          </span>
                        </div>
                      </div>
                      <span className={`w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center font-black ${
                        opcionSeleccionada === 'perdi' ? 'bg-rose-700 text-white' : 'bg-white'
                      }`}>
                        {opcionSeleccionada === 'perdi' ? '✓' : ''}
                      </span>
                    </button>

                  </div>
                </div>

                {/* REQUISITO 3: Etiqueta visible para el comentario */}
                <div className="space-y-1.5 pt-2 border-t-2 border-slate-300">
                  <label htmlFor="campo-comentario" className="block text-base font-black text-black">
                    Comentario anónimo (opcional):
                  </label>
                  <textarea
                    id="campo-comentario"
                    rows={3}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Escribí aquí si querés aclarar qué ejercicio o concepto te costó"
                    className="w-full text-base text-black bg-white border-2 border-slate-900 rounded-lg p-3 outline-none focus:ring-4 focus:ring-indigo-300 font-medium"
                  />
                  <p className="text-base text-slate-700 font-semibold">
                    Nadie sabrá quién lo escribió. No pongas tu nombre.
                  </p>
                </div>

                {/* REQUISITO 4: UN SOLO BOTÓN PRINCIPAL POR PANTALLA */}
                <button
                  type="submit"
                  className="w-full min-h-[58px] bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white text-xl font-black rounded-xl border-3 border-slate-900 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-6 h-6" />
                  <span>Enviar Voto</span>
                </button>

              </form>
            )}

          </div>
        )}

        {/* ================================================================= */}
        {/* PANTALLA 2: RESUMEN Y GRÁFICO DE BARRAS                           */}
        {/* ================================================================= */}
        {vistaActiva === 'resumen' && (
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5">
            
            {/* Cabecera del resumen con el tema activo */}
            <div className="border-b-2 border-slate-300 pb-3">
              <span className="text-base font-black text-indigo-800 uppercase tracking-wide block">
                Tema evaluado:
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight mt-0.5">
                {datos.tema || temaClase}
              </h2>
              <p className="text-base text-slate-800 font-bold mt-1">
                Total de respuestas: {totalVotos} {totalVotos === 1 ? 'estudiante' : 'estudiantes'}
              </p>
            </div>

            {/* REQUISITO 5: ESTADO VACÍO CUANDO NO HAY VOTOS REGISTRADOS */}
            {totalVotos === 0 ? (
              <div className="p-6 bg-amber-50 border-3 border-amber-600 rounded-2xl text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 border-2 border-amber-700 text-amber-900 rounded-full flex items-center justify-center mx-auto text-3xl">
                  📢
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black">
                    Aún no hay votos registrados
                  </h3>
                  <p className="text-base text-slate-900 font-semibold mt-2 leading-relaxed">
                    Esta clase está lista para comenzar. Pedile a tus estudiantes que elijan cómo se sienten al terminar la explicación para ver las barras aquí en vivo.
                  </p>
                </div>

                {/* REQUISITO 4: Botón principal de la pantalla de estado vacío */}
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVistaActiva('votar');
                      setMensajeExito(false);
                    }}
                    className="w-full py-4 px-4 bg-indigo-700 hover:bg-indigo-800 text-white text-lg font-black rounded-xl border-2 border-slate-900 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Vote className="w-6 h-6" />
                    <span>Iniciar y emitir primer voto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCargarEjemplo}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-black text-base font-bold rounded-xl border-2 border-slate-800 cursor-pointer"
                  >
                    Ver ejemplo con votos de prueba
                  </button>
                </div>
              </div>
            ) : (
              // GRÁFICO DE BARRAS DE ALTO CONTRASTE (Legible al sol)
              <div className="space-y-5">
                
                {/* BARRA 1: Entendí */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-base font-black text-black">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🟢</span>
                      <span>Entendí</span>
                    </span>
                    <span className="text-lg font-black text-emerald-900">
                      {datos.votos.entendi} votos ({porcEntendi}%)
                    </span>
                  </div>
                  <div className="h-8 w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-900 p-0.5">
                    <div
                      style={{ width: `${porcEntendi}%` }}
                      className="h-full bg-emerald-600 rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    >
                      {porcEntendi >= 20 && (
                        <span className="text-base font-black text-white leading-none">
                          {porcEntendi}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BARRA 2: Tengo dudas */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-base font-black text-black">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🟡</span>
                      <span>Tengo dudas</span>
                    </span>
                    <span className="text-lg font-black text-amber-900">
                      {datos.votos.dudas} votos ({porcDudas}%)
                    </span>
                  </div>
                  <div className="h-8 w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-900 p-0.5">
                    <div
                      style={{ width: `${porcDudas}%` }}
                      className="h-full bg-amber-500 rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    >
                      {porcDudas >= 20 && (
                        <span className="text-base font-black text-black leading-none">
                          {porcDudas}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BARRA 3: Me perdí */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-base font-black text-black">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🔴</span>
                      <span>Me perdí</span>
                    </span>
                    <span className="text-lg font-black text-rose-900">
                      {datos.votos.perdi} votos ({porcPerdi}%)
                    </span>
                  </div>
                  <div className="h-8 w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-900 p-0.5">
                    <div
                      style={{ width: `${porcPerdi}%` }}
                      className="h-full bg-rose-600 rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    >
                      {porcPerdi >= 20 && (
                        <span className="text-base font-black text-white leading-none">
                          {porcPerdi}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* LISTADO DE COMENTARIOS ANÓNIMOS */}
                <div className="pt-4 border-t-2 border-slate-300 space-y-3">
                  <h3 className="text-lg font-black text-black">
                    Comentarios anónimos recibidos ({datos.comentarios.length}):
                  </h3>

                  {datos.comentarios.length === 0 ? (
                    <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-400 rounded-xl text-center">
                      <p className="text-base text-slate-700 font-semibold">
                        Ningún alumno escribió comentarios adicionales en esta clase.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {datos.comentarios.map((item) => {
                        const estiloBorde = {
                          entendi: 'border-emerald-700 bg-emerald-50',
                          dudas: 'border-amber-700 bg-amber-50',
                          perdi: 'border-rose-700 bg-rose-50',
                        }[item.opcion];

                        const etiquetaTexto = {
                          entendi: '🟢 Entendió',
                          dudas: '🟡 Con dudas',
                          perdi: '🔴 Se perdió',
                        }[item.opcion];

                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-xl border-2 ${estiloBorde} text-black space-y-1.5 shadow-xs`}
                          >
                            <div className="flex justify-between items-center text-base font-black">
                              <span>{etiquetaTexto}</span>
                              <span className="text-slate-700">{item.hora}</span>
                            </div>
                            <p className="text-base font-semibold leading-relaxed">
                              "{item.texto}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ========================================================= */}
                {/* REQUISITO 2: SECCIÓN RECOMENDACIÓN DE REPASO (GEMINI API) */}
                {/* ========================================================= */}
                <div className="pt-4 border-t-2 border-slate-300 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-base font-black">
                        <Sparkles className="w-5 h-5 text-indigo-700" />
                        <span>Recomendación de Repaso</span>
                      </span>
                      <h3 className="text-xl font-black text-black mt-1">
                        Plan para la próxima clase
                      </h3>
                    </div>

                    {!repaso && !cargandoRepaso && (
                      <button
                        type="button"
                        onClick={handleCargarEjemploOffline}
                        className="text-base font-bold text-indigo-800 underline hover:text-indigo-950 cursor-pointer"
                      >
                        Probar ejemplo sin conexión
                      </button>
                    )}
                  </div>

                  {/* Estado de carga animado */}
                  {cargandoRepaso && (
                    <div className="p-5 bg-indigo-50 border-2 border-indigo-700 rounded-xl text-center space-y-2">
                      <Loader2 className="w-8 h-8 text-indigo-700 animate-spin mx-auto" />
                      <p className="text-base font-black text-black">
                        Analizando votos y comentarios anónimos con Gemini...
                      </p>
                      <p className="text-base text-slate-700 font-semibold">
                        Generando los 3 puntos concretos para tu próxima sesión.
                      </p>
                    </div>
                  )}

                  {/* REQUISITO 4: Manejo de error amigable sin congelar la app */}
                  {errorRepaso && (
                    <div className="p-4 bg-rose-50 border-3 border-rose-700 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-rose-900 font-black text-base">
                        <AlertCircle className="w-6 h-6 text-rose-700 shrink-0" />
                        <span>No se pudo conectar con el servicio</span>
                      </div>
                      <p className="text-base text-slate-900 font-medium">
                        {errorRepaso}
                      </p>
                      <div className="pt-1 flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleGenerarRepasoIA}
                          className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-base rounded-lg cursor-pointer"
                        >
                          Reintentar
                        </button>
                        <button
                          type="button"
                          onClick={handleCargarEjemploOffline}
                          className="px-3 py-1.5 bg-white border-2 border-slate-900 text-black font-bold text-base rounded-lg cursor-pointer"
                        >
                          Cargar ejemplo de prueba
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Estado inicial: botón para solicitar la generación */}
                  {!repaso && !cargandoRepaso && !errorRepaso && (
                    <div className="p-4 bg-slate-50 border-2 border-slate-800 rounded-xl space-y-3">
                      <p className="text-base text-slate-800 font-medium leading-relaxed">
                        Gemini analiza los {datos.comentarios.length} comentarios y el termómetro de votos para sugerirte exactamente 3 puntos de repaso para iniciar tu próxima sesión.
                      </p>
                      <button
                        type="button"
                        onClick={handleGenerarRepasoIA}
                        className="w-full py-3.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white text-base font-black rounded-xl border-2 border-slate-900 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>Generar 3 puntos de repaso con IA</span>
                      </button>
                    </div>
                  )}

                  {/* REQUISITO 2: Tarjeta con los 3 puntos de repaso estructurados */}
                  {repaso && (
                    <div className="p-4 bg-indigo-50/70 border-3 border-indigo-800 rounded-2xl space-y-4">
                      {/* Diagnóstico pedagógico */}
                      <div className="space-y-1">
                        <span className="text-base font-black text-indigo-900 uppercase tracking-wide block">
                          Diagnóstico del grupo:
                        </span>
                        <p className="text-base text-black font-semibold leading-relaxed">
                          {repaso.resumen_diagnostico}
                        </p>
                      </div>

                      {/* Tres puntos concretos */}
                      <div className="space-y-2.5">
                        <span className="text-base font-black text-black block">
                          Tres puntos recomendados para la siguiente clase:
                        </span>
                        <div className="flex flex-col gap-2">
                          {repaso.puntos_repaso.map((punto, index) => (
                            <div
                              key={index}
                              className="p-3 bg-white border-2 border-indigo-700 rounded-xl flex items-start gap-3 shadow-xs"
                            >
                              <span className="w-7 h-7 rounded-full bg-indigo-700 text-white font-black text-base flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <p className="text-base font-bold text-black leading-snug">
                                {punto}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botones para regenerar u ocultar */}
                      <div className="pt-2 flex justify-between items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleGenerarRepasoIA}
                          disabled={cargandoRepaso}
                          className="px-3 py-2 bg-white hover:bg-slate-100 text-black border-2 border-slate-900 font-bold text-base rounded-xl cursor-pointer"
                        >
                          Regenerar recomendación
                        </button>
                        <button
                          type="button"
                          onClick={() => setRepaso(null)}
                          className="text-base font-semibold text-slate-700 hover:text-black underline cursor-pointer"
                        >
                          Ocultar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTONES DE ACCIÓN: Un principal y dos secundarios */}
                <div className="pt-2 flex flex-col gap-2.5">
                  {/* REQUISITO 4: Botón principal */}
                  <button
                    type="button"
                    onClick={() => {
                      setVistaActiva('votar');
                      setMensajeExito(false);
                    }}
                    className="w-full min-h-[54px] bg-indigo-700 hover:bg-indigo-800 text-white text-lg font-black rounded-xl border-2 border-slate-900 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Vote className="w-6 h-6" />
                    <span>Registrar otro voto</span>
                  </button>

                  {/* Botones secundarios diferenciados (outline / fondo neutro) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleExportarJSON}
                      className="py-3 px-3 bg-white hover:bg-slate-100 text-black text-base font-bold rounded-xl border-2 border-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      <span>Guardar archivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleIniciarNuevaClase}
                      className="py-3 px-3 bg-white hover:bg-rose-50 text-rose-800 hover:text-rose-900 text-base font-bold rounded-xl border-2 border-rose-800 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Nueva clase</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Pie visible y legible */}
      <footer className="bg-white border-t-2 border-slate-900 py-3 text-center px-4">
        <p className="text-base text-slate-800 font-bold">
          PULSO CLASE • Detección temprana sin notas ni nombres
        </p>
      </footer>

    </div>
  );
}
