"use client";

import { BookOpen, Users, Clock, TrendingUp, GraduationCap } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
    return (
        <div
            style={{
                background: "rgba(10, 15, 15, 0.6)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#22c55e",
                    }}
                >
                    {icon}
                </div>
                {trend && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            color: trendUp ? "#22c55e" : "#ef4444",
                            background: trendUp ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            padding: "4px 8px",
                            borderRadius: "20px",
                        }}
                    >
                        <TrendingUp size={12} style={{ transform: trendUp ? "none" : "rotate(180deg)" }} />
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "4px" }}>
                    {title}
                </p>
                <p style={{ fontSize: "32px", fontWeight: "700", color: "white", letterSpacing: "-1px" }}>
                    {value}
                </p>
            </div>
        </div>
    );
}

export default function DashboardSection() {
    return (
        <div style={{ padding: "32px 40px" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
                    Welcome back! 👋
                </h1>
                <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "15px" }}>
                    Here's an overview of your AI teaching platform
                </p>
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "24px",
                    marginBottom: "32px",
                }}
            >
                <StatCard
                    title="Total Courses"
                    value={12}
                    icon={<BookOpen size={24} />}
                    trend="+3 this month"
                    trendUp={true}
                />
                <StatCard
                    title="Active Students"
                    value={1284}
                    icon={<Users size={24} />}
                    trend="+18%"
                    trendUp={true}
                />
                <StatCard
                    title="Lessons Completed"
                    value={8547}
                    icon={<GraduationCap size={24} />}
                    trend="+24%"
                    trendUp={true}
                />
                <StatCard
                    title="Avg. Session Time"
                    value="45m"
                    icon={<Clock size={24} />}
                    trend="+5m"
                    trendUp={true}
                />
            </div>

            {/* Recent Activity */}
            <div
                style={{
                    background: "rgba(10, 15, 15, 0.6)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "24px",
                }}
            >
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "white", marginBottom: "20px" }}>
                    Recent Student Activity
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                        { name: "Sarah Johnson", course: "Mathematics 101", action: "Completed lesson", time: "5 min ago" },
                        { name: "Mike Chen", course: "Physics Basics", action: "Started quiz", time: "12 min ago" },
                        { name: "Emily Davis", course: "Chemistry Intro", action: "Asked question", time: "25 min ago" },
                        { name: "Alex Wilson", course: "Biology 101", action: "Submitted assignment", time: "1 hour ago" },
                    ].map((activity, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "16px",
                                background: "rgba(255, 255, 255, 0.02)",
                                borderRadius: "12px",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                    }}
                                >
                                    {activity.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                    <p style={{ color: "white", fontWeight: "500", fontSize: "14px" }}>{activity.name}</p>
                                    <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px" }}>
                                        {activity.action} • {activity.course}
                                    </p>
                                </div>
                            </div>
                            <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "13px" }}>{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
