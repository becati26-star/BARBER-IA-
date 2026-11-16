/**
 * Client-Side AI Service
 * Communicates with /api/gemini/analyze-face on the backend server.
 */

import { AIAnalysisResult } from '../types';

export class AIService {
  public static async analyzeFaceImage(imageBase64: string): Promise<{ data: AIAnalysisResult; engine: string }> {
    try {
      const response = await fetch('/api/gemini/analyze-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Error al conectar con el motor de IA`);
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'No se pudo generar el diagnóstico morfológico');
      }

      return {
        data: result.data,
        engine: result.engine || 'Gemini 4 Hydrogen Vision',
      };
    } catch (error) {
      console.error('Error invoking AI facial analysis service:', error);
      throw error;
    }
  }
}
