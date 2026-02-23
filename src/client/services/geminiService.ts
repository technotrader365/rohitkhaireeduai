
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIConsultation = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], contextData: string) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the SnapX Academy AI Mentor. 
      
      **Persona:** 
      You are sophisticated, encouraging, academic, and tech-savvy. You are not just a bot, but a proactive success coach. You care about the student's long-term career goals and immediate academic performance.

      **Context:**
      You have access to the student's entire academic profile, including enrolled courses, progress, upcoming deadlines, and the full course catalog.
      ${contextData}

      **Formatting Rules:**
      - Use **bold** for key concepts, course titles, or important dates.
      - Use lists (starting with -) for steps, recommendations, or summary points.
      - Keep paragraphs short and readable.

      **Guidelines:**
      - If the student asks about a specific topic, check if there is a relevant course in the catalog and recommend it.
      - If the student is behind on a course, offer encouraging strategies to catch up.
      - Always be polite and professional, but warm.`,
    }
  });
  
  const lastMessage = history[history.length - 1]?.parts[0].text;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text;
};

export const suggestStudentGoals = async (performanceSummary: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this performance data and suggest 3 SMART goals: ${performanceSummary}. Return JSON array of objects with title, targetDate (YYYY-MM-DD), and category.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            targetDate: { type: Type.STRING },
            category: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateStudySchedule = async (eventsContext: string, startDate: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Given these deadlines and exams: ${eventsContext}. Current date is ${startDate}. Generate 3 strategic study sessions to prepare. Return JSON array: [{title, date (YYYY-MM-DD), duration (e.g. "2h"), type: "study", description}]. Do not conflict with existing dates if possible.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            duration: { type: Type.STRING },
            type: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const analyzeCompliance = async (imageBase64: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: 'Analyze this student home-study setup. Assess ergonomics, lighting, clutter, and safety. Return JSON: isCompliant (boolean), score (integer 0-100), observations (array of strings), recommendations (string).' }
      ]
    },
    config: { responseMimeType: 'application/json' }
  });
  return JSON.parse(response.text || '{}');
};

export const reviewHandwrittenWork = async (imageBase64: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: 'Review this handwritten exam. Transcribe, identify subject, estimate grade (0-100), and give feedback. Return JSON.' }
      ]
    },
    config: { responseMimeType: 'application/json' }
  });
  return JSON.parse(response.text || '{}');
};

export const getCareerIntelligence = async (studentProfile: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Based on this student profile: "${studentProfile}", suggest 3 distinct career paths.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            matchScore: { type: Type.INTEGER },
            requiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            timeline: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateStudentIntervention = async (studentData: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this student data for an educator: "${studentData}". Provide specific teaching strategies. Return JSON: { summary, interventionLevel (Low/Medium/High), strategies (array of objects with title and description), emailDraft (string) }`,
    config: {
      responseMimeType: 'application/json'
    }
  });
  return JSON.parse(response.text || '{}');
};
