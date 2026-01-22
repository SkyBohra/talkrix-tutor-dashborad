'use client';

import { useState, FormEvent, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useAudioRecorder';

interface VoiceQuestionInputProps {
    onSubmit: (question: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    className?: string;
}

// Suggested questions for quick access
const SUGGESTED_QUESTIONS = [
    { text: 'What is gravity?', icon: '🍎' },
    { text: 'How does a pendulum work?', icon: '⏰' },
    { text: 'What are sound waves?', icon: '🔊' },
    { text: 'How do springs work?', icon: '🎯' },
    { text: 'What is photosynthesis?', icon: '🌱' },
];

export function VoiceQuestionInput({
    onSubmit,
    isLoading = false,
    placeholder = 'Ask any question or click the mic to speak...',
    className,
}: VoiceQuestionInputProps) {
    const [question, setQuestion] = useState('');
    const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
    
    const {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        finalTranscript,
    } = useSpeechRecognition();

    // Update question with transcript
    useEffect(() => {
        if (finalTranscript) {
            setQuestion(finalTranscript);
        }
    }, [finalTranscript]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const textToSubmit = question.trim() || finalTranscript.trim();
        if (textToSubmit && !isLoading) {
            onSubmit(textToSubmit);
            setQuestion('');
            resetTranscript();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        if (!isLoading) {
            onSubmit(suggestion);
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            stopListening();
            // Auto-submit after stopping
            const textToSubmit = finalTranscript.trim();
            if (textToSubmit && !isLoading) {
                setTimeout(() => {
                    onSubmit(textToSubmit);
                    resetTranscript();
                    setQuestion('');
                }, 300);
            }
        } else {
            setQuestion('');
            resetTranscript();
            startListening();
        }
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Main input form */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center gap-2">
                    {/* Text/Voice Toggle */}
                    <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300',
                            isListening 
                                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
                                : 'bg-violet-500/20 hover:bg-violet-500/30'
                        )}
                    >
                        {isListening ? (
                            <div className="relative">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="6" width="12" height="12" rx="1" />
                                </svg>
                                {/* Recording animation */}
                                <span className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-50" />
                            </div>
                        ) : (
                            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        )}
                    </button>

                    {/* Input field */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={isListening ? finalTranscript : question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={isListening ? 'Listening...' : placeholder}
                            disabled={isLoading || isListening}
                            className={cn(
                                'w-full px-5 py-4 pr-14 rounded-xl',
                                'bg-white/10 backdrop-blur-sm border border-white/20',
                                'text-white placeholder:text-white/50',
                                'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                                'transition-all duration-200',
                                (isLoading || isListening) && 'opacity-70',
                                isListening && 'border-red-500/50'
                            )}
                        />
                        
                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={(!question.trim() && !finalTranscript.trim()) || isLoading || isListening}
                            className={cn(
                                'absolute right-2 top-1/2 -translate-y-1/2',
                                'w-10 h-10 rounded-lg',
                                'bg-gradient-to-r from-violet-500 to-blue-500',
                                'flex items-center justify-center',
                                'hover:from-violet-600 hover:to-blue-600',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                'transition-all duration-200',
                                isLoading && 'animate-pulse'
                            )}
                        >
                            {isLoading ? (
                                <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Voice input feedback */}
                {isListening && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span>Recording... Speak your question</span>
                        </div>
                        {finalTranscript && (
                            <p className="mt-2 text-white/80 italic">"{finalTranscript}"</p>
                        )}
                    </div>
                )}
            </form>

            {/* Suggested questions */}
            <div className="space-y-2">
                <p className="text-sm text-white/50">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion.text)}
                            disabled={isLoading || isListening}
                            className={cn(
                                'px-3 py-2 rounded-lg',
                                'bg-white/5 hover:bg-white/10',
                                'border border-white/10 hover:border-white/20',
                                'text-sm text-white/70 hover:text-white',
                                'transition-all duration-200',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            <span className="mr-1.5">{suggestion.icon}</span>
                            {suggestion.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
