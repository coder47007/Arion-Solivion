import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let chatSession: Chat | null = null;

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not set in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const initChat = (): Chat | null => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return chatSession;
  } catch (error) {
    console.error("Failed to initialize chat:", error);
    return null;
  }
};

export const sendMessageToArion = async (message: string): Promise<string> => {
  if (!chatSession) {
    initChat();
  }

  if (!chatSession) {
    return "I am currently offline (API Config Error). Please check your connection.";
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "...";
  } catch (error) {
    console.error("Error sending message:", error);
    return "I'm having trouble connecting to the network right now. The stars are a bit misaligned.";
  }
};