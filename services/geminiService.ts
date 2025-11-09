
import { GoogleGenAI, Modality, Part } from '@google/genai';
import { GEMINI_MODEL_IMAGE } from '../constants';

interface GenerateThumbnailParams {
  prompt: string;
  imageParts: Part[];
}

export const generateThumbnail = async ({
  prompt,
  imageParts,
}: GenerateThumbnailParams): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not set. Please ensure it is configured.');
  }

  // Create a new GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const combinedParts: Part[] = [{ text: prompt }];
  if (imageParts && imageParts.length > 0) {
    combinedParts.push(...imageParts);
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_IMAGE,
      contents: {
        parts: combinedParts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const base64ImageBytes =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64ImageBytes) {
      throw new Error('No image data received from the API.');
    }

    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error: any) {
    console.error('Error generating thumbnail:', error);
    if (error.message.includes("Requested entity was not found.")) {
      // Assuming window.aistudio exists in the environment for API key selection
      if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
        console.warn("API Key might be invalid or not selected. Prompting user to select key.");
        await (window as any).aistudio.openSelectKey();
        throw new Error("API Key selection initiated. Please try again after selecting a key.");
      } else {
        throw new Error("API Key might be invalid or not found. Please ensure a valid API key is available.");
      }
    }
    throw new Error(`Failed to generate thumbnail: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Encodes a Uint8Array to a base64 string.
 * This is a utility function for the Live API but useful for general base64 encoding.
 */
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
