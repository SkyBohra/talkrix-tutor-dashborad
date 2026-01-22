'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { VisualCanvas } from './VisualCanvas';
import { cn } from '@/lib/utils';
import { aiTeacherAPI } from '@/lib/ai-teacher-api';

type ConversationState = 'idle' | 'user_speaking' | 'processing' | 'agent_speaking';

interface Message {
    role: 'user' | 'agent';
    text: string;
    timestamp: Date;
}

export function LiveConversation({ className }: { className?: string }) {
    // Conversation state
    const [state, setState] = useState<ConversationState>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [agentResponse, setAgentResponse] = useState('');
    const [currentVisual, setCurrentVisual] = useState<string | null>(null);
    
    // Refs
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentTranscript, agentResponse]);

    // Initialize speech recognition
    const initRecognition = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in your browser. Please use Chrome.');
            return null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        return recognition;
    }, []);

    // Start listening
    const startListening = useCallback(() => {
        // Stop any ongoing speech
        window.speechSynthesis.cancel();
        
        const recognition = initRecognition();
        if (!recognition) return;

        let silenceTimer: NodeJS.Timeout;
        let finalText = '';

        recognition.onstart = () => {
            setState('user_speaking');
            setCurrentTranscript('');
            finalText = '';
        };

        recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript + ' ';
                } else {
                    interim += result[0].transcript;
                }
            }

            if (final) {
                finalText += final;
            }
            setCurrentTranscript(finalText + interim);

            // Reset silence timer
            clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                // User stopped speaking for 1.5 seconds
                if (finalText.trim()) {
                    recognition.stop();
                }
            }, 1500);
        };

        recognition.onend = () => {
            clearTimeout(silenceTimer);
            const userText = finalText.trim() || currentTranscript.trim();
            
            if (userText) {
                // Add user message
                setMessages(prev => [...prev, {
                    role: 'user',
                    text: userText,
                    timestamp: new Date()
                }]);
                setCurrentTranscript('');
                
                // Process the question
                processQuestion(userText);
            } else {
                setState('idle');
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'no-speech') {
                setState('idle');
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [initRecognition, currentTranscript]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    // Process question and get response
    const processQuestion = useCallback(async (question: string) => {
        setState('processing');
        setAgentResponse('');

        // Determine visual type
        const questionLower = question.toLowerCase();
        if (questionLower.includes('gravity') || questionLower.includes('apple') || questionLower.includes('fall')) {
            setCurrentVisual('falling_object');
        } else if (questionLower.includes('pendulum')) {
            setCurrentVisual('pendulum_swing');
        } else if (questionLower.includes('wave') || questionLower.includes('sound')) {
            setCurrentVisual('wave_motion');
        } else if (questionLower.includes('spring')) {
            setCurrentVisual('spring_oscillation');
        } else {
            setCurrentVisual('falling_object');
        }

        let fullResponse = '';

        try {
            await aiTeacherAPI.mockStreamQuestion(
                { question, include_visual: true },
                (event) => {
                    if (event.type === 'text' && event.content) {
                        fullResponse += event.content;
                        setAgentResponse(fullResponse);
                    }
                    if (event.type === 'complete') {
                        // Add agent message
                        setMessages(prev => [...prev, {
                            role: 'agent',
                            text: fullResponse,
                            timestamp: new Date()
                        }]);
                        
                        // Speak the response
                        speakResponse(fullResponse);
                    }
                },
                (error) => {
                    console.error('Error:', error);
                    setState('idle');
                }
            );
        } catch (error) {
            console.error('Error processing question:', error);
            setState('idle');
        }
    }, []);

    // Speak response using TTS
    const speakResponse = useCallback((text: string) => {
        setState('agent_speaking');
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Get a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.name.includes('Samantha') || 
            v.name.includes('Google') ||
            (v.lang.startsWith('en') && v.name.includes('Female'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
            setState('idle');
            setAgentResponse('');
            // Auto-start listening again after agent finishes
            setTimeout(() => {
                startListening();
            }, 500);
        };

        utterance.onerror = () => {
            setState('idle');
            setAgentResponse('');
        };

        synthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [startListening]);

    // Stop agent speaking
    const stopSpeaking = useCallback(() => {
        window.speechSynthesis.cancel();
        setState('idle');
        setAgentResponse('');
    }, []);

    // Toggle conversation
    const toggleConversation = useCallback(() => {
        if (state === 'idle') {
            startListening();
        } else if (state === 'user_speaking') {
            stopListening();
        } else if (state === 'agent_speaking') {
            stopSpeaking();
            startListening();
        }
    }, [state, startListening, stopListening, stopSpeaking]);

    // Get state display info
    const getStateInfo = () => {
        switch (state) {
            case 'user_speaking':
                return { text: 'Listening to you...', color: 'text-red-400', icon: '🎤' };
            case 'processing':
                return { text: 'Thinking...', color: 'text-yellow-400', icon: '🤔' };
            case 'agent_speaking':
                return { text: 'Teacher is speaking...', color: 'text-green-400', icon: '🔊' };
            default:
                return { text: 'Click mic to start talking', color: 'text-white/50', icon: '💬' };
        }
    };

    const stateInfo = getStateInfo();

    return (
        <div className={cn('min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex flex-col', className)}>
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xl">
                                🎓
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">AI Teacher - Live Conversation</h1>
                                <p className="text-sm text-white/50">Speak naturally, I'll listen and respond</p>
                            </div>
                        </div>
                        
                        {/* Status indicator */}
                        <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full bg-black/30', stateInfo.color)}>
                            <span className="text-lg">{stateInfo.icon}</span>
                            <span className="text-sm font-medium">{stateInfo.text}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 container mx-auto px-4 py-6 flex gap-6">
                {/* Left - Visual Demo */}
                <div className="w-1/3 space-y-4">
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 h-[400px]">
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            <span>🎬</span> Visual Example
                        </h3>
                        <VisualCanvas
                            animationType={currentVisual || undefined}
                            className="h-[320px]"
                        />
                    </div>

                    {/* Avatar */}
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center">
                        <div className={cn(
                            'w-32 h-32 rounded-full flex items-center justify-center text-6xl',
                            'bg-gradient-to-br from-violet-500 to-blue-500',
                            'shadow-lg transition-all duration-300',
                            state === 'agent_speaking' && 'shadow-green-500/50 animate-pulse scale-110',
                            state === 'user_speaking' && 'shadow-red-500/50',
                        )}>
                            {state === 'agent_speaking' ? '🗣️' : state === 'user_speaking' ? '👂' : '🧑‍🏫'}
                        </div>
                        <p className={cn('mt-4 text-sm font-medium', stateInfo.color)}>
                            {stateInfo.text}
                        </p>
                    </div>
                </div>

                {/* Right - Conversation */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-4 overflow-y-auto mb-4 max-h-[500px]">
                        {messages.length === 0 && !currentTranscript && !agentResponse && (
                            <div className="h-full flex flex-col items-center justify-center text-white/40">
                                <span className="text-6xl mb-4">🎤</span>
                                <p className="text-lg">Click the microphone to start a conversation</p>
                                <p className="text-sm mt-2">Try asking: "What is gravity?"</p>
                            </div>
                        )}

                        {/* Message history */}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'mb-4 p-4 rounded-xl max-w-[80%] animate-fadeIn',
                                    msg.role === 'user' 
                                        ? 'ml-auto bg-violet-500/30 text-white' 
                                        : 'bg-white/10 text-white/90'
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2 text-sm opacity-70">
                                    <span>{msg.role === 'user' ? '👤 You' : '🧑‍🏫 Teacher'}</span>
                                    <span>•</span>
                                    <span>{msg.timestamp.toLocaleTimeString()}</span>
                                </div>
                                <p className="leading-relaxed">{msg.text}</p>
                            </div>
                        ))}

                        {/* Current transcript (user speaking) */}
                        {currentTranscript && (
                            <div className="mb-4 p-4 rounded-xl max-w-[80%] ml-auto bg-violet-500/30 border-2 border-violet-400/50 animate-pulse">
                                <div className="flex items-center gap-2 mb-2 text-sm text-violet-300">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    <span>Listening...</span>
                                </div>
                                <p className="text-white italic">{currentTranscript}</p>
                            </div>
                        )}

                        {/* Agent response (streaming) */}
                        {agentResponse && state !== 'idle' && (
                            <div className="mb-4 p-4 rounded-xl max-w-[80%] bg-white/10 border-2 border-green-400/50">
                                <div className="flex items-center gap-2 mb-2 text-sm text-green-300">
                                    {state === 'processing' ? (
                                        <>
                                            <span className="animate-spin">⚙️</span>
                                            <span>Thinking...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="animate-pulse">🔊</span>
                                            <span>Speaking...</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-white/90 leading-relaxed">{agentResponse}</p>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Mic Button */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={toggleConversation}
                            disabled={state === 'processing'}
                            className={cn(
                                'w-20 h-20 rounded-full flex items-center justify-center text-3xl',
                                'transition-all duration-300 transform hover:scale-105',
                                'shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
                                state === 'user_speaking' 
                                    ? 'bg-red-500 shadow-red-500/50 animate-pulse' 
                                    : state === 'agent_speaking'
                                    ? 'bg-green-500 shadow-green-500/50'
                                    : 'bg-gradient-to-br from-violet-500 to-blue-500 shadow-violet-500/50 hover:shadow-violet-500/70'
                            )}
                        >
                            {state === 'user_speaking' ? '🎤' : state === 'agent_speaking' ? '⏹️' : '🎙️'}
                        </button>
                        
                        <p className="text-white/50 text-sm text-center">
                            {state === 'idle' && 'Click to start talking'}
                            {state === 'user_speaking' && 'Speak your question... (pause to send)'}
                            {state === 'processing' && 'Processing your question...'}
                            {state === 'agent_speaking' && 'Click to interrupt and ask another question'}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
