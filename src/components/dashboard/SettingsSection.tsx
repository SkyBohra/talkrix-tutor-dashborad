"use client";

import { User, Bell, Shield, Palette, Globe, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsSection() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        studentActivity: true,
        courseUpdates: false,
    });

    return (
        <div style={{ padding: "32px 40px" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
                    Settings
                </h1>
                <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "15px" }}>
                    Manage your account and preferences
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Profile Settings */}
                <div
                    style={{
                        background: "rgba(10, 15, 15, 0.6)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "16px",
                        padding: "24px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#22c55e",
                            }}
                        >
                            <User size={20} />
                        </div>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "white" }}>Profile</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", marginBottom: "8px", display: "block" }}>Full Name</label>
                            <input
                                type="text"
                                defaultValue="John Teacher"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "white",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", marginBottom: "8px", display: "block" }}>Email</label>
                            <input
                                type="email"
                                defaultValue="john@example.com"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "white",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div
                    style={{
                        background: "rgba(10, 15, 15, 0.6)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "16px",
                        padding: "24px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#3b82f6",
                            }}
                        >
                            <Bell size={20} />
                        </div>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "white" }}>Notifications</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {Object.entries(notifications).map(([key, value]) => (
                            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", textTransform: "capitalize" }}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                                    style={{
                                        width: "44px",
                                        height: "24px",
                                        borderRadius: "12px",
                                        background: value ? "#22c55e" : "rgba(255, 255, 255, 0.1)",
                                        border: "none",
                                        cursor: "pointer",
                                        position: "relative",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "50%",
                                            background: "white",
                                            position: "absolute",
                                            top: "2px",
                                            left: value ? "22px" : "2px",
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Settings */}
                <div
                    style={{
                        background: "rgba(10, 15, 15, 0.6)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "16px",
                        padding: "24px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.2) 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#eab308",
                            }}
                        >
                            <Shield size={20} />
                        </div>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "white" }}>Security</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <button
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "white",
                                fontSize: "14px",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            Change Password
                        </button>
                        <button
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                background: "rgba(255, 255, 255, 0.05)",
                                color: "white",
                                fontSize: "14px",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            Enable Two-Factor Authentication
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div
                    style={{
                        background: "rgba(10, 15, 15, 0.6)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "16px",
                        padding: "24px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#a855f7",
                            }}
                        >
                            <Globe size={20} />
                        </div>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "white" }}>Preferences</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", marginBottom: "8px", display: "block" }}>Language</label>
                            <select
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "white",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="es">Spanish</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", marginBottom: "8px", display: "block" }}>Timezone</label>
                            <select
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "white",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                            >
                                <option value="ist">IST (India)</option>
                                <option value="utc">UTC</option>
                                <option value="est">EST (US)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 32px",
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        borderRadius: "12px",
                        border: "none",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                    }}
                >
                    <Save size={18} />
                    Save Changes
                </button>
            </div>
        </div>
    );
}
