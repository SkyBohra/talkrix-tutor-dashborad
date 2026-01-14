"use client";

import { Plus, FileText, Video, Headphones, Image, MoreVertical } from "lucide-react";

interface ContentItem {
    id: string;
    name: string;
    type: "document" | "video" | "audio" | "image";
    course: string;
    size: string;
    uploadedAt: string;
}

const mockContent: ContentItem[] = [
    { id: "1", name: "Introduction to Algebra.pdf", type: "document", course: "Mathematics 101", size: "2.4 MB", uploadedAt: "2 days ago" },
    { id: "2", name: "Newton's Laws Explained.mp4", type: "video", course: "Physics Basics", size: "156 MB", uploadedAt: "3 days ago" },
    { id: "3", name: "Chemical Reactions Audio.mp3", type: "audio", course: "Chemistry Intro", size: "12 MB", uploadedAt: "1 week ago" },
    { id: "4", name: "Cell Structure Diagram.png", type: "image", course: "Biology 101", size: "1.8 MB", uploadedAt: "1 week ago" },
    { id: "5", name: "Calculus Formulas.pdf", type: "document", course: "Mathematics 101", size: "856 KB", uploadedAt: "2 weeks ago" },
];

const getIcon = (type: string) => {
    switch (type) {
        case "document": return <FileText size={24} />;
        case "video": return <Video size={24} />;
        case "audio": return <Headphones size={24} />;
        case "image": return <Image size={24} />;
        default: return <FileText size={24} />;
    }
};

const getIconColor = (type: string) => {
    switch (type) {
        case "document": return { bg: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" };
        case "video": return { bg: "rgba(168, 85, 247, 0.2)", color: "#a855f7" };
        case "audio": return { bg: "rgba(234, 179, 8, 0.2)", color: "#eab308" };
        case "image": return { bg: "rgba(34, 197, 94, 0.2)", color: "#22c55e" };
        default: return { bg: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" };
    }
};

export default function ContentSection() {
    return (
        <div style={{ padding: "32px 40px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
                        Content Library
                    </h1>
                    <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "15px" }}>
                        Manage your teaching materials
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
                    Upload Content
                </button>
            </div>

            {/* Content Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                }}
            >
                {mockContent.map((item) => {
                    const iconStyle = getIconColor(item.type);
                    return (
                        <div
                            key={item.id}
                            style={{
                                background: "rgba(10, 15, 15, 0.6)",
                                backdropFilter: "blur(16px)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                borderRadius: "16px",
                                padding: "20px",
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
                                        background: iconStyle.bg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: iconStyle.color,
                                    }}
                                >
                                    {getIcon(item.type)}
                                </div>
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
                            <h3 style={{ fontSize: "15px", fontWeight: "600", color: "white", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.name}
                            </h3>
                            <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", marginBottom: "16px" }}>
                                {item.course}
                            </p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px" }}>{item.size}</span>
                                <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px" }}>{item.uploadedAt}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
