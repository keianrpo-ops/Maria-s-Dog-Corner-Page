import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini Client safely
// This handles environments where process might be undefined (browsers)
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    // Fallback if process is not defined, just return empty to prevent crash
    return '';
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generateDogAdvice = async (userQuestion: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    // Graceful fallback if no API key is present for demo purposes
    return "I'm currently offline (API Key missing), but I'd love to help! Please check back later or contact Maria directly.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuestion,
      config: {
        systemInstruction: `You are Maria, a friendly, professional, and positive-reinforcement based dog walker and trainer. 
        Answer questions about dog care, walking etiquette, and basic training tips concisely (under 100 words). 
        Always be encouraging and prioritize the safety and well-being of the dog. 
        If the question is medical, advise them to see a vet immediately.`,
      },
    });

    return response.text || "I couldn't think of an answer right now, please try asking again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a little trouble connecting to my knowledge base. Please try again in a moment.";
  }
};