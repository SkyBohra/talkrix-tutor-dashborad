// API configuration for AI Teacher backend
export const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
};

// API endpoints
export const API_ENDPOINTS = {
    // Auth
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    me: '/api/v1/auth/me',
    
    // Questions
    askQuestion: '/api/v1/questions/ask',
    getQuestion: (id: string) => `/api/v1/questions/${id}`,
    questionStatus: (id: string) => `/api/v1/questions/${id}/status`,
    
    // Streaming
    streamAsk: '/api/v1/stream/ask',
    streamAskWithAudio: '/api/v1/stream/ask-with-audio',
    
    // Teaching Pipeline (LLM + ElevenLabs + Visual + Lip Sync)
    teachingAsk: '/api/v1/teaching/ask',
    teachingStream: '/api/v1/teaching/stream',
    
    // Live Classroom
    createSession: '/api/v1/sessions/create',
    sessionStatus: (id: string) => `/api/v1/sessions/${id}/status`,
    
    // Avatars
    avatarOptions: '/api/v1/avatars/options',
    avatarPreview: '/api/v1/avatars/preview',
    
    // Visuals
    generateVisual: '/api/v1/visuals/generate',
    getVisual: (id: string) => `/api/v1/visuals/${id}`,
};

// WebSocket endpoints
export const WS_ENDPOINTS = {
    classroom: (sessionId: string) => `/api/v1/ws/classroom/${sessionId}`,
    quickTeach: '/api/v1/ws/teach',
};
