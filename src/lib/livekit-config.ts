/**
 * LiveKit Configuration
 * Configuration and utilities for LiveKit integration
 */

export const LIVEKIT_CONFIG = {
  // Server URL - will be replaced with your LiveKit Cloud URL
  serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://your-project.livekit.cloud',
  
  // Token endpoint for generating room tokens
  tokenEndpoint: process.env.NEXT_PUBLIC_LIVEKIT_TOKEN_ENDPOINT || '/api/livekit/token',
};

/**
 * Get a LiveKit room token for a student
 */
export async function getLiveKitToken(
  roomName: string,
  participantName: string,
  metadata?: {
    subject?: string;
    grade_level?: string;
    topic?: string;
    learning_goal?: string;
    student_name?: string;
  }
): Promise<string> {
  const response = await fetch(LIVEKIT_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      roomName,
      participantName,
      metadata,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get LiveKit token');
  }

  const data = await response.json();
  return data.token;
}

/**
 * Create a unique room name for a teaching session
 */
export function createRoomName(subject?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const subjectPart = subject ? `-${subject.toLowerCase().replace(/\s+/g, '-')}` : '';
  return `classroom${subjectPart}-${timestamp}-${random}`;
}

/**
 * Parse visual data from agent messages
 * The agent sends visual commands embedded in responses like:
 * "Let me show you... [VISUAL_DATA:{...}]"
 */
export function parseVisualData(text: string): {
  cleanText: string;
  visuals: VisualData[];
} {
  const visuals: VisualData[] = [];
  
  // Extract all visual data markers
  const patterns = [
    /\[VISUAL_DATA:(\{[^}]+\})\]/g,
    /\[ANIMATION_DATA:(\{[^}]+\})\]/g,
    /\[DIAGRAM_DATA:(\{[^}]+\})\]/g,
    /\[EQUATION_DATA:(\{[^}]+\})\]/g,
    /\[QUIZ_DATA:(\{[^}]+\})\]/g,
    /\[SUMMARY_DATA:(\{[^}]+\})\]/g,
    /\[UNDERSTANDING_DATA:(\{[^}]+\})\]/g,
    /\[PACE_DATA:(\{[^}]+\})\]/g,
  ];

  let cleanText = text;

  for (const pattern of patterns) {
    cleanText = cleanText.replace(pattern, (match, jsonStr) => {
      try {
        const data = JSON.parse(jsonStr);
        visuals.push(data);
      } catch (e) {
        console.error('Failed to parse visual data:', e);
      }
      return '';
    });
  }

  return {
    cleanText: cleanText.trim(),
    visuals,
  };
}

// Types
export interface VisualData {
  type: 'visual' | 'animation' | 'diagram' | 'equation' | 'quiz' | 'summary' | 'understanding_check' | 'pace_change';
  [key: string]: unknown;
}

export interface AnimationData extends VisualData {
  type: 'animation';
  name: string;
  description: string;
  frames: number;
  duration: number;
  speed?: number;
  data: Record<string, unknown>;
}

export interface DiagramData extends VisualData {
  type: 'diagram';
  name: string;
  description: string;
  labels?: string[];
}

export interface EquationData extends VisualData {
  type: 'equation';
  equation: string;
  name: string;
  explanation?: string;
}

export interface QuizData extends VisualData {
  type: 'quiz';
  question: string;
  options: string[];
  correct_answer: string;
  hint?: string;
}

export interface AvatarState {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  timestamp: number;
}
