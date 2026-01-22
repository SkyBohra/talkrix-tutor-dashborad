'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDynamicAnimation, AnimationScene, generateDefaultScene } from '@/hooks/useDynamicAnimation';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface DynamicVisualCanvasProps {
    scene?: AnimationScene | null;
    visualType?: string;
    description?: string;
    className?: string;
}

export function DynamicVisualCanvas({ 
    scene, 
    visualType,
    description,
    className = '' 
}: DynamicVisualCanvasProps) {
    const { canvasRef, playScene, stopAnimation, isPlaying, currentScene } = useDynamicAnimation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });

    // Resize canvas based on container
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setCanvasSize({
                    width: Math.min(rect.width - 20, 500),
                    height: Math.min(rect.height - 60, 350)
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Play animation when scene changes
    useEffect(() => {
        if (scene) {
            // Scale scene objects to canvas size
            const scaledScene = scaleSceneToCanvas(scene, canvasSize.width, canvasSize.height);
            playScene(scaledScene);
        } else if (visualType) {
            // Generate default scene based on visual type
            const defaultScene = generateDefaultScene(visualType, description || '');
            const scaledScene = scaleSceneToCanvas(defaultScene, canvasSize.width, canvasSize.height);
            playScene(scaledScene);
        }
    }, [scene, visualType, canvasSize, playScene, description]);

    const handleReplay = () => {
        if (scene) {
            const scaledScene = scaleSceneToCanvas(scene, canvasSize.width, canvasSize.height);
            playScene(scaledScene);
        } else if (visualType) {
            const defaultScene = generateDefaultScene(visualType, description || '');
            const scaledScene = scaleSceneToCanvas(defaultScene, canvasSize.width, canvasSize.height);
            playScene(scaledScene);
        }
    };

    return (
        <div ref={containerRef} className={`relative bg-slate-900 rounded-xl overflow-hidden ${className}`}>
            {/* Title bar */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-3 z-10">
                <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm font-medium">
                        {currentScene?.title || description || '🎬 Visual Demonstration'}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReplay}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            title="Replay"
                        >
                            <RotateCcw className="w-4 h-4 text-white" />
                        </button>
                        <button
                            onClick={isPlaying ? stopAnimation : handleReplay}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                            ) : (
                                <Play className="w-4 h-4 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="w-full h-full"
            />

            {/* Description overlay */}
            {currentScene?.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white/80 text-xs text-center">
                        {currentScene.description}
                    </p>
                </div>
            )}

            {/* Loading state */}
            {!scene && !visualType && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-white/60 text-sm">Preparing visual...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to scale scene objects to canvas size
function scaleSceneToCanvas(scene: AnimationScene, targetWidth: number, targetHeight: number): AnimationScene {
    const baseWidth = scene.width || 400;
    const baseHeight = scene.height || 300;
    
    const scaleX = targetWidth / baseWidth;
    const scaleY = targetHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY);

    return {
        ...scene,
        width: targetWidth,
        height: targetHeight,
        objects: scene.objects.map(obj => ({
            ...obj,
            x: obj.x * scale,
            y: obj.y * scale,
            radius: obj.radius ? obj.radius * scale : undefined,
            width: obj.width ? obj.width * scale : undefined,
            height: obj.height ? obj.height * scale : undefined,
            endX: obj.endX ? obj.endX * scale : undefined,
            endY: obj.endY ? obj.endY * scale : undefined,
            fontSize: obj.fontSize ? obj.fontSize * scale : undefined,
        })),
        actions: scene.actions.map(action => ({
            ...action,
            toX: action.toX ? action.toX * scale : undefined,
            toY: action.toY ? action.toY * scale : undefined,
            amplitude: action.amplitude ? action.amplitude * scale : undefined,
        })),
        labels: scene.labels?.map(label => ({
            ...label,
            x: label.x * scale,
            y: label.y * scale,
        })),
    };
}
