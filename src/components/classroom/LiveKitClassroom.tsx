'use client';

/**
 * LiveKit AI Teacher Classroom
 * 
 * Real-time classroom experience with:
 * - Live AI teacher speaking with avatar
 * - Natural voice conversation
 * - Visual teaching aids (animations, diagrams, equations)
 * - Interactive quizzes
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  useDataChannel,
  useRoomContext,
  useConnectionState,
} from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind, ConnectionState as LKConnectionState, RemoteParticipant, Encryption_Type } from 'livekit-client';
import {
  getLiveKitToken,
  createRoomName,
  parseVisualData,
  LIVEKIT_CONFIG,
  type VisualData,
  type AnimationData,
  type EquationData,
  type QuizData,
  type AvatarState,
} from '@/lib/livekit-config';

// ============================================
// AVATAR COMPONENT - Shows the live teacher
// ============================================

interface TeacherAvatarProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  audioLevel?: number;
}

function TeacherAvatar({ state, audioLevel = 0 }: TeacherAvatarProps) {
  // Mouth animation based on audio level
  const mouthOpenness = useMemo(() => {
    if (state !== 'speaking') return 0;
    return Math.min(audioLevel * 2, 1);
  }, [state, audioLevel]);

  // Eye blink animation
  const [isBlinking, setIsBlinking] = useState(false);
  
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    
    return () => clearInterval(blinkInterval);
  }, []);

  // State colors
  const stateColors = {
    idle: 'from-indigo-500 to-purple-600',
    listening: 'from-green-500 to-emerald-600',
    thinking: 'from-yellow-500 to-orange-600',
    speaking: 'from-blue-500 to-indigo-600',
  };

  const stateLabels = {
    idle: '💤 Ready',
    listening: '👂 Listening...',
    thinking: '🤔 Thinking...',
    speaking: '🎤 Teaching...',
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Avatar Container */}
      <div 
        className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${stateColors[state]} 
                    shadow-2xl transition-all duration-300
                    ${state === 'speaking' ? 'animate-pulse-slow scale-105' : ''}`}
      >
        {/* Face */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center">
          {/* Eyes */}
          <div className="absolute top-16 flex gap-12">
            {/* Left Eye */}
            <div className={`w-6 h-${isBlinking ? '1' : '6'} bg-gray-800 rounded-full transition-all duration-100`}>
              {!isBlinking && state === 'listening' && (
                <div className="w-2 h-2 bg-white rounded-full ml-1 mt-1" />
              )}
            </div>
            {/* Right Eye */}
            <div className={`w-6 h-${isBlinking ? '1' : '6'} bg-gray-800 rounded-full transition-all duration-100`}>
              {!isBlinking && state === 'listening' && (
                <div className="w-2 h-2 bg-white rounded-full ml-1 mt-1" />
              )}
            </div>
          </div>

          {/* Eyebrows - show expression */}
          <div className="absolute top-10 flex gap-12">
            <div className={`w-8 h-1 bg-gray-700 rounded-full transform 
              ${state === 'thinking' ? '-rotate-12' : ''} 
              ${state === 'speaking' ? 'rotate-6' : ''}`} 
            />
            <div className={`w-8 h-1 bg-gray-700 rounded-full transform 
              ${state === 'thinking' ? 'rotate-12' : ''} 
              ${state === 'speaking' ? '-rotate-6' : ''}`} 
            />
          </div>

          {/* Mouth - animated when speaking */}
          <div 
            className="absolute bottom-16 w-12 bg-red-400 rounded-full transition-all duration-75"
            style={{ 
              height: state === 'speaking' ? `${12 + mouthOpenness * 20}px` : '8px',
              borderRadius: state === 'speaking' && mouthOpenness > 0.3 ? '50%' : '999px'
            }}
          >
            {state === 'speaking' && mouthOpenness > 0.5 && (
              <div className="absolute inset-x-2 top-2 bottom-2 bg-red-600 rounded-full" />
            )}
          </div>

          {/* Cheeks - show happiness when speaking */}
          {state === 'speaking' && (
            <>
              <div className="absolute bottom-20 left-8 w-6 h-4 bg-pink-300 rounded-full opacity-60" />
              <div className="absolute bottom-20 right-8 w-6 h-4 bg-pink-300 rounded-full opacity-60" />
            </>
          )}
        </div>

        {/* Hair/Hat */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-48 h-16 bg-gray-800 rounded-t-full" />
        
        {/* Glasses */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex gap-6">
          <div className="w-10 h-8 border-2 border-gray-600 rounded-lg bg-white/20" />
          <div className="w-10 h-8 border-2 border-gray-600 rounded-lg bg-white/20" />
        </div>
      </div>

      {/* State Label */}
      <div className={`mt-4 px-4 py-2 rounded-full text-white font-medium
                      bg-gradient-to-r ${stateColors[state]}`}>
        {stateLabels[state]}
      </div>

      {/* Sound waves when speaking */}
      {state === 'speaking' && (
        <div className="absolute -inset-8 flex items-center justify-center pointer-events-none">
          <div className="absolute w-80 h-80 border-2 border-blue-400/30 rounded-full animate-ping" />
          <div className="absolute w-72 h-72 border-2 border-blue-400/20 rounded-full animate-ping animation-delay-200" />
        </div>
      )}
    </div>
  );
}

// ============================================
// VISUAL DISPLAY - Shows teaching visuals
// ============================================

interface VisualDisplayProps {
  visual: VisualData | null;
}

function VisualDisplay({ visual }: VisualDisplayProps) {
  if (!visual) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 bg-gray-900/50 rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-2">📚</div>
          <p>Visual aids will appear here</p>
        </div>
      </div>
    );
  }

  // Render based on visual type
  switch (visual.type) {
    case 'animation':
      return <AnimationVisual data={visual as AnimationData} />;
    case 'equation':
      return <EquationVisual data={visual as EquationData} />;
    case 'quiz':
      return <QuizVisual data={visual as QuizData} />;
    case 'diagram':
      return <DiagramVisual data={visual} />;
    default:
      return <GenericVisual data={visual} />;
  }
}

function AnimationVisual({ data }: { data: AnimationData }) {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % data.frames);
    }, (data.duration * 1000) / data.frames / (data.speed || 1));
    
    return () => clearInterval(interval);
  }, [data]);

  // Simple animation visualization
  const progress = frame / data.frames;

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">{data.name}</h3>
      
      {/* Animation canvas */}
      <div className="relative w-64 h-64 bg-black/30 rounded-lg overflow-hidden">
        {data.name.includes('Falling') && (
          <div 
            className="absolute left-1/2 w-8 h-8 bg-red-500 rounded-full transform -translate-x-1/2 transition-transform"
            style={{ top: `${progress * 80}%` }}
          />
        )}
        {data.name.includes('Pendulum') && (
          <div className="absolute top-4 left-1/2 w-1 h-32 bg-white origin-top"
               style={{ transform: `rotate(${Math.sin(progress * Math.PI * 4) * 45}deg)` }}>
            <div className="absolute bottom-0 left-1/2 w-8 h-8 bg-yellow-500 rounded-full -translate-x-1/2 translate-y-4" />
          </div>
        )}
        {data.name.includes('Wave') && (
          <svg className="absolute inset-0 w-full h-full">
            <path
              d={`M 0 128 ${Array.from({length: 50}, (_, i) => 
                `L ${i * 6} ${128 + Math.sin((i + progress * 50) * 0.3) * 40}`
              ).join(' ')}`}
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
            />
          </svg>
        )}
        {/* Default animation */}
        {!['Falling', 'Pendulum', 'Wave'].some(t => data.name.includes(t)) && (
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <p className="text-gray-300 mt-4 text-center">{data.description}</p>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full mt-4">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function EquationVisual({ data }: { data: EquationData }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-900 to-emerald-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">{data.name}</h3>
      
      {/* Equation display */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 my-4">
        <p className="text-4xl font-mono text-white tracking-wider">
          {data.equation}
        </p>
      </div>

      {data.explanation && (
        <p className="text-green-100 text-center max-w-md">{data.explanation}</p>
      )}
    </div>
  );
}

function QuizVisual({ data }: { data: QuizData }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-900 to-indigo-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">🎯 Quick Quiz</h3>
      
      <p className="text-white text-lg mb-6">{data.question}</p>
      
      <div className="space-y-3 flex-1">
        {data.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelected(option);
              setTimeout(() => setShowAnswer(true), 500);
            }}
            className={`w-full p-4 rounded-lg text-left transition-all
              ${selected === option 
                ? showAnswer 
                  ? option.startsWith(data.correct_answer) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showAnswer && (
        <div className={`mt-4 p-4 rounded-lg ${selected?.startsWith(data.correct_answer) ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <p className="text-white">
            {selected?.startsWith(data.correct_answer) 
              ? '✅ Correct! Great job!' 
              : `❌ The correct answer is ${data.correct_answer}`}
          </p>
        </div>
      )}

      {data.hint && !showAnswer && (
        <p className="text-purple-200 text-sm mt-4">💡 Hint: {data.hint}</p>
      )}
    </div>
  );
}

function DiagramVisual({ data }: { data: VisualData }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-900 to-red-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">{(data as any).name || 'Diagram'}</h3>
      
      <div className="w-64 h-64 bg-white/10 rounded-xl flex items-center justify-center">
        <span className="text-6xl">📊</span>
      </div>
      
      <p className="text-orange-100 mt-4">{(data as any).description || 'Diagram visualization'}</p>
    </div>
  );
}

function GenericVisual({ data }: { data: VisualData }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6">
      <pre className="text-xs text-gray-300 overflow-auto max-h-64">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// ============================================
// CLASSROOM CONTENT - Main classroom UI
// ============================================

function ClassroomContent() {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { state, audioTrack, agent } = useVoiceAssistant();
  
  const [currentVisual, setCurrentVisual] = useState<VisualData | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [avatarState, setAvatarState] = useState<AvatarState['state']>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Update avatar state from voice assistant
  useEffect(() => {
    if (state === 'speaking') setAvatarState('speaking');
    else if (state === 'listening') setAvatarState('listening');
    else if (state === 'thinking') setAvatarState('thinking');
    else setAvatarState('idle');
  }, [state]);

  // Handle data messages from agent
  useEffect(() => {
    if (!room) return;

    const handleData = (
      payload: Uint8Array, 
      participant?: RemoteParticipant, 
      kind?: DataPacket_Kind,
      topic?: string,
      encryptionType?: Encryption_Type
    ) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        
        if (data.type === 'avatar_state') {
          setAvatarState(data.state);
        } else if (['visual', 'animation', 'diagram', 'equation', 'quiz'].includes(data.type)) {
          setCurrentVisual(data);
        }
      } catch (e) {
        console.error('Failed to parse data:', e);
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room]);

  // Audio level monitoring for lip sync
  useEffect(() => {
    if (!audioTrack) return;

    const interval = setInterval(() => {
      // Simple audio level approximation
      const level = Math.random() * 0.5 + (state === 'speaking' ? 0.3 : 0);
      setAudioLevel(level);
    }, 50);

    return () => clearInterval(interval);
  }, [audioTrack, state]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Connection states
  if (connectionState === LKConnectionState.Connecting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Connecting to classroom...</p>
        </div>
      </div>
    );
  }

  if (connectionState === LKConnectionState.Disconnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Disconnected from classroom</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Panel - Teacher Avatar */}
      <div className="lg:w-1/3 flex flex-col items-center justify-center">
        <TeacherAvatar state={avatarState} audioLevel={audioLevel} />
        
        {/* Audio Visualizer */}
        {audioTrack && (
          <div className="mt-6 w-full max-w-xs">
            <BarVisualizer
              state={state}
              barCount={7}
              trackRef={audioTrack}
              className="h-12"
            />
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex gap-4">
          <div className={`px-4 py-2 rounded-full text-sm
            ${state === 'listening' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
            🎤 {state === 'listening' ? 'Listening' : 'Speak anytime'}
          </div>
        </div>
      </div>

      {/* Right Panel - Visual & Transcript */}
      <div className="lg:w-2/3 flex flex-col gap-6">
        {/* Visual Display */}
        <div className="flex-1 min-h-[300px]">
          <VisualDisplay visual={currentVisual} />
        </div>

        {/* Transcript */}
        <div className="h-48 bg-gray-900/50 rounded-xl p-4 overflow-y-auto">
          <h4 className="text-gray-400 text-sm mb-2">📝 Transcript</h4>
          <div className="space-y-2 text-white">
            {transcript.length === 0 ? (
              <p className="text-gray-500 italic">Conversation will appear here...</p>
            ) : (
              transcript.map((line, idx) => (
                <p key={idx} className="text-sm">{line}</p>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      {/* Audio Renderer - plays agent's voice */}
      <RoomAudioRenderer />
    </div>
  );
}

// ============================================
// MAIN CLASSROOM COMPONENT
// ============================================

interface LiveKitClassroomProps {
  subject?: string;
  studentName?: string;
  gradeLevel?: string;
  className?: string;
}

export default function LiveKitClassroom({
  subject = 'General Science',
  studentName = 'Student',
  gradeLevel = 'general',
  className = '',
}: LiveKitClassroomProps) {
  const [token, setToken] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Join classroom
  const joinClassroom = useCallback(async () => {
    setIsJoining(true);
    setError(null);
    
    try {
      const room = createRoomName(subject);
      setRoomName(room);
      
      const newToken = await getLiveKitToken(room, studentName, {
        subject,
        grade_level: gradeLevel,
      });
      
      setToken(newToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join classroom');
    } finally {
      setIsJoining(false);
    }
  }, [subject, studentName, gradeLevel]);

  // Leave classroom
  const leaveClassroom = useCallback(() => {
    setToken(null);
    setRoomName(null);
  }, []);

  // Not connected - show join screen
  if (!token) {
    return (
      <div className={`min-h-[600px] bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-2xl p-8 ${className}`}>
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-6">🎓</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            AI Teacher Classroom
          </h1>
          <p className="text-gray-300 mb-8 max-w-md">
            Join a live classroom session with your AI teacher. 
            Ask questions, get explanations, and learn interactively!
          </p>

          <div className="space-y-4 w-full max-w-sm">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Your Name</label>
              <input
                type="text"
                defaultValue={studentName}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Subject</label>
              <select
                defaultValue={subject}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="general">General Science</option>
                <option value="physics">Physics</option>
                <option value="mathematics">Mathematics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
              </select>
            </div>

            <button
              onClick={joinClassroom}
              disabled={isJoining}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg
                       hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
            >
              {isJoining ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Joining...
                </span>
              ) : (
                '🚀 Join Classroom'
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </div>

          <p className="text-gray-500 text-sm mt-8">
            Powered by LiveKit • Real-time AI Teaching
          </p>
        </div>
      </div>
    );
  }

  // Connected - show classroom
  return (
    <div className={`min-h-[600px] bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-black/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🎓</span>
          <div>
            <h2 className="text-white font-bold">AI Classroom</h2>
            <p className="text-gray-400 text-sm">Subject: {subject}</p>
          </div>
        </div>
        <button
          onClick={leaveClassroom}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Leave Class
        </button>
      </div>

      {/* LiveKit Room */}
      <div className="h-[calc(100%-80px)]">
        <LiveKitRoom
          token={token}
          serverUrl={LIVEKIT_CONFIG.serverUrl}
          connect={true}
          audio={true}
          video={false}
        >
          <ClassroomContent />
        </LiveKitRoom>
      </div>
    </div>
  );
}
