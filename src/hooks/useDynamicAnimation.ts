'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Animation object types
interface AnimationObject {
    id: string;
    type: 'circle' | 'rect' | 'line' | 'text' | 'arrow' | 'image' | 'path';
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    color?: string;
    fill?: string;
    stroke?: string;
    text?: string;
    fontSize?: number;
    rotation?: number;
    opacity?: number;
    // For arrows/lines
    endX?: number;
    endY?: number;
    // For paths
    points?: { x: number; y: number }[];
}

// Animation action types
interface AnimationAction {
    objectId: string;
    type: 'move' | 'rotate' | 'scale' | 'fade' | 'color' | 'appear' | 'disappear' | 'bounce' | 'swing' | 'wave';
    duration: number; // in ms
    delay?: number;
    // Movement
    toX?: number;
    toY?: number;
    // Rotation
    toRotation?: number;
    // Scale
    toScale?: number;
    // Fade
    toOpacity?: number;
    // Color
    toColor?: string;
    // Physics
    amplitude?: number;
    frequency?: number;
    // Easing
    easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';
    // Repeat
    repeat?: boolean | number;
}

// Complete animation scene from LLM
export interface AnimationScene {
    title: string;
    description: string;
    background?: string;
    width?: number;
    height?: number;
    objects: AnimationObject[];
    actions: AnimationAction[];
    labels?: { text: string; x: number; y: number; color?: string }[];
    formula?: string;
}

interface UseDynamicAnimationReturn {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    playScene: (scene: AnimationScene) => void;
    stopAnimation: () => void;
    isPlaying: boolean;
    currentScene: AnimationScene | null;
}

// Easing functions
const easings = {
    linear: (t: number) => t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => t * (2 - t),
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    bounce: (t: number) => {
        if (t < 1 / 2.75) return 7.5625 * t * t;
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
    elastic: (t: number) => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
};

export function useDynamicAnimation(): UseDynamicAnimationReturn {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentScene, setCurrentScene] = useState<AnimationScene | null>(null);

    const stopAnimation = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const playScene = useCallback((scene: AnimationScene) => {
        stopAnimation();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsPlaying(true);
        setCurrentScene(scene);

        const width = canvas.width;
        const height = canvas.height;

        // Clone objects for animation state
        const objectStates = new Map<string, AnimationObject>();
        scene.objects.forEach(obj => {
            objectStates.set(obj.id, { ...obj });
        });

        // Track action progress
        const actionStartTimes = new Map<number, number>();
        let startTime: number | null = null;
        let loopCount = 0;

        const drawObject = (obj: AnimationObject) => {
            ctx.save();
            
            // Apply transformations
            ctx.translate(obj.x, obj.y);
            if (obj.rotation) {
                ctx.rotate((obj.rotation * Math.PI) / 180);
            }
            ctx.globalAlpha = obj.opacity ?? 1;

            switch (obj.type) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, obj.radius || 20, 0, Math.PI * 2);
                    if (obj.fill || obj.color) {
                        ctx.fillStyle = obj.fill || obj.color || '#3498db';
                        ctx.fill();
                    }
                    if (obj.stroke) {
                        ctx.strokeStyle = obj.stroke;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                    break;

                case 'rect':
                    const w = obj.width || 50;
                    const h = obj.height || 50;
                    if (obj.fill || obj.color) {
                        ctx.fillStyle = obj.fill || obj.color || '#3498db';
                        ctx.fillRect(-w / 2, -h / 2, w, h);
                    }
                    if (obj.stroke) {
                        ctx.strokeStyle = obj.stroke;
                        ctx.lineWidth = 2;
                        ctx.strokeRect(-w / 2, -h / 2, w, h);
                    }
                    break;

                case 'text':
                    ctx.fillStyle = obj.color || '#ffffff';
                    ctx.font = `${obj.fontSize || 16}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(obj.text || '', 0, 0);
                    break;

                case 'arrow':
                    const endX = (obj.endX || 50) - obj.x;
                    const endY = (obj.endY || 0) - obj.y;
                    ctx.strokeStyle = obj.color || '#FFC107';
                    ctx.fillStyle = obj.color || '#FFC107';
                    ctx.lineWidth = 3;
                    
                    // Line
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    
                    // Arrow head
                    const angle = Math.atan2(endY, endX);
                    const headLength = 15;
                    ctx.beginPath();
                    ctx.moveTo(endX, endY);
                    ctx.lineTo(
                        endX - headLength * Math.cos(angle - Math.PI / 6),
                        endY - headLength * Math.sin(angle - Math.PI / 6)
                    );
                    ctx.lineTo(
                        endX - headLength * Math.cos(angle + Math.PI / 6),
                        endY - headLength * Math.sin(angle + Math.PI / 6)
                    );
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 'line':
                    ctx.strokeStyle = obj.color || '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo((obj.endX || 50) - obj.x, (obj.endY || 0) - obj.y);
                    ctx.stroke();
                    break;

                case 'path':
                    if (obj.points && obj.points.length > 1) {
                        ctx.strokeStyle = obj.color || '#00BCD4';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(obj.points[0].x - obj.x, obj.points[0].y - obj.y);
                        obj.points.slice(1).forEach(p => {
                            ctx.lineTo(p.x - obj.x, p.y - obj.y);
                        });
                        ctx.stroke();
                    }
                    break;
            }

            ctx.restore();
        };

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            // Clear and draw background
            ctx.clearRect(0, 0, width, height);
            
            // Background
            if (scene.background) {
                ctx.fillStyle = scene.background;
            } else {
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, '#1a1a2e');
                gradient.addColorStop(1, '#16213e');
                ctx.fillStyle = gradient;
            }
            ctx.fillRect(0, 0, width, height);

            // Apply actions to update object states
            scene.actions.forEach((action, index) => {
                const delay = action.delay || 0;
                const actionStart = delay;
                const actionEnd = delay + action.duration;

                // Handle repeating actions
                let effectiveElapsed = elapsed;
                if (action.repeat) {
                    const totalDuration = actionEnd;
                    const repeatCount = typeof action.repeat === 'number' ? action.repeat : Infinity;
                    const currentLoop = Math.floor(elapsed / totalDuration);
                    if (currentLoop < repeatCount) {
                        effectiveElapsed = elapsed % totalDuration;
                    }
                }

                if (effectiveElapsed >= actionStart && effectiveElapsed <= actionEnd) {
                    const progress = (effectiveElapsed - actionStart) / action.duration;
                    const easing = easings[action.easing || 'easeInOut'];
                    const easedProgress = easing(Math.min(progress, 1));

                    const obj = objectStates.get(action.objectId);
                    if (!obj) return;

                    const originalObj = scene.objects.find(o => o.id === action.objectId);
                    if (!originalObj) return;

                    switch (action.type) {
                        case 'move':
                            if (action.toX !== undefined) {
                                obj.x = originalObj.x + (action.toX - originalObj.x) * easedProgress;
                            }
                            if (action.toY !== undefined) {
                                obj.y = originalObj.y + (action.toY - originalObj.y) * easedProgress;
                            }
                            break;

                        case 'rotate':
                            if (action.toRotation !== undefined) {
                                obj.rotation = (originalObj.rotation || 0) + action.toRotation * easedProgress;
                            }
                            break;

                        case 'fade':
                            if (action.toOpacity !== undefined) {
                                obj.opacity = (originalObj.opacity ?? 1) + (action.toOpacity - (originalObj.opacity ?? 1)) * easedProgress;
                            }
                            break;

                        case 'bounce':
                            const bounceAmp = action.amplitude || 30;
                            obj.y = originalObj.y + Math.abs(Math.sin(progress * Math.PI * 4)) * bounceAmp * (1 - progress);
                            break;

                        case 'swing':
                            const swingAmp = action.amplitude || 45;
                            const freq = action.frequency || 2;
                            obj.rotation = Math.sin(progress * Math.PI * freq * 2) * swingAmp;
                            break;

                        case 'wave':
                            const waveAmp = action.amplitude || 20;
                            const waveFreq = action.frequency || 3;
                            obj.y = originalObj.y + Math.sin(progress * Math.PI * waveFreq * 2) * waveAmp;
                            break;

                        case 'appear':
                            obj.opacity = easedProgress;
                            break;

                        case 'disappear':
                            obj.opacity = 1 - easedProgress;
                            break;
                    }
                }
            });

            // Draw all objects
            objectStates.forEach(obj => {
                drawObject(obj);
            });

            // Draw labels
            if (scene.labels) {
                ctx.font = '14px Arial';
                ctx.textAlign = 'left';
                scene.labels.forEach(label => {
                    ctx.fillStyle = label.color || '#ffffff';
                    ctx.fillText(label.text, label.x, label.y);
                });
            }

            // Draw formula
            if (scene.formula) {
                ctx.fillStyle = '#FFC107';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(scene.formula, width / 2, height - 30);
            }

            // Draw title
            if (scene.title) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(scene.title, width / 2, 25);
            }

            // Check if all actions are complete
            const maxDuration = Math.max(...scene.actions.map(a => (a.delay || 0) + a.duration));
            const hasRepeating = scene.actions.some(a => a.repeat);

            if (elapsed < maxDuration || hasRepeating) {
                animationFrameRef.current = requestAnimationFrame(draw);
            } else {
                // Loop the animation after a pause
                setTimeout(() => {
                    startTime = null;
                    loopCount++;
                    // Reset object states
                    scene.objects.forEach(obj => {
                        objectStates.set(obj.id, { ...obj });
                    });
                    animationFrameRef.current = requestAnimationFrame(draw);
                }, 1000);
            }
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    }, [stopAnimation]);

    useEffect(() => {
        return () => stopAnimation();
    }, [stopAnimation]);

    return {
        canvasRef,
        playScene,
        stopAnimation,
        isPlaying,
        currentScene,
    };
}

// Helper function to parse LLM animation response
export function parseAnimationFromLLM(llmResponse: string): AnimationScene | null {
    try {
        // Try to extract JSON from response
        const jsonMatch = llmResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                          llmResponse.match(/\{[\s\S]*"objects"[\s\S]*\}/);
        
        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            return JSON.parse(jsonStr);
        }
        return null;
    } catch (e) {
        console.error('Failed to parse animation JSON:', e);
        return null;
    }
}

// Default scene generator for common concepts
export function generateDefaultScene(concept: string, description: string): AnimationScene {
    const concepts: Record<string, () => AnimationScene> = {
        gravity: () => ({
            title: 'Gravity - Apple Falling',
            description: description,
            objects: [
                { id: 'tree', type: 'rect', x: 200, y: 150, width: 20, height: 100, fill: '#8B4513' },
                { id: 'leaves', type: 'circle', x: 200, y: 80, radius: 50, fill: '#228B22' },
                { id: 'apple', type: 'circle', x: 230, y: 100, radius: 12, fill: '#E53935' },
                { id: 'ground', type: 'rect', x: 200, y: 280, width: 400, height: 40, fill: '#4CAF50' },
                { id: 'arrow', type: 'arrow', x: 260, y: 150, endX: 260, endY: 200, color: '#FFC107' },
            ],
            actions: [
                { objectId: 'apple', type: 'move', toY: 260, duration: 2000, easing: 'easeIn', repeat: true },
                { objectId: 'arrow', type: 'fade', toOpacity: 0.5, duration: 1000, repeat: true },
            ],
            labels: [
                { text: 'g = 9.8 m/s²', x: 280, y: 180, color: '#FFC107' },
            ],
            formula: 'F = mg (Force = mass × gravity)',
        }),
        
        pendulum: () => ({
            title: 'Pendulum Motion',
            description: description,
            objects: [
                { id: 'pivot', type: 'circle', x: 200, y: 50, radius: 8, fill: '#666' },
                { id: 'string', type: 'line', x: 200, y: 50, endX: 200, endY: 200, color: '#aaa' },
                { id: 'bob', type: 'circle', x: 200, y: 200, radius: 20, fill: '#3498db' },
            ],
            actions: [
                { objectId: 'bob', type: 'swing', amplitude: 60, frequency: 1, duration: 4000, repeat: true },
            ],
            labels: [
                { text: 'Period: T = 2π√(L/g)', x: 20, y: 30, color: '#fff' },
            ],
            formula: 'T = 2π√(L/g)',
        }),

        wave: () => ({
            title: 'Wave Motion',
            description: description,
            objects: [
                { id: 'particle1', type: 'circle', x: 50, y: 150, radius: 8, fill: '#00BCD4' },
                { id: 'particle2', type: 'circle', x: 100, y: 150, radius: 8, fill: '#00BCD4' },
                { id: 'particle3', type: 'circle', x: 150, y: 150, radius: 8, fill: '#00BCD4' },
                { id: 'particle4', type: 'circle', x: 200, y: 150, radius: 8, fill: '#00BCD4' },
                { id: 'particle5', type: 'circle', x: 250, y: 150, radius: 8, fill: '#00BCD4' },
                { id: 'particle6', type: 'circle', x: 300, y: 150, radius: 8, fill: '#00BCD4' },
                { id: 'particle7', type: 'circle', x: 350, y: 150, radius: 8, fill: '#00BCD4' },
            ],
            actions: [
                { objectId: 'particle1', type: 'wave', amplitude: 40, frequency: 2, duration: 3000, delay: 0, repeat: true },
                { objectId: 'particle2', type: 'wave', amplitude: 40, frequency: 2, duration: 3000, delay: 150, repeat: true },
                { objectId: 'particle3', type: 'wave', amplitude: 40, frequency: 2, duration: 3000, delay: 300, repeat: true },
                { objectId: 'particle4', type: 'wave', amplitude: 40, frequency: 2, duration: 3000, delay: 450, repeat: true },
                { objectId: 'particle5', type: 'wave', amplitude: 40, frequency: 2, duration: 3000, delay: 600, repeat: true },
                { objectId: 'particle6', type: 'wave', amplitude: 40, frequency: 2, duration: 3000, delay: 750, repeat: true },
                { objectId: 'particle7', type: 'wave', amplitude: 40, frequency: 2, duration: 3000, delay: 900, repeat: true },
            ],
            formula: 'y = A sin(kx - ωt)',
        }),
    };

    // Find matching concept
    const key = Object.keys(concepts).find(k => concept.toLowerCase().includes(k));
    if (key) {
        return concepts[key]();
    }

    // Default generic animation
    return {
        title: concept,
        description: description,
        objects: [
            { id: 'main', type: 'circle', x: 200, y: 150, radius: 30, fill: '#3498db' },
        ],
        actions: [
            { objectId: 'main', type: 'bounce', amplitude: 50, duration: 2000, repeat: true },
        ],
        formula: '',
    };
}
