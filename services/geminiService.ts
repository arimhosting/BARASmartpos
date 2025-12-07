import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

// Helper to check if API key is present
const isApiKeyAvailable = (): boolean => {
  return !!process.env.API_KEY;
};

export const generateProductDescription = async (name: string, category: string): Promise<string> => {
  if (!isApiKeyAvailable()) {
    console.warn("API Key not available for Gemini.");
    return "Deskripsi AI tidak tersedia (API Key hilang).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Buatkan deskripsi produk yang menarik, menggugah selera, dan singkat (maksimal 20 kata) dalam Bahasa Indonesia untuk produk bernama "${name}" yang termasuk dalam kategori "${category}". Jangan gunakan tanda kutip.`,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Tidak dapat membuat deskripsi saat ini.";
  }
};

export const analyzeSalesData = async (transactions: Transaction[]): Promise<string> => {
  if (!isApiKeyAvailable()) {
    return "Analisis AI membutuhkan API Key.";
  }

  if (transactions.length === 0) {
    return "Belum ada data penjualan untuk dianalisis.";
  }

  try {
    // Simplify data for the prompt to save tokens
    const simpleData = transactions.map(t => ({
      date: t.date.split('T')[0],
      total: t.total,
      items: t.items.map(i => i.name).join(', ')
    })).slice(-20); // Last 20 transactions only

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Anda adalah analis bisnis profesional. Analisis data transaksi POS terbaru berikut ini: ${JSON.stringify(simpleData)}. 
      Berikan ringkasan wawasan singkat (3 kalimat) tentang performa penjualan dan tren produk terlaris dalam Bahasa Indonesia yang profesional dan menyemangati.`,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Tidak dapat menganalisis data saat ini.";
  }
};