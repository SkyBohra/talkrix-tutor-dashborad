"use client";

import { Plus, BookOpen, Users, Clock, MoreVertical } from "lucide-react";

interface Course {
    id: string;
    name: string;
    description: string;
    students: number;
    lessons: number;
    duration: string;
    status: "active" | "draft" | "archived";
}

const mockCourses: Course[] = [
    {
        id: "1",
        name: "Mathematics 101",
        description: "Introduction to algebra and calculus fundamentals",
        students: 245,
        lessons: 24,
        duration: "12 hours",
        status: "active",
    },
    {
        id: "2",
        name: "Physics Basics",
        description: "Understanding mechanics, thermodynamics, and waves",
        students: 189,
        lessons: 18,
        duration: "10 hours",
        status: "active",
    },
    {
        id: "3",
        name: "Chemistry Introduction",
        description: "Learn about atoms, molecules, and chemical reactions",
        students: 156,
        lessons: 20,
        duration: "11 hours",
        status: "active",
    },
    {
        id: "4",
        name: "Biology 101",
        description: "Explore cells, genetics, and ecosystems",
        students: 0,
        lessons: 15,
        duration: "8 hours",
        status: "draft",
    },
];

export default function CoursesSection() {
    return (
        <div style={{ padding: "32px 40px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
                        Courses
                    </h1>
                    <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "15px" }}>
                        Manage your AI-powered courses
                    </p>
                </div>
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        borderRadius: "12px",
                        border: "none",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                >
                    <Plus size={20} />
                    Create Course
                </button>
            </div>

            {/* Courses Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "24px",
                }}
            >
                {mockCourses.map((course) => (
                    <div
                        key={course.id}
                        style={{
                            background: "rgba(10, 15, 15, 0.6)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "16px",
                            padding: "24px",
                            transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
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
                                <BookOpen size={24} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span
                                    style={{
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        background: course.status === "active" ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)",
                                        color: course.status === "active" ? "#22c55e" : "#eab308",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {course.status}
                                </span>
                                <button
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "rgba(255, 255, 255, 0.5)",
                                        cursor: "pointer",
                                        padding: "4px",
                                    }}
                                >
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "white", marginBottom: "8px" }}>
                            {course.name}
                        </h3>
                        <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px", marginBottom: "20px", lineHeight: "1.5" }}>
                            {course.description}
                        </p>
                        <div style={{ display: "flex", gap: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Users size={16} style={{ color: "rgba(255, 255, 255, 0.4)" }} />
                                <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px" }}>{course.students} students</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <BookOpen size={16} style={{ color: "rgba(255, 255, 255, 0.4)" }} />
                                <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px" }}>{course.lessons} lessons</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Clock size={16} style={{ color: "rgba(255, 255, 255, 0.4)" }} />
                                <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px" }}>{course.duration}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
