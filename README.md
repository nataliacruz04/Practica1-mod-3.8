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

5. **Persistencia y exportación:**
   - Almacenamiento local mediante `localStorage` para evitar pérdidas al cerrar el navegador.
   - Función para descargar los resultados en un archivo `.json` y reiniciar para una nueva clase.

6. **Recomendación pedagógica con Gemini API:**
   - Generación de tres puntos concretos de repaso estructurados en base a los votos y comentarios recibidos.
