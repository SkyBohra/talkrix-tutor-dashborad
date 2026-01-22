'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTextToSpeechOptions {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
}

interface UseTextToSpeechReturn {
    speak: (text: string) => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    isSpeaking: boolean;
    isPaused: boolean;
    currentWord: string;
    progress: number;
    voices: SpeechSynthesisVoice[];
    setVoice: (voiceName: string) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentWord, setCurrentWord] = useState('');
    const [progress, setProgress] = useState(0);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>(options.voice || '');
    
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const textRef = useRef<string>('');

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            
            // Set default voice (prefer English)
            if (!selectedVoice && availableVoices.length > 0) {
                const englishVoice = availableVoices.find(v => 
                    v.lang.startsWith('en') && v.name.includes('Female')
                ) || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
                setSelectedVoice(englishVoice.name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice]);

    const speak = useCallback((text: string) => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        textRef.current = text;
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) {
            utterance.voice = voice;
        }

        // Set options
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        // Event handlers
        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
            setProgress(0);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setProgress(100);
            setCurrentWord('');
        };

        utterance.onpause = () => {
            setIsPaused(true);
        };

        utterance.onresume = () => {
            setIsPaused(false);
        };

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const word = text.substring(event.charIndex, event.charIndex + event.charLength);
                setCurrentWord(word);
                setProgress((event.charIndex / text.length) * 100);
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [voices, selectedVoice, options.rate, options.pitch, options.volume]);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentWord('');
        setProgress(0);
    }, []);

    const pause = useCallback(() => {
        window.speechSynthesis.pause();
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        window.speechSynthesis.resume();
        setIsPaused(false);
    }, []);

    const setVoice = useCallback((voiceName: string) => {
        setSelectedVoice(voiceName);
    }, []);

    return {
        speak,
        stop,
        pause,
        resume,
        isSpeaking,
        isPaused,
        currentWord,
        progress,
        voices,
        setVoice,
    };
}
