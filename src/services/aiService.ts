import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getApiKey = () => {
  return (process.env as any).API_KEY || process.env.GEMINI_API_KEY;
};

export const generateAIContent = async (prompt: string, isJson: boolean = true): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.1-flash-preview",
    contents: prompt,
    config: isJson ? {
      responseMimeType: "application/json",
    } : undefined,
  });

  return response.text || "";
};

export const generateAIImage = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K",
      },
    },
  });

  let imageUrl = "";
  if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
        break;
      }
    }
  }

  if (!imageUrl) {
    throw new Error("Failed to generate image from AI response");
  }

  return imageUrl;
};

export const ensureApiKey = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !(window as any).aistudio) {
    return true; // Not in AI Studio environment or not accessible
  }

  const hasKey = await (window as any).aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await (window as any).aistudio.openSelectKey();
    return true; // Assume success after opening dialog as per guidelines
  }
  return true;
};
