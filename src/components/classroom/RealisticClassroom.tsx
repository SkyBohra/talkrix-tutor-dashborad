'use client';

/**
 * AI Teacher Classroom - Professional Design
 * 
 * Premium classroom experience with:
 * - Dark green/teal theme matching Talkrix brand
 * - Glass morphism effects
 * - Professional teacher avatar with animations
 * - Interactive digital whiteboard
 * - Real-time voice interaction with LiveKit
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  useRoomContext,
  useConnectionState,
  useTracks,
  AgentState,
} from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind, ConnectionState as LKConnectionState, RemoteParticipant, Encryption_Type, Track } from 'livekit-client';
import {
  getLiveKitToken,
  createRoomName,
  LIVEKIT_CONFIG,
} from '@/lib/livekit-config';

// ============================================
// ICONS COMPONENT
// ============================================

const Icons = {
  Mic: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  MicOff: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ),
  Volume: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  ),
  Send: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Exit: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Eraser: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
};

// ============================================
// PROFESSIONAL TEACHER AVATAR
// ============================================

interface TeacherAvatarProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  audioLevel?: number;
}

function TeacherAvatar({ state, audioLevel = 0 }: TeacherAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [breatheOffset, setBreatheOffset] = useState(0);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const breatheInterval = setInterval(() => {
      setBreatheOffset(prev => (prev + 0.08) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(breatheInterval);
  }, []);

  const breatheY = Math.sin(breatheOffset) * 1.5;
  const mouthOpen = state === 'speaking' ? 6 + audioLevel * 12 : 2;

  return (
    <div className="relative" style={{ transform: `translateY(${breatheY}px)` }}>
      <svg width="180" height="220" viewBox="0 0 180 220" className="drop-shadow-xl">
        {/* Body */}
        <ellipse cx="90" cy="200" rx="55" ry="25" fill="url(#bodyGrad)" />
        <path d="M 45 130 Q 35 170 40 200 L 140 200 Q 145 170 135 130 Z" fill="url(#suitGrad)" />
        
        {/* Collar & Tie */}
        <path d="M 70 130 L 80 155 L 90 148 L 100 155 L 110 130" fill="#e8f4f0" stroke="#d0e8e0" strokeWidth="1" />
        <path d="M 85 148 L 82 195 L 90 200 L 98 195 L 95 148 Z" fill="url(#tieGrad)" />
        
        {/* Head */}
        <ellipse cx="90" cy="85" rx="42" ry="48" fill="url(#skinGrad)" />
        
        {/* Hair */}
        <path d="M 50 65 Q 45 35 70 30 Q 90 25 110 30 Q 135 35 130 65 Q 120 45 90 42 Q 60 45 50 65" fill="#1a2e2a" />
        
        {/* Glasses */}
        <g opacity="0.9">
          <rect x="55" y="72" width="28" height="20" rx="4" fill="none" stroke="#2d4a44" strokeWidth="2.5" />
          <rect x="97" y="72" width="28" height="20" rx="4" fill="none" stroke="#2d4a44" strokeWidth="2.5" />
          <line x1="83" y1="82" x2="97" y2="82" stroke="#2d4a44" strokeWidth="2" />
          <ellipse cx="69" cy="80" rx="10" ry="6" fill="rgba(255,255,255,0.1)" />
          <ellipse cx="111" cy="80" rx="10" ry="6" fill="rgba(255,255,255,0.1)" />
        </g>
        
        {/* Eyes */}
        <g>
          <ellipse cx="69" cy="82" rx="5" ry={isBlinking ? 1 : 5} fill="#1a2e2a" style={{ transition: 'ry 0.1s' }} />
          <ellipse cx="111" cy="82" rx="5" ry={isBlinking ? 1 : 5} fill="#1a2e2a" style={{ transition: 'ry 0.1s' }} />
          {!isBlinking && (
            <>
              <circle cx="67" cy="80" r="2" fill="white" opacity="0.7" />
              <circle cx="109" cy="80" r="2" fill="white" opacity="0.7" />
            </>
          )}
        </g>
        
        {/* Eyebrows */}
        <path d="M 58 68 Q 69 65 80 70" stroke="#1a2e2a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 100 70 Q 111 65 122 68" stroke="#1a2e2a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        
        {/* Nose */}
        <path d="M 90 88 Q 95 98 90 105" stroke="#c9a07a" strokeWidth="2" fill="none" />
        
        {/* Mouth */}
        {state === 'speaking' ? (
          <ellipse cx="90" cy="118" rx="10" ry={mouthOpen} fill="#8b4557" stroke="#6d3344" strokeWidth="1">
            <animate attributeName="ry" values={`${mouthOpen};${mouthOpen * 0.6};${mouthOpen}`} dur="0.2s" repeatCount="indefinite" />
          </ellipse>
        ) : (
          <path d="M 80 116 Q 90 122 100 116" stroke="#c9a07a" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        
        {/* Cheeks (when speaking) */}
        {state === 'speaking' && (
          <>
            <ellipse cx="55" cy="100" rx="8" ry="5" fill="#e8b8a8" opacity="0.4" />
            <ellipse cx="125" cy="100" rx="8" ry="5" fill="#e8b8a8" opacity="0.4" />
          </>
        )}
        
        {/* Gradients */}
        <defs>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f3d38" />
            <stop offset="50%" stopColor="#2a524b" />
            <stop offset="100%" stopColor="#1a3530" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a3530" />
            <stop offset="100%" stopColor="#0f1f1c" />
          </linearGradient>
          <linearGradient id="tieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8c9a0" />
            <stop offset="100%" stopColor="#d4a574" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Glow effect when speaking */}
      {state === 'speaking' && (
        <div className="absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse" 
          style={{ background: 'radial-gradient(circle, hsl(160,90%,45%) 0%, transparent 70%)' }} 
        />
      )}
    </div>
  );
}

// ============================================
// DIGITAL WHITEBOARD
// ============================================

interface WhiteboardProps {
  content: string;
  title?: string;
  equations?: string[];
  isWriting?: boolean;
}

function DigitalWhiteboard({ content, title, equations = [], isWriting }: WhiteboardProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [displayedEquations, setDisplayedEquations] = useState<string[]>([]);

  useEffect(() => {
    if (!content) { setDisplayedContent(''); return; }
    let i = 0;
    setDisplayedContent('');
    const interval = setInterval(() => {
      if (i < content.length) { setDisplayedContent(content.slice(0, i + 1)); i++; }
      else clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [content]);

  useEffect(() => {
    if (!equations.length) { setDisplayedEquations([]); return; }
    setDisplayedEquations([]);
    equations.forEach((eq, idx) => {
      setTimeout(() => setDisplayedEquations(prev => [...prev, eq]), idx * 300);
    });
  }, [equations]);

  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden" style={{ 
      background: 'linear-gradient(145deg, rgba(10,20,18,0.95) 0%, rgba(15,30,25,0.9) 100%)',
      border: '1px solid rgba(34,197,94,0.15)',
      boxShadow: '0 0 40px rgba(34,197,94,0.05), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      {/* Board Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-white/40 text-sm font-medium">Digital Whiteboard</span>
        </div>
        {isWriting && (
          <div className="flex items-center gap-2 text-green-400 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Writing...
          </div>
        )}
      </div>

      {/* Board Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              {title}
            </h2>
            <div className="h-0.5 w-24 mt-2 rounded-full bg-gradient-to-r from-green-500 to-transparent" />
          </div>
        )}

        {content ? (
          <div className="space-y-4">
            <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
              {displayedContent}
              {isWriting && displayedContent.length < content.length && (
                <span className="inline-block w-0.5 h-5 ml-1 bg-green-400 animate-pulse" />
              )}
            </p>

            {displayedEquations.length > 0 && (
              <div className="mt-8 space-y-3">
                {displayedEquations.map((eq, i) => (
                  <div key={i} className="inline-block px-6 py-3 rounded-xl text-xl font-mono text-green-300"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(16,185,129,0.05) 100%)',
                      border: '1px solid rgba(34,197,94,0.2)'
                    }}>
                    {eq}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="text-4xl">✏️</span>
            </div>
            <p className="text-white/50 text-lg">Ask a question to start learning</p>
            <p className="text-white/30 text-sm mt-1">I'll write explanations on this board</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// VOICE STATUS BAR
// ============================================

function VoiceStatusBar({ state, audioTrack }: { state: AgentState; audioTrack: any }) {
  const config: Record<string, { bg: string; border: string; text: string; label: string; icon: string }> = {
    idle: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', text: '#94a3b8', label: 'Ready to listen', icon: '💬' },
    listening: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#4ade80', label: 'Listening...', icon: '🎤' },
    thinking: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.3)', text: '#facc15', label: 'Thinking...', icon: '🤔' },
    speaking: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#4ade80', label: 'Speaking...', icon: '🔊' },
  };
  const c = config[state] || config.idle;

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{c.icon}</span>
        <span className="text-sm font-medium" style={{ color: c.text }}>{c.label}</span>
      </div>
      {audioTrack && (
        <div className="flex-1 max-w-[200px]">
          <BarVisualizer state={state} barCount={12} trackRef={audioTrack} className="h-8" />
        </div>
      )}
    </div>
  );
}

// ============================================
// CHAT MESSAGE
// ============================================

function ChatMessage({ role, text, time }: { role: 'user' | 'teacher'; text: string; time: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser 
        ? 'bg-gradient-to-br from-green-600 to-green-700 text-white rounded-br-md' 
        : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-md'}`}>
        <p className="text-sm leading-relaxed">{text}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-green-200/70' : 'text-white/30'}`}>{time}</p>
      </div>
    </div>
  );
}

// ============================================
// STUDENT SESSION DATA
// ============================================

interface StudentSession {
  name: string;
  subject: string;
  classLevel: string;
  topic: string;
  learningGoal: string;
}

// ============================================
// PROFESSIONAL CLASSROOM UI
// ============================================

function ProfessionalClassroom({ session, onLeave }: { session: StudentSession; onLeave: () => void }) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { state, audioTrack } = useVoiceAssistant();
  const tracks = useTracks([Track.Source.Microphone]);

  const [boardContent, setBoardContent] = useState('');
  const [boardTitle, setBoardTitle] = useState('');
  const [equations, setEquations] = useState<string[]>([]);
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [messages, setMessages] = useState<{ role: 'user' | 'teacher'; text: string; time: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentTimeout, setAgentTimeout] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('🎵 Tracks:', tracks.length);
  }, [tracks]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    setBoardTitle(`Welcome, ${session.name}! 🎓`);
    let content = `I'm your AI ${session.subject} teacher.\n\n`;
    if (session.topic) content += `Today we'll explore: "${session.topic}"\n\n`;
    content += `🎤 Speak naturally to ask questions\n💬 Or type in the chat below\n\nI'm here to help you understand any concept!`;
    setBoardContent(content);
  }, [session]);

  // Avatar state sync
  useEffect(() => {
    setAvatarState(state as any);
  }, [state]);

  // Monitor agent
  useEffect(() => {
    if (!room) return;
    const check = () => {
      const connected = room.remoteParticipants.size > 0;
      setAgentConnected(connected);
      if (connected) {
        setAgentTimeout(false);
      }
    };
    check();
    room.on(RoomEvent.ParticipantConnected, check);
    room.on(RoomEvent.ParticipantDisconnected, check);
    return () => {
      room.off(RoomEvent.ParticipantConnected, check);
      room.off(RoomEvent.ParticipantDisconnected, check);
    };
  }, [room]);

  // Agent connection timeout - show message if agent doesn't connect in 15 seconds
  useEffect(() => {
    if (agentConnected || connectionState !== LKConnectionState.Connected) {
      return;
    }
    const timeout = setTimeout(() => {
      if (!agentConnected) {
        setAgentTimeout(true);
      }
    }, 15000);
    return () => clearTimeout(timeout);
  }, [agentConnected, connectionState]);

  // Handle data
  useEffect(() => {
    if (!room) return;
    const handleData = (payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data.type === 'board' || data.type === 'board_content') {
          setBoardContent(data.content || '');
          setBoardTitle(data.title || '');
          if (data.equations) setEquations(data.equations);
        } else if (data.type === 'message' || data.type === 'transcript') {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setMessages(prev => [...prev, { role: data.role, text: data.text, time }]);
        } else if (data.type === 'avatar_state') {
          setAvatarState(data.state);
        }
      } catch (e) { console.error('Data parse error:', e); }
    };
    room.on(RoomEvent.DataReceived, handleData);
    return () => { room.off(RoomEvent.DataReceived, handleData); };
  }, [room]);

  // Audio level
  useEffect(() => {
    if (!audioTrack) return;
    const interval = setInterval(() => {
      setAudioLevel(state === 'speaking' ? 0.3 + Math.random() * 0.5 : 0);
    }, 50);
    return () => clearInterval(interval);
  }, [audioTrack, state]);

  const sendMessage = () => {
    if (!userInput.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: userInput, time }]);
    setUserInput('');
  };

  // Loading state
  if (connectionState === LKConnectionState.Connecting) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'hsl(180,50%,3%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg font-medium">Entering classroom...</p>
          <p className="text-white/50 text-sm mt-1">Connecting to AI teacher</p>
        </div>
      </div>
    );
  }

  // Disconnected state
  if (connectionState === LKConnectionState.Disconnected) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'hsl(180,50%,3%)' }}>
        <div className="text-center max-w-md p-8 rounded-2xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="text-5xl mb-4">📴</div>
          <p className="text-red-400 text-xl font-semibold mb-2">Connection Lost</p>
          <p className="text-white/50 text-sm mb-6">Make sure the AI agent is running</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl font-medium text-white"
            style={{ background: 'linear-gradient(135deg, hsl(160,90%,45%), hsl(180,85%,40%))' }}>
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  // Waiting for agent state - show helpful message when agent takes too long
  if (!agentConnected && agentTimeout && connectionState === LKConnectionState.Connected) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'hsl(180,50%,3%)' }}>
        <div className="text-center max-w-md p-8 rounded-2xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="text-5xl mb-4">🎓</div>
          <p className="text-blue-400 text-xl font-semibold mb-2">Room Connected</p>
          <p className="text-white/50 text-sm mb-4">Waiting for AI Teacher to join...</p>
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-xs mb-6">
            Make sure the AI Teacher agent is running.<br/>
            Run: <code className="bg-white/10 px-2 py-1 rounded">uv run agent.py dev</code>
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl font-medium text-white"
              style={{ background: 'linear-gradient(135deg, hsl(160,90%,45%), hsl(180,85%,40%))' }}>
              Retry
            </button>
            <button onClick={onLeave} className="px-6 py-3 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-colors">
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'hsl(180,50%,3%)' }}>
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 h-16 px-6 flex items-center justify-between border-b border-white/5"
        style={{ background: 'rgba(10,20,18,0.8)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, hsl(160,90%,45%), hsl(180,85%,40%))' }}>
            🎓
          </div>
          <div>
            <h1 className="text-white font-semibold">{session.subject} Class</h1>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>{session.name}</span>
              <span>•</span>
              <span>{session.classLevel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
            ${agentConnected 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : connectionState === LKConnectionState.Connected 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${agentConnected ? 'bg-green-400' : connectionState === LKConnectionState.Connected ? 'bg-blue-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`} />
            {agentConnected ? 'Teacher Online' : connectionState === LKConnectionState.Connected ? 'Waiting for Teacher...' : 'Connecting...'}
          </div>

          {/* Mute Button */}
          <button onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-lg transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
            {isMuted ? <Icons.MicOff /> : <Icons.Mic />}
          </button>

          {/* Leave Button */}
          <button onClick={onLeave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium">
            <Icons.Exit />
            Leave
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Teacher */}
        <aside className="w-80 flex-shrink-0 p-5 flex flex-col gap-5 border-r border-white/5">
          {/* Teacher Card */}
          <div className="rounded-2xl p-6 text-center" style={{ 
            background: 'linear-gradient(145deg, rgba(15,30,25,0.9) 0%, rgba(10,20,18,0.95) 100%)',
            border: '1px solid rgba(34,197,94,0.1)'
          }}>
            <TeacherAvatar state={avatarState} audioLevel={audioLevel} />
            <h3 className="text-white font-semibold mt-3">Professor Ada</h3>
            <p className="text-white/40 text-xs mt-0.5">AI {session.subject} Teacher</p>
            <div className="mt-4">
              <VoiceStatusBar state={avatarState} audioTrack={audioTrack} />
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="rounded-2xl p-4" style={{ 
            background: 'rgba(15,30,25,0.6)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h4 className="text-white/50 text-xs uppercase tracking-wider mb-3">Quick Prompts</h4>
            <div className="space-y-2">
              {[
                { icon: '🔄', text: 'Explain that again' },
                { icon: '💡', text: 'Give me an example' },
                { icon: '📐', text: 'Show the formula' },
                { icon: '❓', text: 'I have a question' },
              ].map((item, i) => (
                <button key={i} onClick={() => setUserInput(item.text)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left
                    bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-green-500/20
                    text-white/60 hover:text-green-400 transition-all">
                  <span>{item.icon}</span>
                  {item.text}
                </button>
              ))}
            </div>
          </div>

          <RoomAudioRenderer />
        </aside>

        {/* Center - Whiteboard */}
        <main className="flex-1 p-5">
          <DigitalWhiteboard 
            content={boardContent}
            title={boardTitle}
            equations={equations}
            isWriting={state === 'speaking'}
          />
        </main>

        {/* Right Panel - Chat */}
        <aside className="w-96 flex-shrink-0 flex flex-col border-l border-white/5"
          style={{ background: 'rgba(10,20,18,0.5)' }}>
          {/* Chat Header */}
          <div className="flex-shrink-0 h-14 px-5 flex items-center border-b border-white/5">
            <h3 className="text-white font-medium">💬 Conversation</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <span className="text-2xl">🎤</span>
                </div>
                <p className="text-white/50 text-sm">Start speaking or type below</p>
                <p className="text-white/30 text-xs mt-1">Your AI teacher is listening</p>
              </div>
            ) : (
              messages.map((msg, i) => <ChatMessage key={i} {...msg} />)
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your question..."
                className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-white/30
                  bg-white/5 border border-white/10 focus:border-green-500/30 focus:outline-none focus:ring-1 focus:ring-green-500/20"
              />
              <button onClick={sendMessage} disabled={!userInput.trim()}
                className="px-4 py-3 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: 'linear-gradient(135deg, hsl(160,90%,45%), hsl(180,85%,40%))' }}>
                <Icons.Send />
              </button>
            </div>
            <p className="text-white/30 text-[10px] text-center mt-2">💡 Tip: Just speak naturally!</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================
// JOIN SCREEN (Keeping your existing design)
// ============================================

interface RealisticClassroomProps {
  subject?: string;
  studentName?: string;
  gradeLevel?: string;
}

export default function RealisticClassroom({
  subject = 'Physics',
  studentName = '',
  gradeLevel = '10th Grade',
}: RealisticClassroomProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const [session, setSession] = useState<StudentSession>({
    name: studentName,
    subject: subject,
    classLevel: gradeLevel,
    topic: '',
    learningGoal: '',
  });

  const updateSession = (field: keyof StudentSession, value: string) => {
    setSession(prev => ({ ...prev, [field]: value }));
  };

  const joinClassroom = useCallback(async () => {
    if (!session.name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const room = createRoomName(session.subject);
      console.log('🎓 Joining:', room);

      const newToken = await getLiveKitToken(room, session.name, {
        subject: session.subject,
        grade_level: session.classLevel,
        topic: session.topic,
        learning_goal: session.learningGoal,
        student_name: session.name,
      });

      console.log('🎫 Token received');
      setToken(newToken);
    } catch (e) {
      console.error('❌ Join error:', e);
      setError(e instanceof Error ? e.message : 'Failed to join classroom');
    } finally {
      setIsJoining(false);
    }
  }, [session]);

  const leaveClassroom = useCallback(() => {
    setToken(null);
  }, []);

  // Join Screen - Login/Signup Style Card
  if (!token) {
    return (
      <div className="h-full min-h-[600px] flex items-center justify-center" style={{ background: 'hsl(180,50%,3%)' }}>
        {/* Background Effects - Same as Classroom */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
          {/* Glow Effects */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]" 
            style={{ background: 'rgba(34,197,94,0.08)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]" 
            style={{ background: 'rgba(16,185,129,0.06)' }} />
        </div>

        {/* Centered Login Card - Same style as Login/Signup */}
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="rounded-3xl p-8" style={{ 
            background: 'white',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)'
          }}>
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ 
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 12px 40px rgba(34, 197, 94, 0.3)'
                }}>
                <span className="text-2xl">🎓</span>
              </div>
              <h2 style={{ color: '#16a34a', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Join Classroom
              </h2>
            </div>

            {/* Form - Login Style */}
            <form onSubmit={(e) => { e.preventDefault(); joinClassroom(); }}>
              {/* Name Input */}
              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: '#86efac' }}>👤</span>
                <input 
                  type="text" 
                  value={session.name} 
                  onChange={(e) => updateSession('name', e.target.value)}
                  placeholder="Your name" 
                  required
                  style={{ 
                    paddingLeft: '50px', 
                    height: '52px', 
                    borderRadius: '26px', 
                    backgroundColor: '#f0fdf4', 
                    border: 'none', 
                    width: '100%',
                    fontSize: '15px',
                    color: '#1f2937',
                    outline: 'none'
                  }} 
                />
              </div>

              {/* Grade Select */}
              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: '#86efac', zIndex: 1 }}>🏫</span>
                <select 
                  value={session.classLevel} 
                  onChange={(e) => updateSession('classLevel', e.target.value)}
                  style={{ 
                    paddingLeft: '50px', 
                    paddingRight: '40px',
                    height: '52px', 
                    borderRadius: '26px', 
                    backgroundColor: '#f0fdf4', 
                    border: 'none', 
                    width: '100%',
                    fontSize: '15px',
                    color: '#1f2937',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2322c55e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'right 16px center', 
                    backgroundSize: '20px' 
                  }}>
                  {['6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'Undergraduate'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Subject Select */}
              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: '#86efac', zIndex: 1 }}>📚</span>
                <select 
                  value={session.subject} 
                  onChange={(e) => updateSession('subject', e.target.value)}
                  style={{ 
                    paddingLeft: '50px', 
                    paddingRight: '40px',
                    height: '52px', 
                    borderRadius: '26px', 
                    backgroundColor: '#f0fdf4', 
                    border: 'none', 
                    width: '100%',
                    fontSize: '15px',
                    color: '#1f2937',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2322c55e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'right 16px center', 
                    backgroundSize: '20px' 
                  }}>
                  {['Physics', 'Mathematics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Topic Input */}
              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: '#86efac' }}>🎯</span>
                <input 
                  type="text" 
                  value={session.topic} 
                  onChange={(e) => updateSession('topic', e.target.value)}
                  placeholder="Topic (optional)"
                  style={{ 
                    paddingLeft: '50px', 
                    height: '52px', 
                    borderRadius: '26px', 
                    backgroundColor: '#f0fdf4', 
                    border: 'none', 
                    width: '100%',
                    fontSize: '15px',
                    color: '#1f2937',
                    outline: 'none'
                  }} 
                />
              </div>

              {/* Error Message */}
              {error && (
                <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '18px', fontSize: '14px' }}>{error}</p>
              )}

              {/* Submit Button - Same as Login */}
              <div style={{ textAlign: 'center' }}>
                <button 
                  type="submit" 
                  disabled={isJoining || !session.name.trim()}
                  style={{ 
                    width: '160px', 
                    height: '48px', 
                    borderRadius: '24px', 
                    background: isJoining || !session.name.trim() 
                      ? 'rgba(100,116,139,0.3)' 
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                    color: 'white', 
                    fontWeight: 600, 
                    fontSize: '14px', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: 'none', 
                    cursor: isJoining || !session.name.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: isJoining || !session.name.trim() 
                      ? 'none' 
                      : '0 8px 25px rgba(34, 197, 94, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                  {isJoining ? (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    'Join Class'
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#6b7280' }}>
              🎤 Speak naturally with your AI teacher
            </p>
          </div>

          {/* Features Below Card */}
          <div className="flex justify-center gap-8 mt-8">
            {[
              { icon: '🎤', label: 'Voice Chat' },
              { icon: '📝', label: 'Live Board' },
              { icon: '💡', label: 'Examples' },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-white/40 text-xs">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Classroom View
  return (
    <div className="h-full">
      <LiveKitRoom
        token={token}
        serverUrl={LIVEKIT_CONFIG.serverUrl}
        connect={true}
        audio={true}
        video={false}
        onConnected={() => console.log('✅ Connected!')}
        onDisconnected={(reason) => console.log('❌ Disconnected:', reason)}
        onError={(error) => console.error('🔴 Error:', error)}
      >
        <ProfessionalClassroom session={session} onLeave={leaveClassroom} />
      </LiveKitRoom>
    </div>
  );
}
