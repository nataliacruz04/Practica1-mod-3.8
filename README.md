# PULSO CLASE

**Pulso Clase** es una herramienta didáctica para docentes y estudiantes diseñada para detectar a tiempo quién comprendió el tema, quién tiene dudas y quién se quedó perdido antes de llegar al examen.

## M1: Función de registro de votos por tema y comentarios

Esta versión implementa las funciones centrales de diagnóstico pedagógico en tiempo real:

1. **Definición del Tema de la Clase:**
   - Permite al docente o estudiante ingresar y ajustar el tema activo (ej. *"Ecuaciones Cuadráticas"*, *"Cinemática"*) antes de registrar los votos.

2. **Pregunta de salida con tres opciones táctiles:**
   - 🟢 **Entendí:** Comprensión sólida del contenido central.
   - 🟡 **Tengo dudas:** Entendió la idea general pero presenta trabas en pasos específicos.
   - 🔴 **Me perdí:** Desorientación que requiere repaso guiado.

3. **Resumen en vivo con gráfico de barras:**
   - Gráfico comparativo de alto contraste para proyección en aula o celulares.
   - Cálculo seguro de porcentajes (evita división por cero).
   - Diagnóstico pedagógico automático según la distribución de votos.

4. **Comentarios anónimos vinculados:**
   - Campo opcional confidencial sin registro de nombres ni correos.
   - Cada comentario queda asociado al tema activo de la sesión.

5. **Exportación e Importación:**
   - Función para descargar los resultados en un archivo `.json` y reiniciar para una nueva clase.

6. **Recomendación pedagógica con Gemini API:**
   - Generación de tres puntos concretos de repaso estructurados en base a los votos y comentarios recibidos.

---

## M2: Persistencia de datos en localStorage

Esta versión garantiza que los datos de la sesión docente y estudiantil no se pierdan al cerrar o recargar el navegador:

1. **Almacenamiento Local Aislado:**
   - Clave única de almacenamiento: `'pulso_clase_v1_data'`.
   - Persistencia de los temas de clase, conteo de votos (entendí, dudas, me perdí) y comentarios anónimos con hora de envío.

2. **Lectura y Escritura Defensiva:**
   - Validación estructural de esquema al parsear JSON desde el almacenamiento para evitar bloqueos por datos incompletos.
   - Sincronización automática de estado ante cada voto recibido.

3. **Gestión de Sesión y Nueva Clase:**
   - Limpieza segura de contadores para iniciar un nuevo tema o grupo manteniendo la integridad del almacenamiento.
   - Respaldo de seguridad mediante exportación directa a archivos `.json` descargables.

---

## M3: Experiencia de uso en celular y estado vacío

Esta versión optimiza la usabilidad y accesibilidad para estudiantes y docentes en entornos móviles reales:

1. **Operable desde 320 px de ancho:**
   - Disposición en columna única vertical adaptable a cualquier tamaño de pantalla de celular.
   - Eliminación de desbordes y scroll horizontal.
   - Interacción fluida con una sola mano y botones táctiles dentro del alcance natural del pulgar (`min-h-[64px]`).

2. **Legibilidad al sol y contraste reforzado:**
   - Tamaño de fuente base de al menos 16 px en todas las etiquetas, avisos y botones (evita el zoom automático indeseado en navegadores móviles como Safari).
   - Fondos y textos en contraste extremo (`#000000` / `#0f172a` sobre fondos claros) para visibilidad en aulas iluminadas o al aire libre.

3. **Un solo botón principal por pantalla:**
   - Jerarquía visual estricta: en la vista de votación, el único botón con énfasis primario sólido es *"Enviar Voto"*.
   - Los botones auxiliares utilizan estilo secundario (*outline* y neutros) para evitar confusiones al presionar.

4. **Estado vacío amigable y motivador:**
   - Pantalla inicial guiada cuando no existen votos ni clases previas (`totalVotos === 0`).
   - Mensaje claro con invitación a iniciar la clase y opción de cargar un ejemplo demostrativo sin conexión.

5. **Mensajes claros y sin tecnicismos:**
   - Avisos en español pedagógico natural tanto para confirmación de respuestas enviadas como para recordatorios de selección.

---

## M4: Validaciones y manejo de errores

Esta versión robustece la estabilidad de la aplicación evitando fallos inesperados y guiando al usuario con claridad:

1. **Validación de selección antes del envío:**
   - Verificación estricta de que el estudiante haya pulsado una de las tres opciones (*Entendí*, *Dudas*, *Me perdí*) antes de procesar el voto.
   - Si no se ha marcado ninguna opción, se muestra un mensaje de advertencia visible y accesible en lugar de una alerta invasiva (`window.alert`).

2. **Sanitización y control de caracteres:**
   - Límite controlado para los comentarios anónimos (máximo 500 caracteres) y para el tema de la clase.
   - Eliminación de espacios en blanco redundantes y prevención de inyecciones de código.

3. **Cálculo de métricas con protección contra división por cero:**
   - La función `calcularPorcentajeSeguro` previene errores matemáticos o resultados `NaN` / `Infinity` cuando el total de votos es igual a 0.

4. **Resiliencia ante fallos de conexión e Inteligencia Artificial:**
   - Manejo de excepciones en la llamada a la API de Gemini mediante bloques `try/catch`.
   - Si la API externa no está disponible o la clave no está configurada, la interfaz muestra una advertencia en español con botón de reintento y carga alternativa de ejemplos fuera de línea, sin congelar la aplicación ni interrumpir las votaciones.

---

## M5: Inteligencia con salida estructurada JSON

Esta versión incorpora el análisis pedagógico automatizado garantizando salidas estructuradas mediante el SDK oficial `@google/genai`:

1. **Modelo de Última Generación:**
   - Uso de `gemini-3.8-flash` configurado del lado del servidor Express (`/api/generar-repaso`).
   - La API Key permanece protegida en variables de entorno del servidor sin exponerse al cliente web.

2. **Esquema Estricto con `responseSchema`:**
   - Se fuerza `responseMimeType: 'application/json'` con un esquema fuertemente tipado:
     - `puntos_repaso`: Arreglo de cadenas de texto con exactamente tres recomendaciones docentes accionables.
     - `resumen_diagnostico`: Cadena con la síntesis pedagógica del nivel de comprensión general.
   - Elimina la necesidad de expresiones regulares frágiles o parseos propensos a error.

3. **Módulo Cliente Tipado:**
   - Módulo `src/services/geminiRepaso.ts` que valida el payload de entrada y comprueba la estructura de salida.
   - Indicador de carga interactivo (*loading spinner*) y renderizado en tarjetas didácticas para el docente.




