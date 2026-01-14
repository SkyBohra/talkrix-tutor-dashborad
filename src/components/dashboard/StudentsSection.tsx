"use client";

import { Search, Filter, MoreVertical } from "lucide-react";

interface Student {
    id: string;
    name: string;
    email: string;
    enrolledCourses: number;
    completedLessons: number;
    avgScore: number;
    lastActive: string;
    status: "active" | "inactive";
}

const mockStudents: Student[] = [
    { id: "1", name: "Sarah Johnson", email: "sarah@example.com", enrolledCourses: 3, completedLessons: 45, avgScore: 92, lastActive: "2 hours ago", status: "active" },
    { id: "2", name: "Mike Chen", email: "mike@example.com", enrolledCourses: 2, completedLessons: 32, avgScore: 88, lastActive: "5 hours ago", status: "active" },
    { id: "3", name: "Emily Davis", email: "emily@example.com", enrolledCourses: 4, completedLessons: 67, avgScore: 95, lastActive: "1 day ago", status: "active" },
    { id: "4", name: "Alex Wilson", email: "alex@example.com", enrolledCourses: 2, completedLessons: 18, avgScore: 78, lastActive: "3 days ago", status: "inactive" },
    { id: "5", name: "Jessica Brown", email: "jessica@example.com", enrolledCourses: 3, completedLessons: 52, avgScore: 90, lastActive: "12 hours ago", status: "active" },
];

export default function StudentsSection() {
    return (
        <div style={{ padding: "32px 40px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
                        Students
                    </h1>
                    <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "15px" }}>
                        Monitor and manage your students
                    </p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                        <Search size={20} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.4)" }} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            style={{
                                paddingLeft: "44px",
                                paddingRight: "16px",
                                height: "44px",
                                borderRadius: "12px",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "white",
                                fontSize: "14px",
                                width: "280px",
                                outline: "none",
                            }}
                        />
                    </div>
                    <button
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 20px",
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            fontWeight: "500",
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        <Filter size={18} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div
                style={{
                    background: "rgba(10, 15, 15, 0.6)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                            <th style={{ padding: "16px 24px", textAlign: "left", color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", fontWeight: "500" }}>Student</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", fontWeight: "500" }}>Courses</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", fontWeight: "500" }}>Lessons</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", fontWeight: "500" }}>Avg Score</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", fontWeight: "500" }}>Last Active</th>
                            <th style={{ padding: "16px 24px", textAlign: "left", color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", fontWeight: "500" }}>Status</th>
                            <th style={{ padding: "16px 24px", textAlign: "right", color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", fontWeight: "500" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockStudents.map((student) => (
                            <tr
                                key={student.id}
                                style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
                            >
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                                            {student.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div>
                                            <p style={{ color: "white", fontWeight: "500", fontSize: "14px" }}>{student.name}</p>
                                            <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "13px" }}>{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "16px 24px", color: "rgba(255, 255, 255, 0.7)", fontSize: "14px" }}>{student.enrolledCourses}</td>
                                <td style={{ padding: "16px 24px", color: "rgba(255, 255, 255, 0.7)", fontSize: "14px" }}>{student.completedLessons}</td>
                                <td style={{ padding: "16px 24px" }}>
                                    <span style={{ color: student.avgScore >= 90 ? "#22c55e" : student.avgScore >= 80 ? "#eab308" : "#ef4444", fontWeight: "500", fontSize: "14px" }}>
                                        {student.avgScore}%
                                    </span>
                                </td>
                                <td style={{ padding: "16px 24px", color: "rgba(255, 255, 255, 0.5)", fontSize: "14px" }}>{student.lastActive}</td>
                                <td style={{ padding: "16px 24px" }}>
                                    <span
                                        style={{
                                            padding: "4px 12px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            background: student.status === "active" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                            color: student.status === "active" ? "#22c55e" : "#ef4444",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {student.status}
                                    </span>
                                </td>
                                <td style={{ padding: "16px 24px", textAlign: "right" }}>
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
