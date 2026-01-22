'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { VisualCanvas } from './VisualCanvas';
import { SpeakingAvatar } from './SpeakingAvatar';
import { ExplanationDisplay } from './ExplanationDisplay';
import { VoiceQuestionInput } from './VoiceQuestionInput';
import { cn } from '@/lib/utils';
import { StreamEvent, aiTeacherAPI } from '@/lib/ai-teacher-api';

interface InteractiveClassroomProps {
    className?: string;
    useMockData?: boolean;
}

/**
 * Interactive Classroom with Audio Input and Speaking Avatar
 * - Voice input for questions
 * - Text-to-speech avatar responses  
 * - Visual demonstrations
 */
export function InteractiveClassroom({ className, useMockData = true }: InteractiveClassroomProps) {
    const [events, setEvents] = useState<StreamEvent[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentVisual, setCurrentVisual] = useState<{
        type: string;
        data?: Record<string, unknown>;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fullText, setFullText] = useState<string>('');
    const [currentQuestion, setCurrentQuestion] = useState<string>('');

    // Map concepts to animation types
    const mapConceptToAnimation = (concept: string): string => {
        const conceptMap: Record<string, string> = {
            gravity: 'falling_object',
            fall: 'falling_object',
            apple: 'falling_object',
            pendulum: 'pendulum_swing',
            oscillation: 'pendulum_swing',
            wave: 'wave_motion',
            sound: 'wave_motion',
            light: 'wave_motion',
            spring: 'spring_oscillation',
            elastic: 'spring_oscillation',
        };

        const lowerConcept = concept.toLowerCase();
        for (const [key, animation] of Object.entries(conceptMap)) {
            if (lowerConcept.includes(key)) {
                return animation;
            }
        }

        return 'falling_object'; // Default
    };

    // Handle question submission
    const handleSubmit = useCallback(async (question: string) => {
        setEvents([]);
        setCurrentVisual(null);
        setIsLoading(true);
        setIsStreaming(true);
        setError(null);
        setFullText('');
        setCurrentQuestion(question);

        // Show visual immediately based on question content
        if (question.toLowerCase().includes('gravity') || question.toLowerCase().includes('apple')) {
            setCurrentVisual({ type: 'falling_object' });
        } else if (question.toLowerCase().includes('pendulum')) {
            setCurrentVisual({ type: 'pendulum_swing' });
        } else if (question.toLowerCase().includes('wave') || question.toLowerCase().includes('sound')) {
            setCurrentVisual({ type: 'wave_motion' });
        } else if (question.toLowerCase().includes('spring')) {
            setCurrentVisual({ type: 'spring_oscillation' });
        }

        // Choose streaming method based on mode
        const streamMethod = useMockData 
            ? aiTeacherAPI.mockStreamQuestion.bind(aiTeacherAPI)
            : aiTeacherAPI.streamQuestion.bind(aiTeacherAPI);

        let accumulatedText = '';

        try {
            await streamMethod(
                { question, include_visual: true },
                (event) => {
                    setEvents((prev) => [...prev, event]);

                    switch (event.type) {
                        case 'start':
                            setIsLoading(false);
                            break;
                        case 'text':
                            if (event.content) {
                                accumulatedText += event.content;
                                setFullText(accumulatedText);
                            }
                            break;
                        case 'visual_cue':
                        case 'visual':
                            const vType = mapConceptToAnimation(event.content || event.action || '');
                            setCurrentVisual({
                                type: vType,
                                data: event.data,
                            });
                            break;
                        case 'complete':
                            setIsStreaming(false);
                            setIsLoading(false);
                            if (event.full_text) {
                                setFullText(event.full_text);
                            }
                            break;
                        case 'error':
                            setIsStreaming(false);
                            setIsLoading(false);
                            break;
                    }
                },
                (err) => {
                    console.error('Stream error:', err);
                    setError(err.message);
                    setIsStreaming(false);
                    setIsLoading(false);
                }
            );
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsStreaming(false);
            setIsLoading(false);
        }
    }, [useMockData]);

    // Handle feedback
    const handleFeedback = useCallback((helpful: boolean) => {
        console.log('Feedback:', helpful ? 'positive' : 'negative');
    }, []);

    const isComplete = events.some((e) => e.type === 'complete');

    return (
        <div className={cn('min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900', className)}>
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xl">
                                🎓
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">AI Teacher</h1>
                                <p className="text-sm text-white/50">Interactive Visual Learning with Voice</p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-4">
                            {isStreaming && (
                                <div className="flex items-center gap-2 text-violet-400">
                                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                                    <span className="text-sm">Thinking...</span>
                                </div>
                            )}
                            {isSpeaking && (
                                <div className="flex items-center gap-2 text-green-400">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-sm">Speaking...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8">
                {/* Error banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 flex items-center justify-between">
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left side - Speaking Avatar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Avatar */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6">
                            <SpeakingAvatar
                                isSpeaking={isStreaming}
                                textToSpeak={isComplete ? fullText : undefined}
                                onSpeakingStart={() => setIsSpeaking(true)}
                                onSpeakingEnd={() => setIsSpeaking(false)}
                                autoSpeak={!useMockData} // Auto speak when using real API
                            />
                        </div>

                        {/* Current Question */}
                        {currentQuestion && (
                            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                                <h3 className="text-sm font-medium text-white/50 mb-2">Your Question:</h3>
                                <p className="text-white/90 italic">"{currentQuestion}"</p>
                            </div>
                        )}

                        {/* Feedback section */}
                        {isComplete && !isSpeaking && (
                            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 space-y-4 animate-fadeIn">
                                <p className="text-white/70 text-center">Was this explanation helpful?</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => handleFeedback(true)}
                                        className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                                    >
                                        👍 Yes
                                    </button>
                                    <button
                                        onClick={() => handleFeedback(false)}
                                        className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                                    >
                                        👎 No
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right side - Main teaching area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Visual demonstration */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">🎬</span>
                                Visual Example
                            </h2>
                            <VisualCanvas
                                animationType={currentVisual?.type}
                                animationData={currentVisual?.data}
                                className="h-[300px]"
                            />
                        </div>

                        {/* Explanation */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">📖</span>
                                Explanation
                                {isSpeaking && (
                                    <span className="text-sm font-normal text-green-400 ml-2">
                                        🔊 Playing audio...
                                    </span>
                                )}
                            </h2>
                            <ExplanationDisplay events={events} />
                        </div>

                        {/* Voice Question input */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">🎤</span>
                                Ask a Question
                                <span className="text-sm font-normal text-white/50">
                                    (Type or speak)
                                </span>
                            </h2>
                            <VoiceQuestionInput
                                onSubmit={handleSubmit}
                                isLoading={isLoading || isStreaming || isSpeaking}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
