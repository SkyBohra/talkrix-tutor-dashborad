'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { VisualCanvas } from '@/components/classroom/VisualCanvas';
import { DynamicVisualCanvas } from '@/components/classroom/DynamicVisualCanvas';
import { AnimationScene } from '@/hooks/useDynamicAnimation';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api-config';
import { RotateCcw, Volume2, VolumeX, Mic, Square, Loader2, Sparkles } from 'lucide-react';

type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';

interface Message {
    role: 'user' | 'agent';
    text: string;
    timestamp: Date;
}

interface LipSyncFrame {
    word: string;
    start: number;
    end: number;
    shape: 'open' | 'wide' | 'neutral';
}

interface LipSyncData {
    duration: number;
    word_count: number;
    frames: LipSyncFrame[];
}

export default function ClassroomSection() {
    // State
    const [state, setState] = useState<ConversationState>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [streamingText, setStreamingText] = useState('');
    const [currentVisual, setCurrentVisual] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pipelineStatus, setPipelineStatus] = useState<string>('');
    
    // Dynamic animation state
    const [useDynamicAnimation, setUseDynamicAnimation] = useState(true);
    const [animationScene, setAnimationScene] = useState<AnimationScene | null>(null);
    
    // Lip sync state
    const [lipSyncData, setLipSyncData] = useState<LipSyncData | null>(null);
    const [currentMouthShape, setCurrentMouthShape] = useState<'open' | 'wide' | 'neutral' | 'closed'>('closed');
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    // Refs
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lipSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentTranscript, streamingText]);

    // Cleanup lip sync on unmount
    useEffect(() => {
        return () => {
            if (lipSyncIntervalRef.current) {
                clearInterval(lipSyncIntervalRef.current);
            }
        };
    }, []);

    // Initialize speech recognition
    const initRecognition = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported. Please use Chrome browser.');
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
        window.speechSynthesis.cancel();
        if (audioElement) {
            audioElement.pause();
        }
        
        const recognition = initRecognition();
        if (!recognition) return;

        let silenceTimer: NodeJS.Timeout;
        let finalText = '';

        recognition.onstart = () => {
            setState('listening');
            setCurrentTranscript('');
            setError(null);
            setPipelineStatus('');
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

            if (final) finalText += final;
            setCurrentTranscript(finalText + interim);

            clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                if (finalText.trim()) recognition.stop();
            }, 1500);
        };

        recognition.onend = () => {
            clearTimeout(silenceTimer);
            const userText = finalText.trim() || currentTranscript.trim();
            
            if (userText) {
                setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
                setCurrentTranscript('');
                processWithPipeline(userText);
            } else {
                setState('idle');
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                setError(`Microphone error: ${event.error}`);
            }
            setState('idle');
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [initRecognition, currentTranscript, audioElement]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
    }, []);

    // ============================================
    // MAIN PIPELINE: Question → LLM → Voice + Visual
    // Voice: Teacher SPEAKS the simple answer
    // Visual: SHOWS the example animation
    // ============================================
    const processWithPipeline = useCallback(async (question: string) => {
        setState('processing');
        setStreamingText('');
        setLipSyncData(null);
        setCurrentMouthShape('closed');
        setPipelineStatus('🧠 Sending to AI...');
        setAnimationScene(null);  // Reset animation scene

        try {
            // Choose endpoint based on mode
            const endpoint = useDynamicAnimation 
                ? `${API_CONFIG.baseUrl}/api/v1/teaching/stream-dynamic`
                : `${API_CONFIG.baseUrl}${API_ENDPOINTS.teachingStream}`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    subject: 'general',
                    include_visual: true,
                    include_avatar: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to connect to teaching pipeline');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let spokenAnswer = '';
            let visualExample = '';
            let rememberText = '';
            let audioBase64: string | null = null;
            let lipSync: LipSyncData | null = null;

            if (!reader) throw new Error('No response stream');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event = JSON.parse(line.slice(6));
                            
                            switch (event.type) {
                                case 'start':
                                    setPipelineStatus('🧠 Processing question...');
                                    break;
                                    
                                case 'visual':
                                    setCurrentVisual(event.visual_type);
                                    setPipelineStatus('🎬 Visual ready: ' + event.description);
                                    break;
                                
                                case 'animation_scene':
                                    // Dynamic animation from LLM
                                    if (event.scene) {
                                        setAnimationScene(event.scene);
                                        setPipelineStatus('✨ Custom animation created!');
                                    }
                                    break;
                                
                                case 'fallback':
                                    // Falling back to predefined animation
                                    setPipelineStatus('🎬 ' + event.message);
                                    break;
                                    
                                case 'thinking':
                                    setPipelineStatus('💭 ' + event.message);
                                    break;
                                    
                                case 'spoken':
                                    // This is what the teacher SAYS
                                    spokenAnswer = event.content;
                                    setStreamingText(spokenAnswer);
                                    break;
                                    
                                case 'visual_example':
                                    // This shows in the visual area
                                    visualExample = event.content;
                                    break;
                                    
                                case 'remember':
                                    rememberText = event.content;
                                    break;
                                    
                                case 'generating_audio':
                                    setPipelineStatus('🎤 Teacher is preparing to speak...');
                                    break;
                                    
                                case 'audio_ready':
                                    console.log('🎵 Audio ready event received, audio length:', event.audio_base64?.length || 0);
                                    audioBase64 = event.audio_base64;
                                    lipSync = event.lip_sync;
                                    setLipSyncData(lipSync);
                                    setPipelineStatus('✅ Ready!');
                                    break;
                                    
                                case 'audio_fallback':
                                    console.log('⚠️ Audio fallback - using browser voice');
                                    setPipelineStatus('🔊 Using browser voice...');
                                    break;
                                    
                                case 'complete':
                                    // Add message with spoken answer and visual example
                                    const fullResponse = `🗣️ ${event.spoken_answer || spokenAnswer}\n\n👁️ Example: ${event.visual_example || visualExample}\n\n💡 ${event.remember || rememberText}`;
                                    setMessages(prev => [...prev, {
                                        role: 'agent',
                                        text: fullResponse,
                                        timestamp: new Date()
                                    }]);
                                    
                                    // Play audio ONLY for the spoken part
                                    console.log('📢 Complete event - audioBase64 exists:', !!audioBase64, ', isMuted:', isMuted);
                                    if (audioBase64 && !isMuted) {
                                        console.log('🔊 Calling playElevenLabsAudio with audio length:', audioBase64.length);
                                        playElevenLabsAudio(audioBase64, lipSync);
                                    } else {
                                        console.log('🔇 Using browser TTS - audioBase64:', !!audioBase64, ', muted:', isMuted);
                                        speakWithBrowser(spokenAnswer);
                                    }
                                    break;
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Pipeline error:', err);
            setPipelineStatus('⚠️ Using fallback mode...');
            // Fallback to mock data
            await fallbackProcess(question);
        }
    }, [isMuted]);

    // Fallback processing when backend is not available
    const fallbackProcess = async (question: string) => {
        // Determine visual based on question keywords
        const q = question.toLowerCase();
        
        // Visual type matching with comprehensive keywords
        if (q.includes('gravity') || q.includes('apple') || q.includes('fall') || q.includes('drop') || q.includes('गुरुत्वाकर्षण')) {
            setCurrentVisual('falling_object');
        } else if (q.includes('pendulum') || q.includes('swing') || q.includes('clock') || q.includes('पेंडुलम')) {
            setCurrentVisual('pendulum_swing');
        } else if (q.includes('wave') || q.includes('sound') || q.includes('frequency') || q.includes('तरंग')) {
            setCurrentVisual('wave_motion');
        } else if (q.includes('spring') || q.includes('elastic') || q.includes('स्प्रिंग')) {
            setCurrentVisual('spring_oscillation');
        } else if (q.includes('planet') || q.includes('solar') || q.includes('orbit') || q.includes('earth') || q.includes('ग्रह')) {
            setCurrentVisual('orbital_motion');
        } else if (q.includes('electr') || q.includes('circuit') || q.includes('current') || q.includes('बिजली')) {
            setCurrentVisual('electric_flow');
        } else if (q.includes('atom') || q.includes('molecul') || q.includes('water') || q.includes('h2o') || q.includes('परमाणु')) {
            setCurrentVisual('molecular_motion');
        } else if (q.includes('force') || q.includes('push') || q.includes('pull') || q.includes('motion') || q.includes('बल')) {
            setCurrentVisual('force_motion');
        } else if (q.includes('math') || q.includes('add') || q.includes('number') || q.includes('गणित')) {
            setCurrentVisual('math_visual');
        } else if (q.includes('shape') || q.includes('triangle') || q.includes('circle') || q.includes('geometry') || q.includes('आकार')) {
            setCurrentVisual('geometry_visual');
        } else if (q.includes('energy') || q.includes('kinetic') || q.includes('potential') || q.includes('ऊर्जा')) {
            setCurrentVisual('energy_transfer');
        } else {
            setCurrentVisual('falling_object');
        }

        // Mock response
        const mockResponses: Record<string, string> = {
            gravity: 'Gravity is a force that pulls objects toward each other. On Earth, it pulls everything toward the center of the planet at 9.8 meters per second squared. When you drop an apple, gravity accelerates it toward the ground!',
            pendulum: 'A pendulum swings back and forth due to gravity. The time for one complete swing depends only on its length, not its weight. This principle was used in old grandfather clocks!',
            wave: 'Waves transfer energy through space without moving matter. Sound waves compress and expand air molecules to reach your ears. Light waves are electromagnetic and can travel through vacuum!',
            spring: 'Springs store energy when stretched or compressed. According to Hookes Law, the force is proportional to displacement: F = -kx. This is why springs bounce back!',
            default: 'That is a great question! Let me explain this concept with a visual demonstration. Science helps us understand the world around us through observation and experimentation.'
        };

        let response = mockResponses.default;
        for (const [key, value] of Object.entries(mockResponses)) {
            if (q.includes(key)) {
                response = value;
                break;
            }
        }

        // Stream the response
        for (let i = 0; i < response.length; i++) {
            await new Promise(r => setTimeout(r, 20));
            setStreamingText(response.slice(0, i + 1));
        }

        setMessages(prev => [...prev, { role: 'agent', text: response, timestamp: new Date() }]);
        speakWithBrowser(response);
    };

    // Play ElevenLabs audio with lip sync
    const playElevenLabsAudio = useCallback((base64Audio: string, lipSync: LipSyncData | null) => {
        console.log('🎵 Playing ElevenLabs audio, length:', base64Audio?.length || 0);
        
        if (!base64Audio || base64Audio.length < 100) {
            console.error('❌ Audio data is missing or too short');
            speakWithBrowser(streamingText || messages[messages.length - 1]?.text || '');
            return;
        }
        
        setState('speaking');
        setStreamingText('');
        
        const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
        setAudioElement(audio);

        // Start lip sync animation
        if (lipSync && lipSync.frames.length > 0) {
            const startTime = Date.now();
            
            lipSyncIntervalRef.current = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                
                // Find current frame
                const currentFrame = lipSync.frames.find(
                    f => elapsed >= f.start && elapsed < f.end
                );
                
                if (currentFrame) {
                    setCurrentMouthShape(currentFrame.shape);
                } else if (elapsed > lipSync.duration) {
                    setCurrentMouthShape('closed');
                    if (lipSyncIntervalRef.current) {
                        clearInterval(lipSyncIntervalRef.current);
                    }
                }
            }, 50);
        }

        audio.onended = () => {
            console.log('✅ Audio playback finished');
            setState('idle');
            setCurrentMouthShape('closed');
            if (lipSyncIntervalRef.current) {
                clearInterval(lipSyncIntervalRef.current);
            }
            // Stay idle - don't auto-start listening
            // User can click mic button to ask another question
        };

        audio.onerror = (e) => {
            console.error('❌ Audio error:', e);
            setState('idle');
            setCurrentMouthShape('closed');
            // Fallback to browser TTS
            speakWithBrowser(streamingText || messages[messages.length - 1]?.text || '');
        };

        audio.play().then(() => {
            console.log('🔊 Audio started playing successfully');
        }).catch((err) => {
            console.error('❌ Audio play failed:', err);
            // If audio fails, use browser TTS
            speakWithBrowser(streamingText || messages[messages.length - 1]?.text || '');
        });
    }, [streamingText, messages]);

    // Browser TTS fallback
    const speakWithBrowser = useCallback((text: string) => {
        if (isMuted) {
            setState('idle');
            setStreamingText('');
            // Stay idle - don't auto-start listening
            return;
        }

        setState('speaking');
        setStreamingText('');
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;

        // Animate mouth during speech
        const words = text.split(' ');
        const wordDuration = (text.length / 150) * 60 * 1000 / words.length;
        let wordIndex = 0;
        
        const mouthInterval = setInterval(() => {
            if (wordIndex < words.length) {
                const word = words[wordIndex];
                const hasVowel = /[aeiou]/i.test(word);
                setCurrentMouthShape(hasVowel ? 'open' : 'wide');
                wordIndex++;
            }
        }, wordDuration);

        utterance.onend = () => {
            clearInterval(mouthInterval);
            setState('idle');
            setCurrentMouthShape('closed');
            // Stay idle - don't auto-start listening
            // User can click mic button to ask another question
        };

        window.speechSynthesis.speak(utterance);
    }, [isMuted]);

    // Stop speaking
    const stopSpeaking = useCallback(() => {
        window.speechSynthesis.cancel();
        if (audioElement) audioElement.pause();
        if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
        setState('idle');
        setStreamingText('');
        setCurrentMouthShape('closed');
    }, [audioElement]);

    // Toggle mic
    const toggleMic = useCallback(() => {
        if (state === 'idle') startListening();
        else if (state === 'listening') stopListening();
        else if (state === 'speaking') {
            stopSpeaking();
            startListening();
        }
    }, [state, startListening, stopListening, stopSpeaking]);

    // Reset
    const handleReset = () => {
        stopSpeaking();
        if (recognitionRef.current) recognitionRef.current.stop();
        setMessages([]);
        setCurrentTranscript('');
        setStreamingText('');
        setCurrentVisual(null);
        setAnimationScene(null);  // Reset dynamic animation
        setState('idle');
        setError(null);
        setPipelineStatus('');
    };

    // Quick topics
    const quickTopics = [
        { label: 'What is Gravity?', question: 'What is gravity and why do things fall?' },
        { label: 'How Pendulums Work', question: 'How does a pendulum work and why does it swing?' },
        { label: 'Sound Waves', question: 'What are sound waves and how do we hear?' },
        { label: 'Spring Physics', question: 'How do springs work and what is Hookes Law?' },
    ];

    // Get mouth dimensions based on shape
    const getMouthStyle = () => {
        switch (currentMouthShape) {
            case 'open':
                return { width: '28px', height: '18px', borderRadius: '40% 40% 50% 50%' };
            case 'wide':
                return { width: '32px', height: '10px', borderRadius: '20%' };
            case 'neutral':
                return { width: '24px', height: '8px', borderRadius: '30%' };
            default:
                return { width: '30px', height: '4px', borderRadius: '0 0 50% 50%' };
        }
    };

    const mouthStyle = getMouthStyle();

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px' }}>🎓</span>
                        AI Teacher - Live Classroom
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginTop: '4px' }}>
                        Question → GPT-4 → ElevenLabs Voice + Visual Demo + Lip-Sync Avatar
                    </p>
                    {pipelineStatus && (
                        <p style={{ color: '#a78bfa', fontSize: '13px', marginTop: '8px' }}>
                            {pipelineStatus}
                        </p>
                    )}
                </div>
                
                {/* Status Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: state === 'speaking' ? 'rgba(34, 197, 94, 0.2)' : state === 'listening' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '20px',
                    border: `1px solid ${state === 'speaking' ? 'rgba(34, 197, 94, 0.5)' : state === 'listening' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`
                }}>
                    {state === 'processing' && <Loader2 size={16} className="animate-spin" style={{ color: '#eab308' }} />}
                    {state === 'listening' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />}
                    {state === 'speaking' && <Volume2 size={16} style={{ color: '#22c55e' }} />}
                    <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 500,
                        color: state === 'speaking' ? '#22c55e' : state === 'listening' ? '#ef4444' : state === 'processing' ? '#eab308' : 'rgba(255,255,255,0.6)'
                    }}>
                        {state === 'idle' && 'Ready'}
                        {state === 'listening' && 'Listening...'}
                        {state === 'processing' && 'AI Processing...'}
                        {state === 'speaking' && 'Teacher Speaking...'}
                    </span>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#f87171', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {/* Main Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
                {/* Left Side */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Visual Demo */}
                    <div style={{ background: 'rgba(10, 15, 15, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🎬</span> Visual Demonstration
                                {useDynamicAnimation && <span style={{ fontSize: '10px', background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>✨ AI Generated</span>}
                            </h2>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => setUseDynamicAnimation(!useDynamicAnimation)} 
                                    style={{ 
                                        padding: '8px 12px', 
                                        background: useDynamicAnimation ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        color: 'white', 
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }} 
                                    title={useDynamicAnimation ? 'Using AI-generated animations' : 'Using predefined animations'}
                                >
                                    <Sparkles size={14} />
                                    {useDynamicAnimation ? 'Dynamic' : 'Predefined'}
                                </button>
                                <button onClick={handleReset} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} title="Reset">
                                    <RotateCcw size={16} />
                                </button>
                                <button onClick={() => setIsMuted(!isMuted)} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: isMuted ? '#ef4444' : 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                            </div>
                        </div>
                        
                        {/* Use Dynamic or Predefined Canvas */}
                        {useDynamicAnimation && animationScene ? (
                            <DynamicVisualCanvas 
                                scene={animationScene} 
                                description={animationScene.description}
                                className="h-[300px]" 
                            />
                        ) : useDynamicAnimation && currentVisual ? (
                            <DynamicVisualCanvas 
                                visualType={currentVisual}
                                description={pipelineStatus}
                                className="h-[300px]" 
                            />
                        ) : (
                            <VisualCanvas animationType={currentVisual || undefined} className="h-[300px]" />
                        )}
                    </div>

                    {/* Conversation */}
                    <div style={{ background: 'rgba(10, 15, 15, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>💬</span> Conversation
                        </h2>

                        <div style={{ flex: 1, minHeight: '180px', maxHeight: '250px', overflowY: 'auto', marginBottom: '16px' }}>
                            {messages.length === 0 && !currentTranscript && !streamingText && (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
                                    <span style={{ fontSize: '48px', marginBottom: '12px' }}>🎤</span>
                                    <p>Click the microphone or choose a topic</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div key={idx} style={{ marginBottom: '12px', padding: '12px 16px', borderRadius: '12px', maxWidth: '85%', marginLeft: msg.role === 'user' ? 'auto' : '0', background: msg.role === 'user' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)' }}>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                                        {msg.role === 'user' ? '👤 You' : '🧑‍🏫 Teacher'}
                                    </div>
                                    <p style={{ color: 'white', lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
                                </div>
                            ))}

                            {currentTranscript && (
                                <div style={{ marginBottom: '12px', padding: '12px 16px', borderRadius: '12px', maxWidth: '85%', marginLeft: 'auto', background: 'rgba(139, 92, 246, 0.3)', border: '2px solid rgba(239, 68, 68, 0.5)' }}>
                                    <div style={{ fontSize: '11px', color: '#f87171', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                                        Listening...
                                    </div>
                                    <p style={{ color: 'white', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>{currentTranscript}</p>
                                </div>
                            )}

                            {streamingText && (
                                <div style={{ marginBottom: '12px', padding: '12px 16px', borderRadius: '12px', maxWidth: '85%', background: 'rgba(255, 255, 255, 0.1)', border: '2px solid rgba(34, 197, 94, 0.5)' }}>
                                    <div style={{ fontSize: '11px', color: '#4ade80', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 1s infinite' }} />
                                        🧑‍🏫 Teacher is explaining...
                                    </div>
                                    <p style={{ color: 'white', lineHeight: 1.5, margin: 0 }}>{streamingText}</p>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Mic Button */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <button onClick={toggleMic} disabled={state === 'processing'} style={{
                                width: '64px', height: '64px', borderRadius: '50%', border: 'none',
                                cursor: state === 'processing' ? 'not-allowed' : 'pointer',
                                background: state === 'listening' ? '#ef4444' : state === 'speaking' ? '#22c55e' : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                                boxShadow: state === 'listening' ? '0 0 30px rgba(239, 68, 68, 0.5)' : state === 'speaking' ? '0 0 30px rgba(34, 197, 94, 0.5)' : '0 0 20px rgba(139, 92, 246, 0.4)',
                                transform: state === 'listening' ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.3s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: state === 'processing' ? 0.5 : 1
                            }}>
                                {state === 'listening' ? <Mic size={28} color="white" /> : state === 'speaking' ? <Square size={24} color="white" /> : <Mic size={28} color="white" />}
                            </button>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                                {state === 'idle' && 'Click to talk'}
                                {state === 'listening' && 'Listening... pause to send'}
                                {state === 'processing' && 'Processing...'}
                                {state === 'speaking' && 'Click to interrupt'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Avatar & Topics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Lip-Sync Avatar */}
                    <div style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
                        backdropFilter: 'blur(16px)',
                        border: state === 'speaking' ? '2px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        padding: '28px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: state === 'speaking' ? '0 0 40px rgba(34, 197, 94, 0.2)' : 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        {/* Title */}
                        <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
                            🎭 AI Teacher
                        </h3>

                        {/* Avatar Container */}
                        <div style={{ position: 'relative', width: '200px', height: '220px' }}>
                            {/* Speaking ring effect */}
                            {state === 'speaking' && (
                                <>
                                    <div style={{ position: 'absolute', top: '-20px', left: '-20px', right: '-20px', bottom: '0', borderRadius: '50%', border: '3px solid rgba(168, 85, 247, 0.4)', animation: 'ringPulse 2s ease-in-out infinite' }} />
                                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', right: '-10px', bottom: '10px', borderRadius: '50%', border: '2px solid rgba(168, 85, 247, 0.6)', animation: 'ringPulse 2s ease-in-out infinite 0.5s' }} />
                                </>
                            )}

                            {/* Realistic Female Teacher Image */}
                            <div style={{ 
                                width: '180px', 
                                height: '180px', 
                                borderRadius: '50%', 
                                margin: '0 auto', 
                                position: 'relative', 
                                boxShadow: state === 'speaking' ? '0 0 30px rgba(168, 85, 247, 0.4)' : '0 10px 40px rgba(0,0,0,0.3)',
                                overflow: 'hidden',
                                border: state === 'speaking' ? '4px solid rgba(168, 85, 247, 0.6)' : '4px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}>
                                {/* Animated Female Teacher SVG Avatar */}
                                <svg viewBox="0 0 200 200" style={{
                                    width: '100%',
                                    height: '100%',
                                    transform: state === 'speaking' ? 'scale(1.02)' : 'scale(1)',
                                    transition: 'transform 0.3s ease'
                                }}>
                                    {/* Background */}
                                    <defs>
                                        <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#667eea" />
                                            <stop offset="100%" stopColor="#764ba2" />
                                        </linearGradient>
                                        <linearGradient id="skinTone" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#fcd5ce" />
                                            <stop offset="100%" stopColor="#f8b4a6" />
                                        </linearGradient>
                                        <linearGradient id="hairColor" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#2c1810" />
                                            <stop offset="100%" stopColor="#1a0f0a" />
                                        </linearGradient>
                                    </defs>
                                    
                                    {/* Hair Back */}
                                    <ellipse cx="100" cy="85" rx="65" ry="55" fill="url(#hairColor)" />
                                    
                                    {/* Neck */}
                                    <rect x="85" y="135" width="30" height="25" fill="url(#skinTone)" rx="10" />
                                    
                                    {/* Shoulders/Body */}
                                    <ellipse cx="100" cy="190" rx="55" ry="35" fill="#a855f7" />
                                    <rect x="45" y="175" width="110" height="30" fill="#a855f7" rx="15" />
                                    
                                    {/* Collar */}
                                    <path d="M75 155 Q100 180 125 155" stroke="white" strokeWidth="3" fill="none" />
                                    
                                    {/* Face */}
                                    <ellipse cx="100" cy="95" rx="48" ry="52" fill="url(#skinTone)" />
                                    
                                    {/* Hair Front */}
                                    <path d="M52 75 Q55 40 100 35 Q145 40 148 75 Q145 55 100 50 Q55 55 52 75" fill="url(#hairColor)" />
                                    <ellipse cx="55" cy="85" rx="8" ry="35" fill="url(#hairColor)" />
                                    <ellipse cx="145" cy="85" rx="8" ry="35" fill="url(#hairColor)" />
                                    
                                    {/* Eyebrows */}
                                    <path d="M70 78 Q80 74 90 78" stroke="#2c1810" strokeWidth="2" fill="none" />
                                    <path d="M110 78 Q120 74 130 78" stroke="#2c1810" strokeWidth="2" fill="none" />
                                    
                                    {/* Eyes */}
                                    <ellipse cx="80" cy="90" rx="10" ry="7" fill="white" />
                                    <ellipse cx="120" cy="90" rx="10" ry="7" fill="white" />
                                    <circle cx="80" cy="90" r="5" fill="#4a3728" />
                                    <circle cx="120" cy="90" r="5" fill="#4a3728" />
                                    <circle cx="80" cy="90" r="2" fill="black" />
                                    <circle cx="120" cy="90" r="2" fill="black" />
                                    <circle cx="78" cy="88" r="1.5" fill="white" />
                                    <circle cx="118" cy="88" r="1.5" fill="white" />
                                    
                                    {/* Nose */}
                                    <path d="M100 95 L97 110 Q100 113 103 110 L100 95" fill="#f0a090" opacity="0.5" />
                                    
                                    {/* Blush */}
                                    <ellipse cx="68" cy="105" rx="8" ry="5" fill="#ffb3b3" opacity="0.4" />
                                    <ellipse cx="132" cy="105" rx="8" ry="5" fill="#ffb3b3" opacity="0.4" />
                                    
                                    {/* Lips/Mouth - Animated */}
                                    {state === 'speaking' ? (
                                        <g>
                                            <ellipse cx="100" cy="125" rx="12" ry={currentMouthShape === 'open' ? 8 : currentMouthShape === 'wide' ? 5 : 3} fill="#e57373">
                                                <animate attributeName="ry" values="5;8;5;3;5" dur="0.3s" repeatCount="indefinite" />
                                            </ellipse>
                                            <path d="M90 125 Q100 120 110 125" fill="none" stroke="#c94c4c" strokeWidth="1">
                                                <animate attributeName="d" values="M90 125 Q100 120 110 125;M90 125 Q100 118 110 125;M90 125 Q100 120 110 125" dur="0.3s" repeatCount="indefinite" />
                                            </path>
                                        </g>
                                    ) : (
                                        <g>
                                            <path d="M90 123 Q100 130 110 123" fill="#e57373" />
                                            <path d="M90 123 Q100 127 110 123" fill="none" stroke="#c94c4c" strokeWidth="1" />
                                        </g>
                                    )}
                                    
                                    {/* Earrings */}
                                    <circle cx="52" cy="100" r="4" fill="#ffd700" />
                                    <circle cx="148" cy="100" r="4" fill="#ffd700" />
                                    
                                    {/* Glasses (optional - professional look) */}
                                    <circle cx="80" cy="90" r="14" fill="none" stroke="#333" strokeWidth="2" />
                                    <circle cx="120" cy="90" r="14" fill="none" stroke="#333" strokeWidth="2" />
                                    <path d="M94 90 L106 90" stroke="#333" strokeWidth="2" />
                                    <path d="M66 90 L52 85" stroke="#333" strokeWidth="2" />
                                    <path d="M134 90 L148 85" stroke="#333" strokeWidth="2" />
                                </svg>
                                
                                {/* Speaking animation overlay */}
                                {state === 'speaking' && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '40%',
                                        background: 'linear-gradient(to top, rgba(168, 85, 247, 0.15), transparent)',
                                        pointerEvents: 'none'
                                    }} />
                                )}
                            </div>
                            
                            {/* Sound wave indicator when speaking */}
                            {state === 'speaking' && (
                                <div style={{ 
                                    position: 'absolute', 
                                    bottom: '30px', 
                                    left: '50%', 
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: '3px',
                                    alignItems: 'center'
                                }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div 
                                            key={i}
                                            style={{
                                                width: '4px',
                                                height: `${10 + Math.random() * 15}px`,
                                                background: '#a855f7',
                                                borderRadius: '2px',
                                                animation: `soundWave 0.5s ease-in-out infinite ${i * 0.1}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Name & Status */}
                        <div style={{ marginTop: '16px', padding: '10px 24px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: '25px', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)' }}>
                            <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: 0, textAlign: 'center' }}>
                                Prof. Priya (AI Teacher)
                            </p>
                        </div>

                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: state === 'speaking' ? '#22c55e' : state === 'listening' ? '#ef4444' : state === 'processing' ? '#eab308' : '#6b7280',
                                boxShadow: state === 'speaking' ? '0 0 12px #22c55e' : state === 'listening' ? '0 0 12px #ef4444' : 'none',
                                animation: (state === 'speaking' || state === 'listening') ? 'statusBlink 1s ease-in-out infinite' : 'none'
                            }} />
                            <span style={{ color: state === 'speaking' ? '#22c55e' : state === 'listening' ? '#ef4444' : 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500 }}>
                                {state === 'idle' && 'Ready to teach'}
                                {state === 'listening' && 'Listening...'}
                                {state === 'processing' && 'Preparing...'}
                                {state === 'speaking' && 'Teaching...'}
                            </span>
                        </div>

                        {/* Audio Visualizer */}
                        {state === 'speaking' && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '16px', alignItems: 'flex-end', height: '32px' }}>
                                {[1,2,3,4,5,6,7,8,9,10,11].map((i) => (
                                    <div key={i} style={{
                                        width: '5px',
                                        background: 'linear-gradient(180deg, #22c55e, #16a34a)',
                                        borderRadius: '3px',
                                        animation: `audioWave 0.4s ease-in-out infinite`,
                                        animationDelay: `${i * 0.04}s`
                                    }} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Topics */}
                    <div style={{ background: 'rgba(10, 15, 15, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
                            ⚡ Quick Topics
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {quickTopics.map((topic, idx) => (
                                <button key={idx} onClick={() => {
                                    setMessages(prev => [...prev, { role: 'user', text: topic.question, timestamp: new Date() }]);
                                    processWithPipeline(topic.question);
                                }} disabled={state !== 'idle'} style={{
                                    padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', cursor: state !== 'idle' ? 'not-allowed' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s ease', opacity: state !== 'idle' ? 0.5 : 1
                                }} onMouseEnter={(e) => { if (state === 'idle') { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'; e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'; } }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}>
                                    <span style={{ fontSize: '16px' }}>{idx === 0 ? '🍎' : idx === 1 ? '🕰️' : idx === 2 ? '🔊' : '🔧'}</span>
                                    {topic.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                @keyframes ringPulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.05); opacity: 0.3; } }
                @keyframes eyeLook { 0%, 100% { transform: translateX(-50%); } 30% { transform: translateX(-30%); } 70% { transform: translateX(-70%); } }
                @keyframes statusBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                @keyframes audioWave { 0%, 100% { height: 8px; } 50% { height: 28px; } }
            `}</style>
        </div>
    );
}
