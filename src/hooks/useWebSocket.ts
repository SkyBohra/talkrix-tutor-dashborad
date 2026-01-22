'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { StreamEvent } from '@/lib/ai-teacher-api';
import { API_CONFIG, WS_ENDPOINTS } from '@/lib/api-config';

interface UseWebSocketOptions {
    sessionId?: string;
    userId?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onMessage?: (data: StreamEvent) => void;
    onError?: (error: Event) => void;
    autoReconnect?: boolean;
    reconnectInterval?: number;
}

interface UseWebSocketReturn {
    isConnected: boolean;
    isLoading: boolean;
    isTeaching: boolean;
    lastEvent: StreamEvent | null;
    participants: number;
    sendMessage: (message: Record<string, unknown>) => void;
    askQuestion: (question: string, subject?: string) => void;
    sendFeedback: (helpful: boolean) => void;
    disconnect: () => void;
    reconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
    const {
        sessionId = 'default',
        userId,
        onConnect,
        onDisconnect,
        onMessage,
        onError,
        autoReconnect = true,
        reconnectInterval = 3000,
    } = options;

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isTeaching, setIsTeaching] = useState(false);
    const [lastEvent, setLastEvent] = useState<StreamEvent | null>(null);
    const [participants, setParticipants] = useState(0);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        let url = `${API_CONFIG.wsUrl}${WS_ENDPOINTS.classroom(sessionId)}`;
        if (userId) {
            url += `?user_id=${userId}`;
        }

        const ws = new WebSocket(url);

        ws.onopen = () => {
            setIsConnected(true);
            onConnect?.();
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as StreamEvent;
                setLastEvent(data);
                onMessage?.(data);

                // Handle specific events
                switch (data.type) {
                    case 'connected':
                    case 'user_joined':
                    case 'user_left':
                        if (data.participants !== undefined) {
                            setParticipants(data.participants);
                        }
                        break;
                    case 'start':
                    case 'teaching_start':
                        setIsTeaching(true);
                        setIsLoading(false);
                        break;
                    case 'teaching_end':
                    case 'complete':
                    case 'error':
                        setIsTeaching(false);
                        setIsLoading(false);
                        break;
                }
            } catch {
                console.error('Failed to parse WebSocket message');
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            setIsTeaching(false);
            setIsLoading(false);
            onDisconnect?.();

            // Auto reconnect
            if (autoReconnect) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, reconnectInterval);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            onError?.(error);
        };

        wsRef.current = ws;
    }, [sessionId, userId, onConnect, onDisconnect, onMessage, onError, autoReconnect, reconnectInterval]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        wsRef.current?.close();
        wsRef.current = null;
    }, []);

    const reconnect = useCallback(() => {
        disconnect();
        connect();
    }, [disconnect, connect]);

    const sendMessage = useCallback((message: Record<string, unknown>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    const askQuestion = useCallback((question: string, subject?: string) => {
        setIsLoading(true);
        sendMessage({
            type: 'ask_question',
            question,
            subject,
        });
    }, [sendMessage]);

    const sendFeedback = useCallback((helpful: boolean) => {
        sendMessage({
            type: 'feedback',
            helpful,
        });
    }, [sendMessage]);

    // Connect on mount
    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        isLoading,
        isTeaching,
        lastEvent,
        participants,
        sendMessage,
        askQuestion,
        sendFeedback,
        disconnect,
        reconnect,
    };
}
