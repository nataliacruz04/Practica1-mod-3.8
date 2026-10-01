import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint para generar los tres puntos de repaso pedagógico usando Gemini
app.post('/api/generar-repaso', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(400).json({
        error: 'Falta configurar la variable de entorno GEMINI_API_KEY en el servidor.',
      });
    }

    const { tema, votos, comentarios } = req.body;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const listaComentarios = comentarios && comentarios.length > 0
      ? comentarios.map((c: { opcion: string; texto: string }) => `- [${c.opcion}]: "${c.texto}"`).join('\n')
      : 'Sin comentarios adicionales de texto.';

    const prompt = `Actúa como un asesor pedagógico experto para docentes de aula.
Analiza la siguiente información de salida de la clase:
- Tema: "${tema || 'Tema de la clase'}"
- Respuestas del grupo: ${votos?.entendi || 0} entendieron, ${votos?.dudas || 0} tienen dudas, ${votos?.perdi || 0} se perdieron.
- Comentarios anónimos enviados por los alumnos:
${listaComentarios}

Genera exactamente tres puntos concretos de repaso estructurados para la próxima sesión del docente, enfocados en subsanar las dudas y confusiones expresadas por los alumnos, más un resumen diagnóstico general.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            puntos_repaso: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Exactamente tres recomendaciones concretas de repaso para la próxima sesión.',
            },
            resumen_diagnostico: {
              type: Type.STRING,
              description: 'Breve síntesis de la situación del grupo para el docente.',
            },
          },
          required: ['puntos_repaso', 'resumen_diagnostico'],
        },
      },
    });

    const texto = response.text;
    if (!texto) {
      throw new Error('La respuesta del modelo de inteligencia artificial fue vacía.');
    }

    const data = JSON.parse(texto);
    return res.json(data);
  } catch (error: any) {
    console.error('Error generando repaso con Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'No fue posible conectar con el servicio de análisis de clase.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Pulso Clase activo en http://localhost:${PORT}`);
  });
}

startServer();
