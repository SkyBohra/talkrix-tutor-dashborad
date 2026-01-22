'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { VisualCanvas } from './VisualCanvas';
import { AvatarDisplay } from './AvatarDisplay';
import { ExplanationDisplay } from './ExplanationDisplay';
import { QuestionInput } from './QuestionInput';
import { cn } from '@/lib/utils';
import { StreamEvent } from '@/lib/ai-teacher-api';

interface LiveClassroomProps {
    className?: string;
}

export function LiveClassroom({ className }: LiveClassroomProps) {
    const [events, setEvents] = useState<StreamEvent[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentVisual, setCurrentVisual] = useState<{
        type: string;
        data?: Record<string, unknown>;
    } | null>(null);

    // Handle incoming messages from WebSocket
    const handleMessage = useCallback((data: StreamEvent) => {
        setEvents((prev) => [...prev, data]);

        switch (data.type) {
            case 'start':
                setEvents([]); // Clear previous events
                setIsSpeaking(true);
                break;

            case 'visual':
                // Map concept to animation type
                const visualType = mapConceptToAnimation(data.concept || '');
                setCurrentVisual({
                    type: visualType,
                    data: data.visual as Record<string, unknown>,
                });
                break;

            case 'emphasis':
                // Visual emphasis handled in ExplanationDisplay
                break;

            case 'complete':
            case 'error':
                setIsSpeaking(false);
                break;
        }
    }, []);

    const {
        isConnected,
        isLoading,
        askQuestion,
        sendFeedback,
    } = useWebSocket({
        onMessage: handleMessage,
        onError: (error) => {
            console.error('WebSocket error:', error);
            setIsSpeaking(false);
        },
    });

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
    const handleSubmit = useCallback((question: string) => {
        setEvents([]);
        setCurrentVisual(null);
        askQuestion(question);
    }, [askQuestion]);

    // Handle feedback
    const handleFeedback = useCallback((helpful: boolean) => {
        sendFeedback(helpful);
    }, [sendFeedback]);

    // Connection status
    const connectionStatus = useMemo(() => {
        if (isConnected) {
            return { text: 'Connected', color: 'text-green-400', dot: 'bg-green-400' };
        }
        return { text: 'Disconnected', color: 'text-red-400', dot: 'bg-red-400' };
    }, [isConnected]);

    return (
        <div className={cn('min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900', className)}>
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xl">
                                🎓
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">AI Teacher</h1>
                                <p className="text-sm text-white/50">Interactive Visual Learning</p>
                            </div>
                        </div>

                        {/* Connection status */}
                        <div className="flex items-center gap-2">
                            <span className={cn('relative flex h-2 w-2', connectionStatus.dot)}>
                                {isConnected && (
                                    <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', connectionStatus.dot)} />
                                )}
                                <span className={cn('relative inline-flex rounded-full h-2 w-2', connectionStatus.dot)} />
                            </span>
                            <span className={cn('text-sm', connectionStatus.color)}>
                                {connectionStatus.text}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left side - Avatar and feedback */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Avatar */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6">
                            <AvatarDisplay
                                isSpeaking={isSpeaking}
                                status={isConnected ? 'Ready to teach!' : 'Connecting...'}
                            />
                        </div>

                        {/* Feedback section */}
                        {events.some((e) => e.type === 'complete') && (
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

                        {/* Quick actions */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 space-y-3">
                            <h3 className="text-sm font-medium text-white/70">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
                                    📚 Courses
                                </button>
                                <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
                                    📊 Progress
                                </button>
                                <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
                                    🔖 Bookmarks
                                </button>
                                <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
                                    ⚙️ Settings
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Main teaching area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Visual demonstration */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">🎬</span>
                                Visual Demonstration
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
                            </h2>
                            <ExplanationDisplay events={events} />
                        </div>

                        {/* Question input */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">❓</span>
                                Ask a Question
                            </h2>
                            <QuestionInput
                                onSubmit={handleSubmit}
                                isLoading={isLoading || isSpeaking}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
