'use client';

import { useRef, useEffect, ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { StreamEvent } from '@/lib/ai-teacher-api';

interface ExplanationDisplayProps {
    events: StreamEvent[];
    className?: string;
}

export function ExplanationDisplay({ events, className }: ExplanationDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [events]);

    // Process events to build display
    const renderContent = () => {
        const elements: ReactElement[] = [];
        let wordIndex = 0;

        for (const event of events) {
            if (event.type === 'text' && event.content) {
                elements.push(
                    <span
                        key={`word-${wordIndex++}`}
                        className="animate-fadeIn"
                    >
                        {event.content}
                    </span>
                );
            } else if (event.type === 'emphasis') {
                // Update the last word with emphasis styling
                // Note: This is handled in the text event by looking ahead
            }
        }

        return elements;
    };

    // Get emphasis class for a word
    const getEmphasisClass = (importance?: string) => {
        switch (importance) {
            case 'high':
                return 'text-amber-400 font-bold';
            case 'medium':
                return 'text-violet-400 font-medium';
            default:
                return '';
        }
    };

    // Build words with proper styling
    const buildStyledContent = () => {
        const words: { text: string; emphasis?: string }[] = [];
        
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            
            if (event.type === 'text' && event.content) {
                // Check if next event is emphasis for this word
                const nextEvent = events[i + 1];
                const emphasis = nextEvent?.type === 'emphasis' ? nextEvent.importance : undefined;
                
                words.push({ text: event.content, emphasis });
            }
        }

        return words.map((word, index) => (
            <span
                key={index}
                className={cn(
                    'transition-all duration-200',
                    getEmphasisClass(word.emphasis),
                    'animate-fadeIn'
                )}
                style={{ animationDelay: `${index * 20}ms` }}
            >
                {word.text}
            </span>
        ));
    };

    const hasContent = events.some(e => e.type === 'text');

    return (
        <div
            ref={containerRef}
            className={cn(
                'bg-black/30 backdrop-blur-sm rounded-xl p-6 min-h-[200px] max-h-[400px] overflow-y-auto',
                'scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent',
                className
            )}
        >
            {hasContent ? (
                <div className="text-lg leading-relaxed text-white/90">
                    {buildStyledContent()}
                    
                    {/* Typing cursor */}
                    <span className="inline-block w-0.5 h-5 bg-white/70 ml-1 animate-blink" />
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-white/40">
                    <p>Ask a question to start learning...</p>
                </div>
            )}
        </div>
    );
}
