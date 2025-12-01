import { GoogleGenAI, Type } from "@google/genai";
import { Activity } from "../types";

// User provided API Key
const apiKey = 'AIzaSyAgYwgasR8K5t6YqgJ0UJVp34MEYJlr8f8';
const ai = new GoogleGenAI({ apiKey });

// Helper to check API Key availability
export const checkApiKey = (): boolean => {
  return !!apiKey;
};

/**
 * Generate Creative Activity (Changche) sentences for a whole class
 */
export const generateChangcheBulk = async (activity: Activity, count: number = 5): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    You are a Korean Middle School teacher (중학교 교사).
    Write ${count} unique, high-quality student record sentences (생기부 특기사항) for a "Creative Experiential Activity" (창의적 체험활동).
    
    Activity Info:
    - Name: ${activity.name}
    - Keyword: ${activity.keyword}

    Guidelines:
    - Target Audience: Middle School Students (중학생).
    - Context: Creating official school records (School Life Record Book).
    - The output will be appended to a prefix like "(${activity.date}) ${activity.name} ...".
    - Therefore, DO NOT start the sentence with the date or the activity name. Start directly with the action, feeling, or learning outcome.
    - Example flow: [Prefix provided by UI] -> "participated actively...", "showed great interest in..."
    - Use a professional, evaluative tone (ends in noun forms like ~함, ~보임, ~느낌).
    - Korean language only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Changche Error:", error);
    return Array(count).fill("AI 생성 중 오류가 발생했습니다.");
  }
};

/**
 * Extracts schedule data from an image
 */
export const extractScheduleFromImage = async (base64Image: string, mimeType: string): Promise<Activity[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    Analyze this image of a school schedule (likely Excel or PDF screenshot).
    Extract the dates and activity names.
    
    Target format:
    - Date: "YYYY.MM.DD." (Ensure dots are correct). If year is missing, assume 2025.
    - Name: The full name of the activity (e.g., "입학식 및 시업식").
    - Keyword: A short 2-3 word summary for AI context (e.g., "입학", "학폭예방").

    Return a JSON array of objects.
    Example: [{"date": "2025.03.04.", "name": "입학식 및 시업식", "keyword": "입학"}]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              name: { type: Type.STRING },
              keyword: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Image Parse Error:", error);
    throw new Error("이미지 분석에 실패했습니다.");
  }
};

/**
 * Generate Subject Specifics (Seteuk) for a single student
 */
export const generateSeteukSingle = async (
  topic: string,
  standard: string,
  competencies: string[],
  includeStandard: boolean
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    You are a Korean Middle School teacher (중학교 교사).
    Write a detailed "Subject Specific Activity" (과목별 세부능력 및 특기사항) for a student.
    
    Context:
    - Topic: ${topic}
    - Standard: ${standard || "N/A"}
    - Competencies: ${competencies.join(', ')}
    - Include Standard Text: ${includeStandard ? "YES" : "NO"}

    Guidelines:
    - Target: Middle School level.
    - Combine topic and competencies into a coherent narrative.
    - If "Include Standard Text" is YES, start with a phrase referencing the standard.
    - Ends in noun forms (e.g., ~함).
    - Length: 2-3 detailed sentences.
    - Korean language only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "생성 실패";
  } catch (error) {
    console.error("Gemini Seteuk Error:", error);
    return "AI 연결 오류";
  }
};

/**
 * Generate Behavioral Characteristics (Haengbal) for a single student
 */
export const generateHaengbalSingle = async (keywords: string[], customObservation: string = ""): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    You are a Korean Middle School teacher (중학교 교사).
    Write a "Behavioral Characteristics and Comprehensive Opinion" (행동특성 및 종합의견).
    
    Input:
    - Keywords: ${keywords.join(', ')}
    - Custom Observation: ${customObservation}

    Guidelines:
    - Middle School level.
    - Combine keywords and observation naturally.
    - Turn weaknesses into areas for growth.
    - Ends in noun forms (e.g., ~함).
    - Korean language only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "생성 실패";
  } catch (error) {
    console.error("Gemini Haengbal Error:", error);
    return "AI 연결 오류";
  }
};