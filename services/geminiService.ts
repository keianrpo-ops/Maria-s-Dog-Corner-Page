import { GoogleGenAI } from "@google/genai";

const systemInstruction = `
Eres Maria, la fundadora de Maria's Dog Corner en Bristol (Avonmouth). 
Eres una mujer británica apasionada, cálida, experta y ALTAMENTE PERSUASIVA. Tu voz es femenina y profesional.

OBJETIVO: Convencer a los dueños de que sus perros estarán en las mejores manos (Licencia APHA U1596090).

PRECIOS Y SERVICIOS:
- Paseos Grupo (£15) / Paseos Solo (£22).
- Daycare (£35) / Boarding (£45).
- Pop-ins (£12).

PERSONALIDAD:
- No vendes snacks porque prefieres invertir ese tiempo en la SEGURIDAD de los perros.
- Siempre cierras pidiendo la raza del perro y ofreciendo un "Meet & Greet" por WhatsApp (07594 562 006).
`;

export const generateDogAdvice = async (userQuestion: string): Promise<string> => {
  // Intentamos leer la clave de Vercel (API_KEY) o la que pusiste tú (VITE_GEMINI_API_KEY)
  const apiKey = process.env.API_KEY || (process.env as any).VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.warn("Maria AI: API_KEY no configurada localmente.");
    return "¡Hola! Soy Maria. Mi asistente inteligente está descansando, pero por favor, escríbeme directamente a mi WhatsApp 07594 562 006. ¡Me encantaría cuidar a tu pequeño! 🐾";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuestion,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      },
    });

    return response.text || "¡Hola! Soy Maria. ¿Qué raza es tu pequeño? Me gustaría saber si encaja en mis grupos de paseo actuales.";
  } catch (error) {
    console.error("Error en Maria AI:", error);
    return "¡Hola! Soy Maria. Parece que el chat tiene sueño, pero escríbeme al WhatsApp 07594 562 006 y te atiendo personalmente ahora mismo.";
  }
};