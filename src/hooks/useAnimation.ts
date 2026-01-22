'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface AnimationData {
    name?: string;
    type?: string;
    duration?: number;
    objects?: Array<{
        type: string;
        start: { x: number; y: number };
        end: { x: number; y: number };
    }>;
    easing?: string;
    pivot?: { x: number; y: number };
    length?: number;
    amplitude?: number;
    wavelength?: number;
    speed?: number;
    show_force_arrow?: boolean;
}

interface UseAnimationReturn {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    playAnimation: (animationType: string, data?: AnimationData) => void;
    stopAnimation: () => void;
    isPlaying: boolean;
    currentAnimation: string | null;
}

export function useAnimation(): UseAnimationReturn {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);

    const stopAnimation = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setIsPlaying(false);
        setCurrentAnimation(null);
    }, []);

    const playAnimation = useCallback((animationType: string, data?: AnimationData) => {
        stopAnimation();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsPlaying(true);
        setCurrentAnimation(data?.name || animationType);

        const width = canvas.width;
        const height = canvas.height;

        // Animation implementations
        switch (animationType) {
            case 'falling_object':
            case 'apple_falling':
                animateFalling(ctx, width, height, data);
                break;
            case 'pendulum':
            case 'pendulum_swing':
                animatePendulum(ctx, width, height, data);
                break;
            case 'wave':
            case 'wave_motion':
            case 'sine_wave':
                animateWave(ctx, width, height, data);
                break;
            case 'oscillation':
            case 'spring':
            case 'spring_oscillation':
                animateSpring(ctx, width, height, data);
                break;
            case 'orbital_motion':
            case 'planet':
            case 'solar':
                animateOrbital(ctx, width, height, data);
                break;
            case 'electric_flow':
            case 'circuit':
            case 'current':
                animateElectric(ctx, width, height, data);
                break;
            case 'molecular_motion':
            case 'atom':
            case 'molecule':
                animateMolecular(ctx, width, height, data);
                break;
            case 'force_motion':
            case 'force':
            case 'motion':
                animateForce(ctx, width, height, data);
                break;
            case 'math_visual':
            case 'math':
            case 'number':
                animateMath(ctx, width, height, data);
                break;
            case 'geometry_visual':
            case 'geometry':
            case 'shape':
                animateGeometry(ctx, width, height, data);
                break;
            case 'energy_transfer':
            case 'energy':
                animateEnergy(ctx, width, height, data);
                break;
            default:
                // Generic animation
                animateFalling(ctx, width, height, data);
        }
    }, [stopAnimation]);

    // Falling object animation
    const animateFalling = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;
        const duration = data?.duration || 2000;
        const startY = height * 0.15;
        const endY = height * 0.85;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = progress * progress; // Gravity easing

            ctx.clearRect(0, 0, width, height);

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F7FA');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Ground
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(0, height * 0.9, width, height * 0.1);

            // Grass details
            ctx.fillStyle = '#388E3C';
            for (let i = 0; i < width; i += 15) {
                ctx.beginPath();
                ctx.moveTo(i, height * 0.9);
                ctx.lineTo(i + 5, height * 0.87);
                ctx.lineTo(i + 10, height * 0.9);
                ctx.fill();
            }

            // Tree trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(width * 0.42, height * 0.35, width * 0.06, height * 0.55);

            // Tree leaves
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(width * 0.45, height * 0.28, width * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(width * 0.38, height * 0.35, width * 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(width * 0.52, height * 0.35, width * 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Apple
            const currentY = startY + (endY - startY) * easeProgress;
            const appleX = width * 0.55;
            
            // Apple body
            ctx.fillStyle = '#E53935';
            ctx.beginPath();
            ctx.arc(appleX, currentY, 18, 0, Math.PI * 2);
            ctx.fill();

            // Apple highlight
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(appleX - 5, currentY - 5, 6, 0, Math.PI * 2);
            ctx.fill();

            // Apple stem
            ctx.strokeStyle = '#5D4037';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(appleX, currentY - 15);
            ctx.lineTo(appleX + 3, currentY - 22);
            ctx.stroke();

            // Gravity arrow (while falling)
            if (progress < 0.95) {
                ctx.strokeStyle = '#FFC107';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(appleX, currentY + 25);
                ctx.lineTo(appleX, currentY + 55);
                ctx.stroke();

                // Arrow head
                ctx.fillStyle = '#FFC107';
                ctx.beginPath();
                ctx.moveTo(appleX - 8, currentY + 48);
                ctx.lineTo(appleX, currentY + 60);
                ctx.lineTo(appleX + 8, currentY + 48);
                ctx.fill();

                // Label
                ctx.fillStyle = '#FFC107';
                ctx.font = 'bold 14px Arial';
                ctx.fillText('g = 9.8 m/s²', appleX + 15, currentY + 45);
            }

            // Impact text
            if (progress >= 1) {
                ctx.fillStyle = '#1565C0';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Gravity pulls objects toward Earth!', width / 2, height * 0.1);
            }

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(draw);
            } else {
                // Loop animation
                setTimeout(() => {
                    startTime = null;
                    animationFrameRef.current = requestAnimationFrame(draw);
                }, 1500);
            }
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Pendulum animation
    const animatePendulum = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;
        const period = data?.duration || 2000;
        const pivotX = width / 2;
        const pivotY = height * 0.1;
        const length = data?.length ? (data.length / 100) * height : height * 0.6;
        const amplitude = ((data?.amplitude || 45) * Math.PI) / 180;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const angle = amplitude * Math.cos((2 * Math.PI * elapsed) / period);

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            // Pivot support
            ctx.fillStyle = '#666';
            ctx.fillRect(pivotX - 40, 0, 80, pivotY + 10);
            
            // Pivot point
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
            ctx.fill();

            // Calculate bob position
            const bobX = pivotX + length * Math.sin(angle);
            const bobY = pivotY + length * Math.cos(angle);

            // Equilibrium line (dashed)
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(pivotX, pivotY);
            ctx.lineTo(pivotX, pivotY + length);
            ctx.stroke();
            ctx.setLineDash([]);

            // String
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pivotX, pivotY);
            ctx.lineTo(bobX, bobY);
            ctx.stroke();

            // Bob shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(bobX + 5, pivotY + length + 20, 25, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Bob
            const bobGradient = ctx.createRadialGradient(bobX - 8, bobY - 8, 0, bobX, bobY, 25);
            bobGradient.addColorStop(0, '#64B5F6');
            bobGradient.addColorStop(1, '#1976D2');
            ctx.fillStyle = bobGradient;
            ctx.beginPath();
            ctx.arc(bobX, bobY, 25, 0, Math.PI * 2);
            ctx.fill();

            // Angle indicator
            ctx.strokeStyle = '#FFC107';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, 40, Math.PI / 2 - amplitude, Math.PI / 2 + amplitude);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText(`T = 2π√(L/g)`, 20, 30);
            ctx.fillText(`θ = ${Math.round((angle * 180) / Math.PI)}°`, 20, 50);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Wave animation
    const animateWave = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;
        const amplitude = data?.amplitude || height * 0.15;
        const wavelength = data?.wavelength || width * 0.25;
        const speed = data?.speed || 2;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const phase = (elapsed / 500) * speed;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#0a192f';
            ctx.fillRect(0, 0, width, height);

            // Grid
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 50) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, height);
                ctx.stroke();
            }
            for (let i = 0; i < height; i += 50) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(width, i);
                ctx.stroke();
            }

            // Axis
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();

            // Wave
            ctx.strokeStyle = '#00BCD4';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const y = height / 2 + amplitude * Math.sin((x / wavelength) * 2 * Math.PI - phase);
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Wavelength marker
            const markerY = height / 2 - amplitude - 30;
            ctx.strokeStyle = '#FFC107';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, markerY);
            ctx.lineTo(50 + wavelength, markerY);
            ctx.stroke();

            // Arrow heads
            ctx.beginPath();
            ctx.moveTo(50, markerY - 5);
            ctx.lineTo(50, markerY + 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(50 + wavelength, markerY - 5);
            ctx.lineTo(50 + wavelength, markerY + 5);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#FFC107';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('λ (wavelength)', 50 + wavelength / 2, markerY - 10);

            // Amplitude marker
            ctx.strokeStyle = '#4CAF50';
            ctx.beginPath();
            ctx.moveTo(width - 80, height / 2);
            ctx.lineTo(width - 80, height / 2 - amplitude);
            ctx.stroke();

            ctx.fillStyle = '#4CAF50';
            ctx.fillText('A', width - 65, height / 2 - amplitude / 2);

            // Formula
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('y = A sin(kx - ωt)', 20, 30);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Spring oscillation animation
    const animateSpring = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;
        const period = data?.duration || 2000;
        const equilibrium = height * 0.5;
        const amplitude = data?.amplitude || height * 0.2;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const displacement = amplitude * Math.cos((2 * Math.PI * elapsed) / period);
            const massY = equilibrium + displacement;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            // Support
            ctx.fillStyle = '#555';
            ctx.fillRect(width / 2 - 60, 0, 120, 20);

            // Spring coils
            const springX = width / 2;
            const springTop = 20;
            const coils = 10;
            const coilWidth = 30;
            const springLength = massY - 30 - springTop;
            const coilHeight = springLength / coils;

            ctx.strokeStyle = '#9E9E9E';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(springX, springTop);

            for (let i = 0; i < coils; i++) {
                const y = springTop + i * coilHeight;
                ctx.lineTo(springX + (i % 2 === 0 ? coilWidth : -coilWidth), y + coilHeight / 2);
                ctx.lineTo(springX, y + coilHeight);
            }
            ctx.stroke();

            // Mass
            const massGradient = ctx.createRadialGradient(springX - 10, massY - 10, 0, springX, massY, 40);
            massGradient.addColorStop(0, '#E91E63');
            massGradient.addColorStop(1, '#880E4F');
            ctx.fillStyle = massGradient;
            ctx.fillRect(springX - 35, massY - 30, 70, 60);

            // Mass label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('m', springX, massY + 5);

            // Equilibrium line
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, equilibrium);
            ctx.lineTo(width, equilibrium);
            ctx.stroke();
            ctx.setLineDash([]);

            // Displacement arrow
            if (Math.abs(displacement) > 5) {
                ctx.strokeStyle = '#FFC107';
                ctx.fillStyle = '#FFC107';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(springX + 60, equilibrium);
                ctx.lineTo(springX + 60, massY);
                ctx.stroke();

                // Arrow head
                const arrowDir = displacement > 0 ? 1 : -1;
                ctx.beginPath();
                ctx.moveTo(springX + 55, massY - 10 * arrowDir);
                ctx.lineTo(springX + 60, massY);
                ctx.lineTo(springX + 65, massY - 10 * arrowDir);
                ctx.fill();
            }

            // Formula
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('F = -kx', 20, 30);
            ctx.fillText(`x = ${displacement.toFixed(0)} px`, 20, 50);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Orbital motion animation (planets, solar system)
    const animateOrbital = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;
        const centerX = width / 2;
        const centerY = height / 2;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            ctx.clearRect(0, 0, width, height);

            // Space background
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, width, height);

            // Stars
            for (let i = 0; i < 50; i++) {
                const x = (i * 137.5) % width;
                const y = (i * 73.5 + elapsed * 0.01) % height;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }

            // Sun
            const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
            sunGradient.addColorStop(0, '#FFD700');
            sunGradient.addColorStop(0.5, '#FFA500');
            sunGradient.addColorStop(1, '#FF4500');
            ctx.fillStyle = sunGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
            ctx.fill();

            // Sun glow
            ctx.fillStyle = 'rgba(255, 200, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
            ctx.fill();

            // Orbits
            const planets = [
                { radius: 80, speed: 0.002, size: 8, color: '#A0522D', name: 'Mercury' },
                { radius: 110, speed: 0.0015, size: 12, color: '#DEB887', name: 'Venus' },
                { radius: 150, speed: 0.001, size: 14, color: '#4169E1', name: 'Earth' },
                { radius: 190, speed: 0.0008, size: 10, color: '#CD853F', name: 'Mars' },
            ];

            planets.forEach((planet, i) => {
                // Orbit path
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(centerX, centerY, planet.radius, 0, Math.PI * 2);
                ctx.stroke();

                // Planet position
                const angle = elapsed * planet.speed + i * Math.PI / 2;
                const px = centerX + planet.radius * Math.cos(angle);
                const py = centerY + planet.radius * Math.sin(angle);

                // Planet
                const planetGradient = ctx.createRadialGradient(px - 2, py - 2, 0, px, py, planet.size);
                planetGradient.addColorStop(0, '#fff');
                planetGradient.addColorStop(1, planet.color);
                ctx.fillStyle = planetGradient;
                ctx.beginPath();
                ctx.arc(px, py, planet.size, 0, Math.PI * 2);
                ctx.fill();

                // Earth's moon
                if (planet.name === 'Earth') {
                    const moonAngle = elapsed * 0.005;
                    const mx = px + 25 * Math.cos(moonAngle);
                    const my = py + 25 * Math.sin(moonAngle);
                    ctx.fillStyle = '#ccc';
                    ctx.beginPath();
                    ctx.arc(mx, my, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Labels
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('☀️ Solar System', width / 2, 25);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Electric flow animation
    const animateElectric = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            // Battery
            ctx.fillStyle = '#333';
            ctx.fillRect(50, height / 2 - 40, 60, 80);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(55, height / 2 - 35, 25, 70);
            ctx.fillStyle = '#f44336';
            ctx.fillRect(80, height / 2 - 35, 25, 70);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('+', 68, height / 2 + 5);
            ctx.fillText('-', 93, height / 2 + 5);

            // Circuit wires
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(110, height / 2 - 20);
            ctx.lineTo(width - 100, height / 2 - 20);
            ctx.lineTo(width - 100, height / 2 + 20);
            ctx.lineTo(110, height / 2 + 20);
            ctx.stroke();

            // Light bulb
            ctx.fillStyle = '#333';
            ctx.fillRect(width / 2 - 20, height / 2 - 60, 40, 20);
            
            const bulbGlow = Math.sin(elapsed * 0.005) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 0, ${bulbGlow})`;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2 - 80, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Moving electrons
            const electronCount = 8;
            ctx.fillStyle = '#00BCD4';
            for (let i = 0; i < electronCount; i++) {
                const progress = ((elapsed * 0.1 + i * (360 / electronCount)) % 360) / 360;
                let ex, ey;

                if (progress < 0.4) {
                    // Top wire
                    ex = 110 + (width - 210) * (progress / 0.4);
                    ey = height / 2 - 20;
                } else if (progress < 0.5) {
                    // Right side
                    ex = width - 100;
                    ey = height / 2 - 20 + 40 * ((progress - 0.4) / 0.1);
                } else if (progress < 0.9) {
                    // Bottom wire
                    ex = width - 100 - (width - 210) * ((progress - 0.5) / 0.4);
                    ey = height / 2 + 20;
                } else {
                    // Left side
                    ex = 110;
                    ey = height / 2 + 20 - 40 * ((progress - 0.9) / 0.1);
                }

                ctx.beginPath();
                ctx.arc(ex, ey, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Labels
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText('e⁻ = electrons', 20, 30);
            ctx.fillText('I = V/R (Ohm\'s Law)', 20, 50);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Molecular/Atomic motion animation
    const animateMolecular = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#0a192f';
            ctx.fillRect(0, 0, width, height);

            // Water molecule (H2O)
            const centerX = width / 2;
            const centerY = height / 2;
            const wobble = Math.sin(elapsed * 0.003) * 5;

            // Oxygen atom (larger, red)
            const oGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
            oGradient.addColorStop(0, '#ff6b6b');
            oGradient.addColorStop(1, '#c92a2a');
            ctx.fillStyle = oGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY + wobble, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('O', centerX, centerY + wobble + 8);

            // Hydrogen atoms (smaller, white)
            const angle = 104.5 * Math.PI / 180 / 2; // Water bond angle
            const bondLength = 80;

            // H1
            const h1x = centerX - bondLength * Math.sin(angle);
            const h1y = centerY - bondLength * Math.cos(angle) + wobble;
            const h1Gradient = ctx.createRadialGradient(h1x, h1y, 0, h1x, h1y, 25);
            h1Gradient.addColorStop(0, '#fff');
            h1Gradient.addColorStop(1, '#ccc');
            ctx.fillStyle = h1Gradient;
            ctx.beginPath();
            ctx.arc(h1x, h1y, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#333';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('H', h1x, h1y + 6);

            // H2
            const h2x = centerX + bondLength * Math.sin(angle);
            const h2y = centerY - bondLength * Math.cos(angle) + wobble;
            ctx.fillStyle = h1Gradient;
            ctx.beginPath();
            ctx.arc(h2x, h2y, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#333';
            ctx.fillText('H', h2x, h2y + 6);

            // Bonds
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + wobble);
            ctx.lineTo(h1x, h1y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + wobble);
            ctx.lineTo(h2x, h2y);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('H₂O - Water Molecule', width / 2, 30);
            ctx.fillText('Bond Angle: 104.5°', width / 2, height - 20);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Force and motion animation
    const animateForce = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const cycle = (elapsed % 4000) / 4000;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, width, height);

            // Ground
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, height - 30, width, 30);

            // Friction texture
            ctx.fillStyle = '#a0522d';
            for (let i = 0; i < width; i += 10) {
                ctx.fillRect(i, height - 30, 5, 3);
            }

            // Box position (accelerating then decelerating)
            let boxX;
            if (cycle < 0.5) {
                // Accelerating
                boxX = 50 + (width - 150) * (cycle * 2) * (cycle * 2);
            } else {
                // Constant velocity then stop
                boxX = 50 + (width - 150) * (1 - Math.pow(1 - cycle, 2));
            }

            // Box
            const boxGradient = ctx.createLinearGradient(boxX, 0, boxX + 60, 0);
            boxGradient.addColorStop(0, '#3498db');
            boxGradient.addColorStop(1, '#2980b9');
            ctx.fillStyle = boxGradient;
            ctx.fillRect(boxX, height - 90, 60, 60);

            // Force arrow (push)
            if (cycle < 0.5) {
                ctx.strokeStyle = '#e74c3c';
                ctx.fillStyle = '#e74c3c';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(boxX - 60, height - 60);
                ctx.lineTo(boxX - 10, height - 60);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(boxX - 10, height - 70);
                ctx.lineTo(boxX, height - 60);
                ctx.lineTo(boxX - 10, height - 50);
                ctx.fill();
                ctx.fillText('F (push)', boxX - 55, height - 75);
            }

            // Friction arrow
            ctx.strokeStyle = '#9b59b6';
            ctx.fillStyle = '#9b59b6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(boxX + 70, height - 45);
            ctx.lineTo(boxX + 30, height - 45);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(boxX + 30, height - 50);
            ctx.lineTo(boxX + 20, height - 45);
            ctx.lineTo(boxX + 30, height - 40);
            ctx.fill();

            // Labels
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Newton\'s Laws of Motion', 20, 30);
            ctx.fillText('F = ma', 20, 50);
            ctx.fillStyle = '#9b59b6';
            ctx.fillText('f = friction', boxX + 25, height - 55);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Math visualization animation
    const animateMath = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = (elapsed % 3000) / 3000;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, width, height);

            // Grid
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 30) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, height);
                ctx.stroke();
            }
            for (let i = 0; i < height; i += 30) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(width, i);
                ctx.stroke();
            }

            // 2 + 3 = 5 visualization
            const blockSize = 40;
            const startY = height / 2 - blockSize / 2;

            // First group (2 blocks)
            ctx.fillStyle = '#3498db';
            for (let i = 0; i < 2; i++) {
                ctx.fillRect(30 + i * 50, startY, blockSize, blockSize);
                ctx.strokeStyle = '#2980b9';
                ctx.lineWidth = 2;
                ctx.strokeRect(30 + i * 50, startY, blockSize, blockSize);
            }

            // Plus sign
            ctx.fillStyle = '#333';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+', 160, startY + 35);

            // Second group (3 blocks)
            ctx.fillStyle = '#e74c3c';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(200 + i * 50, startY, blockSize, blockSize);
                ctx.strokeStyle = '#c0392b';
                ctx.lineWidth = 2;
                ctx.strokeRect(200 + i * 50, startY, blockSize, blockSize);
            }

            // Equals sign
            ctx.fillStyle = '#333';
            ctx.fillText('=', width / 2 + 80, startY + 35);

            // Result (5 blocks appearing)
            const visibleBlocks = Math.floor(progress * 5);
            ctx.fillStyle = '#2ecc71';
            for (let i = 0; i < visibleBlocks; i++) {
                const x = width / 2 + 110 + (i % 5) * 45;
                ctx.fillRect(x, startY, blockSize, blockSize);
                ctx.strokeStyle = '#27ae60';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, startY, blockSize, blockSize);
            }

            // Labels
            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('2 + 3 = 5', width / 2, 50);
            
            ctx.font = '16px Arial';
            ctx.fillText('Adding numbers with blocks', width / 2, height - 30);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Geometry visualization
    const animateGeometry = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const rotation = elapsed * 0.001;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            // Rotating triangle
            ctx.save();
            ctx.translate(centerX - 120, centerY);
            ctx.rotate(rotation);
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(0, -50);
            ctx.lineTo(45, 40);
            ctx.lineTo(-45, 40);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Square
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation * 0.7);
            ctx.fillStyle = '#3498db';
            ctx.fillRect(-40, -40, 80, 80);
            ctx.restore();

            // Circle
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.arc(centerX + 120, centerY, 45 + Math.sin(rotation * 2) * 10, 0, Math.PI * 2);
            ctx.fill();

            // Labels
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Triangle', centerX - 120, centerY + 80);
            ctx.fillText('Square', centerX, centerY + 80);
            ctx.fillText('Circle', centerX + 120, centerY + 80);

            ctx.font = 'bold 18px Arial';
            ctx.fillText('Basic Shapes', width / 2, 30);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Energy transfer animation
    const animateEnergy = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        data?: AnimationData
    ) => {
        let startTime: number | null = null;

        const draw = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const cycle = (elapsed % 4000) / 4000;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            // Ramp
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.moveTo(50, height - 50);
            ctx.lineTo(width / 2, height / 3);
            ctx.lineTo(width / 2, height - 50);
            ctx.closePath();
            ctx.fill();

            // Ball position on ramp
            let ballX, ballY, pe, ke;
            if (cycle < 0.5) {
                // Going down
                const progress = cycle * 2;
                ballX = 50 + (width / 2 - 50) * progress;
                ballY = height - 50 - (height - 50 - height / 3) * (1 - progress);
                pe = 1 - progress;
                ke = progress;
            } else {
                // Going up
                const progress = (cycle - 0.5) * 2;
                ballX = width / 2 + 50 + (width / 2 - 100) * progress;
                ballY = height - 50 - Math.sin(progress * Math.PI) * (height / 3);
                pe = Math.sin(progress * Math.PI);
                ke = 1 - Math.sin(progress * Math.PI);
            }

            // Ball
            const ballGradient = ctx.createRadialGradient(ballX - 5, ballY - 5, 0, ballX, ballY, 20);
            ballGradient.addColorStop(0, '#ff6b6b');
            ballGradient.addColorStop(1, '#c92a2a');
            ctx.fillStyle = ballGradient;
            ctx.beginPath();
            ctx.arc(ballX, ballY - 20, 20, 0, Math.PI * 2);
            ctx.fill();

            // Energy bars
            const barWidth = 80;
            const maxBarHeight = 100;

            // PE bar
            ctx.fillStyle = '#3498db';
            ctx.fillRect(width - 120, height - 30 - pe * maxBarHeight, barWidth, pe * maxBarHeight);
            ctx.strokeStyle = '#2980b9';
            ctx.strokeRect(width - 120, height - 30 - maxBarHeight, barWidth, maxBarHeight);

            // KE bar
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(width - 220, height - 30 - ke * maxBarHeight, barWidth, ke * maxBarHeight);
            ctx.strokeStyle = '#c0392b';
            ctx.strokeRect(width - 220, height - 30 - maxBarHeight, barWidth, maxBarHeight);

            // Labels
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('KE', width - 180, height - 10);
            ctx.fillText('PE', width - 80, height - 10);

            ctx.font = 'bold 16px Arial';
            ctx.fillText('Energy Conservation: PE + KE = constant', width / 2, 30);

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAnimation();
        };
    }, [stopAnimation]);

    return {
        canvasRef,
        playAnimation,
        stopAnimation,
        isPlaying,
        currentAnimation,
    };
}
