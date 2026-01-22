'use client';

import { useRef, useEffect, useState } from 'react';
import { useAnimation } from '@/hooks/useAnimation';
import { cn } from '@/lib/utils';

interface VisualCanvasProps {
    className?: string;
    animationType?: string;
    animationData?: Record<string, unknown>;
    autoPlay?: boolean;
}

export function VisualCanvas({
    className,
    animationType,
    animationData,
    autoPlay = true,
}: VisualCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { canvasRef, playAnimation, stopAnimation, isPlaying, currentAnimation } = useAnimation();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Resize canvas to fit container
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Update canvas size
    useEffect(() => {
        if (canvasRef.current && dimensions.width > 0 && dimensions.height > 0) {
            canvasRef.current.width = dimensions.width;
            canvasRef.current.height = dimensions.height;
        }
    }, [dimensions, canvasRef]);

    // Play animation when type changes
    useEffect(() => {
        if (animationType && autoPlay && canvasRef.current) {
            playAnimation(animationType, animationData as Parameters<typeof playAnimation>[1]);
        }
    }, [animationType, animationData, autoPlay, playAnimation, canvasRef]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative w-full h-full min-h-[300px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden',
                className
            )}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />
            
            {/* Animation label */}
            {currentAnimation && (
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <div className="flex items-center gap-2">
                        {isPlaying && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        )}
                        <span className="text-sm text-white/80">{currentAnimation}</span>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                    onClick={() => animationType && playAnimation(animationType, animationData as Parameters<typeof playAnimation>[1])}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    title="Replay"
                >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                <button
                    onClick={stopAnimation}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    title="Stop"
                >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                </button>
            </div>

            {/* Placeholder when no animation */}
            {!animationType && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/50">
                        <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">Visual demonstrations will appear here</p>
                    </div>
                </div>
            )}
        </div>
    );
}
