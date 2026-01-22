import { API_CONFIG, API_ENDPOINTS, WS_ENDPOINTS } from './api-config';

// Types
export interface StreamEvent {
    type: 'start' | 'text' | 'emphasis' | 'visual' | 'visual_cue' | 'visual_update' | 'pause' | 'complete' | 'teaching_start' | 'teaching_end' | 'error' | 'connected' | 'user_joined' | 'user_left';
    content?: string;
    word?: string;
    concept?: string;
    importance?: 'high' | 'medium';
    action?: string;
    visual?: Record<string, unknown>;
    data?: Record<string, unknown>;
    full_text?: string;
    message?: string;
    question?: string;
    participants?: number;
    session_id?: string;
    timestamp?: number;
}

export interface QuestionRequest {
    question: string;
    subject?: string;
    include_visual?: boolean;
    include_avatar?: boolean;
    language?: string;
}

export interface QuestionResponse {
    question_id: string;
    question: string;
    explanation: string;
    visual_type?: string;
    visual_url?: string;
    visual_description?: string;
    avatar_video_url?: string;
    audio_url?: string;
    keywords: string[];
    related_concepts: string[];
    follow_up_questions: string[];
    status: string;
}

// API Helper class
class AITeacherAPI {
    private baseUrl: string;
    private wsUrl: string;

    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.wsUrl = API_CONFIG.wsUrl;
    }

    // HTTP request helper
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || 'Request failed');
        }

        return response.json();
    }

    // Ask question (batch)
    async askQuestion(request: QuestionRequest): Promise<QuestionResponse> {
        return this.request<QuestionResponse>(API_ENDPOINTS.askQuestion, {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // Get question response
    async getQuestion(id: string): Promise<QuestionResponse> {
        return this.request<QuestionResponse>(API_ENDPOINTS.getQuestion(id));
    }

    // Stream question (SSE)
    async streamQuestion(
        request: QuestionRequest,
        onEvent: (event: StreamEvent) => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        const url = `${this.baseUrl}${API_ENDPOINTS.streamAsk}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error('Stream request failed');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No reader available');
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event = JSON.parse(line.slice(6)) as StreamEvent;
                            onEvent(event);
                        } catch {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (error) {
            if (onError) {
                onError(error as Error);
            }
        }
    }

    // Create classroom session
    async createSession(): Promise<{ session_id: string; websocket_url: string }> {
        return this.request(API_ENDPOINTS.createSession, {
            method: 'POST',
        });
    }

    // Connect to live classroom
    connectToClassroom(
        sessionId: string,
        userId?: string,
        onEvent: (event: StreamEvent) => void = () => {},
        onOpen?: () => void,
        onClose?: () => void,
        onError?: (error: Event) => void
    ): WebSocket {
        let url = `${this.wsUrl}${WS_ENDPOINTS.classroom(sessionId)}`;
        if (userId) {
            url += `?user_id=${userId}`;
        }

        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('Connected to classroom:', sessionId);
            onOpen?.();
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as StreamEvent;
                onEvent(data);
            } catch {
                console.error('Failed to parse message');
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from classroom');
            onClose?.();
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            onError?.(error);
        };

        return ws;
    }

    // Connect to quick teach
    connectToQuickTeach(
        onEvent: (event: StreamEvent) => void,
        onOpen?: () => void,
        onClose?: () => void
    ): WebSocket {
        const url = `${this.wsUrl}${WS_ENDPOINTS.quickTeach}`;
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('Connected to quick teach');
            onOpen?.();
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as StreamEvent;
                onEvent(data);
            } catch {
                console.error('Failed to parse message');
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from quick teach');
            onClose?.();
        };

        return ws;
    }

    // Get avatar options
    async getAvatarOptions() {
        return this.request(API_ENDPOINTS.avatarOptions);
    }

    // Mock streaming for development/testing
    async mockStreamQuestion(
        request: QuestionRequest,
        onEvent: (event: StreamEvent) => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        const mockResponses: Record<string, string[]> = {
            gravity: [
                'Gravity ', 'is ', 'one ', 'of ', 'the ', 'fundamental ', 'forces ', 'of ', 'nature. ',
                'It ', 'is ', 'the ', 'force ', 'that ', 'attracts ', 'objects ', 'toward ', 'each ', 'other. ',
                'When ', 'you ', 'drop ', 'an ', 'apple, ', 'it ', 'falls ', 'to ', 'the ', 'ground ', 
                'because ', 'Earth\'s ', 'gravity ', 'pulls ', 'it ', 'downward. ',
                'The ', 'apple ', 'accelerates ', 'at ', '9.8 ', 'm/s² ', 'near ', 'Earth\'s ', 'surface. ',
                'This ', 'was ', 'famously ', 'observed ', 'by ', 'Isaac ', 'Newton! '
            ],
            pendulum: [
                'A ', 'pendulum ', 'is ', 'a ', 'weight ', 'suspended ', 'from ', 'a ', 'pivot ', 'point. ',
                'When ', 'displaced ', 'from ', 'its ', 'resting ', 'position, ', 'it ', 'swings ', 'back ', 'and ', 'forth. ',
                'The ', 'time ', 'it ', 'takes ', 'for ', 'one ', 'complete ', 'swing ', 'is ', 'called ', 'the ', 'period. ',
                'Interestingly, ', 'the ', 'period ', 'only ', 'depends ', 'on ', 'the ', 'length ', 'of ', 'the ', 'pendulum, ',
                'not ', 'on ', 'the ', 'mass ', 'of ', 'the ', 'weight! '
            ],
            wave: [
                'Waves ', 'are ', 'disturbances ', 'that ', 'transfer ', 'energy ', 'through ', 'space ', 'or ', 'matter. ',
                'Sound ', 'waves ', 'travel ', 'through ', 'air ', 'by ', 'compressing ', 'and ', 'expanding ', 'air ', 'molecules. ',
                'The ', 'distance ', 'between ', 'wave ', 'peaks ', 'is ', 'called ', 'the ', 'wavelength. ',
                'The ', 'number ', 'of ', 'waves ', 'passing ', 'a ', 'point ', 'per ', 'second ', 'is ', 'the ', 'frequency! '
            ],
            spring: [
                'Springs ', 'store ', 'and ', 'release ', 'energy ', 'when ', 'stretched ', 'or ', 'compressed. ',
                'This ', 'is ', 'described ', 'by ', 'Hooke\'s ', 'Law: ', 'F = -kx. ',
                'The ', 'force ', 'is ', 'proportional ', 'to ', 'the ', 'displacement. ',
                'Springs ', 'oscillate ', 'back ', 'and ', 'forth ', 'in ', 'simple ', 'harmonic ', 'motion! '
            ],
            default: [
                'That\'s ', 'a ', 'great ', 'question! ',
                'Let ', 'me ', 'explain ', 'this ', 'concept ', 'to ', 'you. ',
                'This ', 'is ', 'a ', 'fascinating ', 'topic ', 'in ', 'science. ',
                'Would ', 'you ', 'like ', 'to ', 'explore ', 'more? '
            ]
        };

        // Determine which response to use
        const questionLower = request.question.toLowerCase();
        let words = mockResponses.default;
        
        if (questionLower.includes('gravity') || questionLower.includes('apple') || questionLower.includes('fall')) {
            words = mockResponses.gravity;
        } else if (questionLower.includes('pendulum')) {
            words = mockResponses.pendulum;
        } else if (questionLower.includes('wave') || questionLower.includes('sound')) {
            words = mockResponses.wave;
        } else if (questionLower.includes('spring') || questionLower.includes('elastic')) {
            words = mockResponses.spring;
        }

        try {
            // Start event
            onEvent({ type: 'start', question: request.question });
            await this.delay(300);

            // Stream words with delays
            for (let i = 0; i < words.length; i++) {
                onEvent({ type: 'text', content: words[i] });
                
                // Add emphasis for key words
                if (words[i].toLowerCase().includes('gravity') || 
                    words[i].toLowerCase().includes('force') ||
                    words[i].toLowerCase().includes('energy') ||
                    words[i].toLowerCase().includes('newton')) {
                    await this.delay(100);
                    onEvent({ type: 'emphasis', importance: 'high' });
                }
                
                await this.delay(50 + Math.random() * 50);
            }

            // Visual cue
            onEvent({ type: 'visual_cue', content: request.question });
            await this.delay(200);

            // Complete
            onEvent({ type: 'complete', full_text: words.join('') });
        } catch (error) {
            onError?.(error as Error);
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const aiTeacherAPI = new AITeacherAPI();
