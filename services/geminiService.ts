
import { GoogleGenAI, Type } from "@google/genai";

// Safely access process.env to prevent crashes in environments where process is undefined
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';

// Only initialize if we have a key (or handle it gracefully in calls)
// Note: The SDK requires an API key in the constructor if you plan to use it.
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });

// Helper to check if key is present
export const isAiAvailable = () => !!apiKey;

export const enhancePrompt = async (rawPrompt: string): Promise<{ optimized: string; tags: string[]; summary: string }> => {
  if (!apiKey) {
    // Fallback if no API key
    return {
      optimized: rawPrompt,
      tags: ['manual', 'draft'],
      summary: rawPrompt.slice(0, 50) + '...'
    };
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an expert prompt engineer. Analyze the following raw prompt.
      1. Create an optimized version of it (better clarity, structure, role definition).
      2. Generate 3-5 relevant short tags.
      3. Create a one-sentence summary.
      
      Raw Prompt: "${rawPrompt}"
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimized: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["optimized", "tags", "summary"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("No response text");

  } catch (error) {
    console.error("AI Enhance failed:", error);
    return {
      optimized: rawPrompt,
      tags: ['ai-failed'],
      summary: rawPrompt.slice(0, 50) + '...'
    };
  }
};

export const generateVariations = async (promptContent: string): Promise<string[]> => {
    if (!apiKey) return [];
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 3 distinct variations of this prompt for different tones (Professional, Creative, Concise). Return ONLY a JSON array of strings. Prompt: ${promptContent}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error(e);
        return [];
    }
}

export const runPrompt = async (promptContent: string): Promise<string> => {
    if (!apiKey) return "System Error: API Key is missing. Please check your configuration.";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptContent,
        });
        return response.text || "No output generated.";
    } catch (e: any) {
        console.error("Run Prompt Failed:", e);
        return `Execution Error: ${e.message || "Unknown error occurred."}`;
    }
}
