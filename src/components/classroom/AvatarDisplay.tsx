'use client';

import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
    isSpeaking?: boolean;
    avatarStyle?: 'professional' | 'casual' | 'animated';
    status?: string;
    className?: string;
}

export function AvatarDisplay({
    isSpeaking = false,
    avatarStyle = 'professional',
    status = 'Ready to teach!',
    className,
}: AvatarDisplayProps) {
    const avatarEmoji = {
        professional: '👨‍🏫',
        casual: '🧑‍💻',
        animated: '🤖',
    };

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            {/* Avatar Circle */}
            <div
                className={cn(
                    'relative w-32 h-32 rounded-full flex items-center justify-center text-6xl',
                    'bg-gradient-to-br from-violet-500 to-blue-500',
                    'shadow-lg shadow-violet-500/30',
                    isSpeaking && 'animate-pulse'
                )}
            >
                {/* Speaking indicator rings */}
                {isSpeaking && (
                    <>
                        <span className="absolute inset-0 rounded-full border-4 border-violet-400 animate-ping opacity-30" />
                        <span className="absolute inset-2 rounded-full border-2 border-blue-400 animate-ping opacity-20" style={{ animationDelay: '0.2s' }} />
                    </>
                )}
                
                <span className={cn(
                    'transition-transform duration-300',
                    isSpeaking && 'scale-110'
                )}>
                    {avatarEmoji[avatarStyle]}
                </span>
            </div>

            {/* Status */}
            <div className="text-center">
                <p className={cn(
                    'text-sm font-medium',
                    isSpeaking ? 'text-green-400' : 'text-gray-400'
                )}>
                    {isSpeaking ? '🔴 Speaking...' : status}
                </p>
            </div>

            {/* Voice visualizer */}
            {isSpeaking && (
                <div className="flex items-end gap-1 h-8">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 bg-gradient-to-t from-violet-500 to-blue-400 rounded-full animate-bounce"
                            style={{
                                height: `${Math.random() * 24 + 8}px`,
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.5s',
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
