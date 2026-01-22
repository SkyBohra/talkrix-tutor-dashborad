"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardSection from "@/components/dashboard/DashboardSection";
import ClassroomSection from "@/components/dashboard/ClassroomSection";
import CoursesSection from "@/components/dashboard/CoursesSection";
import StudentsSection from "@/components/dashboard/StudentsSection";
import ContentSection from "@/components/dashboard/ContentSection";
import SettingsSection from "@/components/dashboard/SettingsSection";

export default function Dashboard() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState("dashboard");

    useEffect(() => {
        const token = localStorage.getItem("teacher_token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("teacher_token");
        localStorage.removeItem("teacher_userId");
        localStorage.removeItem("teacher_userName");
        localStorage.removeItem("teacher_userEmail");
        router.push("/login");
    };

    const renderSection = () => {
        switch (activeSection) {
            case "dashboard":
                return <DashboardSection />;
            case "classroom":
                return <ClassroomSection />;
            case "courses":
                return <CoursesSection />;
            case "students":
                return <StudentsSection />;
            case "content":
                return <ContentSection />;
            case "settings":
                return <SettingsSection />;
            default:
                return <DashboardSection />;
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", position: "relative" }}>
            {/* Dot Pattern Overlay */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* Sidebar */}
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    position: "relative",
                    zIndex: 1,
                    overflowY: "auto",
                    maxHeight: "100vh",
                }}
            >
                {renderSection()}
            </main>
        </div>
    );
}
