"use client";

import dynamic from "next/dynamic";
import { School, Wifi, WifiOff, Volume2, Mic, Users } from "lucide-react";

// Dynamic import to avoid SSR issues with LiveKit
const RealisticClassroom = dynamic(
    () => import("@/components/classroom/RealisticClassroom"),
    {
        ssr: false,
        loading: () => (
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)",
                    borderRadius: "16px",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                            animation: "pulse 2s infinite",
                        }}
                    >
                        <School size={32} color="white" />
                    </div>
                    <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "18px", fontWeight: "600" }}>
                        Loading Real Classroom...
                    </p>
                    <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px", marginTop: "8px" }}>
                        Preparing LiveKit connection
                    </p>
                </div>
            </div>
        ),
    }
);

export default function RealClassroomSection() {
    return (
        <div style={{ padding: "32px", height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <School size={24} color="white" />
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontSize: "28px",
                                    fontWeight: "800",
                                    color: "white",
                                    letterSpacing: "-0.5px",
                                }}
                            >
                                Real Classroom
                            </h1>
                            <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px" }}>
                                LiveKit-powered interactive AI teaching experience
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Indicators */}
                <div style={{ display: "flex", gap: "12px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            background: "rgba(34, 197, 94, 0.1)",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                        }}
                    >
                        <Wifi size={16} color="#22c55e" />
                        <span style={{ color: "#22c55e", fontSize: "13px", fontWeight: "500" }}>
                            LiveKit Ready
                        </span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                    >
                        <Mic size={16} color="rgba(255, 255, 255, 0.6)" />
                        <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", fontWeight: "500" }}>
                            Voice Enabled
                        </span>
                    </div>
                </div>
            </div>

            {/* Features Info */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px",
                    marginBottom: "24px",
                }}
            >
                {[
                    { icon: "🎓", label: "AI Teacher", desc: "Animated avatar" },
                    { icon: "📝", label: "Blackboard", desc: "Real-time chalk writing" },
                    { icon: "🎤", label: "Voice Chat", desc: "Natural conversation" },
                    { icon: "📐", label: "Equations", desc: "Visual math support" },
                ].map((feature, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: "16px",
                            borderRadius: "12px",
                            background: "rgba(10, 15, 15, 0.6)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <span style={{ fontSize: "24px" }}>{feature.icon}</span>
                        <div>
                            <p style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>
                                {feature.label}
                            </p>
                            <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "12px" }}>
                                {feature.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Classroom Container */}
            <div
                style={{
                    flex: 1,
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    background: "rgba(10, 15, 15, 0.4)",
                    position: "relative",
                }}
            >
                {/* Green glow effect */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "2px",
                        background: "linear-gradient(90deg, transparent, #22c55e, transparent)",
                    }}
                />
                <RealisticClassroom />
            </div>
        </div>
    );
}
