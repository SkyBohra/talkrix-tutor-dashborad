'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface SpeakingAvatarProps {
    isSpeaking?: boolean;
    textToSpeak?: string;
    avatarStyle?: 'professional' | 'friendly' | 'animated';
    className?: string;
    onSpeakingStart?: () => void;
    onSpeakingEnd?: () => void;
    autoSpeak?: boolean;
}

export function SpeakingAvatar({
    isSpeaking: externalIsSpeaking = false,
    textToSpeak,
    avatarStyle = 'professional',
    className,
    onSpeakingStart,
    onSpeakingEnd,
    autoSpeak = true,
}: SpeakingAvatarProps) {
    const { speak, stop, isSpeaking, currentWord, progress, voices, setVoice } = useTextToSpeech({
        rate: 0.85,
        pitch: 1.0,
    });
    
    const [mouthOpen, setMouthOpen] = useState(false);
    const [eyesBlink, setEyesBlink] = useState(false);
    const lastTextRef = useRef<string>('');
    const hasSpokenRef = useRef(false);

    // Animate mouth based on speaking
    useEffect(() => {
        if (isSpeaking) {
            const interval = setInterval(() => {
                setMouthOpen(prev => !prev);
            }, 150);
            return () => clearInterval(interval);
        } else {
            setMouthOpen(false);
        }
    }, [isSpeaking]);

    // Blink eyes occasionally
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setEyesBlink(true);
            setTimeout(() => setEyesBlink(false), 150);
        }, 3000 + Math.random() * 2000);
        return () => clearInterval(blinkInterval);
    }, []);

    // Speak text when it changes
    useEffect(() => {
        if (textToSpeak && autoSpeak && textToSpeak !== lastTextRef.current) {
            lastTextRef.current = textToSpeak;
            hasSpokenRef.current = false;
        }
    }, [textToSpeak, autoSpeak]);

    // Start speaking when text is complete
    useEffect(() => {
        if (textToSpeak && !externalIsSpeaking && !isSpeaking && !hasSpokenRef.current && autoSpeak) {
            // Wait a moment for text streaming to complete
            const timeout = setTimeout(() => {
                if (!hasSpokenRef.current) {
                    hasSpokenRef.current = true;
                    onSpeakingStart?.();
                    speak(textToSpeak);
                }
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [textToSpeak, externalIsSpeaking, isSpeaking, autoSpeak, speak, onSpeakingStart]);

    // Notify when speaking ends
    useEffect(() => {
        if (!isSpeaking && hasSpokenRef.current) {
            onSpeakingEnd?.();
        }
    }, [isSpeaking, onSpeakingEnd]);

    const isCurrentlySpeaking = isSpeaking || externalIsSpeaking;

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            {/* Avatar Container */}
            <div className="relative">
                {/* Glow effect when speaking */}
                {isCurrentlySpeaking && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 blur-xl opacity-50 animate-pulse" />
                )}

                {/* Avatar Face */}
                <div
                    className={cn(
                        'relative w-40 h-40 rounded-full flex items-center justify-center',
                        'bg-gradient-to-br from-violet-600 to-blue-600',
                        'shadow-2xl border-4 border-white/20',
                        'transition-transform duration-300',
                        isCurrentlySpeaking && 'scale-105'
                    )}
                >
                    {/* Face SVG */}
                    <svg viewBox="0 0 100 100" className="w-32 h-32">
                        {/* Face background */}
                        <circle cx="50" cy="50" r="45" fill="#FFE4C4" />
                        
                        {/* Hair */}
                        <path 
                            d="M15 45 Q15 15 50 10 Q85 15 85 45 Q85 30 70 25 Q50 20 30 25 Q15 30 15 45" 
                            fill="#4A3728"
                        />
                        
                        {/* Eyes */}
                        <ellipse 
                            cx="35" cy="45" 
                            rx={eyesBlink ? 4 : 4} 
                            ry={eyesBlink ? 1 : 5} 
                            fill="#2D3748"
                            className="transition-all duration-100"
                        />
                        <ellipse 
                            cx="65" cy="45" 
                            rx={eyesBlink ? 4 : 4} 
                            ry={eyesBlink ? 1 : 5} 
                            fill="#2D3748"
                            className="transition-all duration-100"
                        />
                        
                        {/* Eye highlights */}
                        {!eyesBlink && (
                            <>
                                <circle cx="33" cy="43" r="1.5" fill="white" />
                                <circle cx="63" cy="43" r="1.5" fill="white" />
                            </>
                        )}
                        
                        {/* Eyebrows */}
                        <path d="M28 38 Q35 35 42 38" stroke="#4A3728" strokeWidth="2" fill="none" />
                        <path d="M58 38 Q65 35 72 38" stroke="#4A3728" strokeWidth="2" fill="none" />
                        
                        {/* Nose */}
                        <path d="M50 48 Q48 55 50 58 Q52 55 50 48" stroke="#D4A574" strokeWidth="1.5" fill="none" />
                        
                        {/* Mouth - animates when speaking */}
                        {mouthOpen ? (
                            <ellipse cx="50" cy="70" rx="10" ry="6" fill="#C53030" />
                        ) : (
                            <path 
                                d="M40 68 Q50 75 60 68" 
                                stroke="#C53030" 
                                strokeWidth="3" 
                                fill="none"
                                strokeLinecap="round"
                            />
                        )}
                        
                        {/* Cheeks */}
                        <circle cx="25" cy="55" r="6" fill="#FFB6C1" opacity="0.5" />
                        <circle cx="75" cy="55" r="6" fill="#FFB6C1" opacity="0.5" />
                    </svg>
                </div>

                {/* Speaking indicator */}
                {isCurrentlySpeaking && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1.5 bg-gradient-to-t from-violet-500 to-blue-400 rounded-full animate-bounce"
                                style={{
                                    height: `${8 + Math.random() * 16}px`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '0.4s',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Status */}
            <div className="text-center space-y-2">
                <p className={cn(
                    'text-sm font-medium',
                    isCurrentlySpeaking ? 'text-green-400' : 'text-gray-400'
                )}>
                    {isCurrentlySpeaking ? '🔊 Speaking...' : '🎓 AI Teacher'}
                </p>

                {/* Current word highlight */}
                {currentWord && isCurrentlySpeaking && (
                    <p className="text-lg font-bold text-violet-400 animate-pulse">
                        "{currentWord}"
                    </p>
                )}

                {/* Progress bar */}
                {isCurrentlySpeaking && (
                    <div className="w-40 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Controls */}
            {textToSpeak && (
                <div className="flex gap-2">
                    {!isSpeaking ? (
                        <button
                            onClick={() => {
                                hasSpokenRef.current = true;
                                onSpeakingStart?.();
                                speak(textToSpeak);
                            }}
                            className="px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 text-sm transition-colors"
                        >
                            🔊 Play Again
                        </button>
                    ) : (
                        <button
                            onClick={stop}
                            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors"
                        >
                            ⏹ Stop
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
