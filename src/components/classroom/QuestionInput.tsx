'use client';

import { useState, FormEvent } from 'react';
import { cn } from '@/lib/utils';

interface QuestionInputProps {
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

export function QuestionInput({
    onSubmit,
    isLoading = false,
    placeholder = 'Ask any question about physics, science, or math...',
    className,
}: QuestionInputProps) {
    const [question, setQuestion] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (question.trim() && !isLoading) {
            onSubmit(question.trim());
            setQuestion('');
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        if (!isLoading) {
            onSubmit(suggestion);
        }
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Main input form */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={placeholder}
                        disabled={isLoading}
                        className={cn(
                            'w-full px-5 py-4 pr-14 rounded-xl',
                            'bg-white/10 backdrop-blur-sm border border-white/20',
                            'text-white placeholder:text-white/50',
                            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                            'transition-all duration-200',
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                    />
                    
                    <button
                        type="submit"
                        disabled={!question.trim() || isLoading}
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
            </form>

            {/* Suggested questions */}
            <div className="space-y-2">
                <p className="text-sm text-white/50">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion.text)}
                            disabled={isLoading}
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
