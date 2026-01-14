"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("teacher_token");
        if (token) {
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    }, [router]);

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
        }}>
            <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid rgba(34, 197, 94, 0.3)',
                borderTopColor: '#22c55e',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
        </div>
    );
}
