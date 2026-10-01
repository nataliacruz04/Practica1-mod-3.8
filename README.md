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

