
import { GoogleGenAI } from "@google/genai";
import { Grid, TileValue } from "../types";

export const getAIHint = async (grid: Grid): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const gridString = grid.map(row => 
    row.map(cell => {
      if (cell.value === TileValue.WHITE) return 'W';
      if (cell.value === TileValue.BLACK) return 'B';
      return '.';
    }).join(' ')
  ).join('\n');

  const prompt = `
    Analyze this 6x6 Takuzu (Binairo) puzzle grid. 
    W = White, B = Black, . = Empty.
    Rules:
    1. Each row and column must have exactly 3 W and 3 B.
    2. No more than two consecutive cells can have the same color.
    3. Every row and column must be unique.

    Current Grid:
    ${gridString}

    Task: Find ONE logical next move. Explain the rule used (e.g., "In row 2, there are already two B together, so the next must be W"). 
    Keep the answer short, encouraging and helpful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a friendly Takuzu Master helping a player. Be concise.",
        temperature: 0.7,
      }
    });
    return response.text || "I'm not sure what the next move is, keep trying!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI Master is sleeping right now. Check the rules yourself!";
  }
};
