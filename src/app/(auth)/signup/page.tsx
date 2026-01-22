"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Loader2 } from "lucide-react";
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api-config';

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.baseUrl}${API_ENDPOINTS.register}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: name, email, password, role: "teacher" }),
            });
            const data = await res.json();
            if (!res.ok || data.statusCode >= 400) {
                throw new Error(data.error || data.message || "Signup failed");
            }
            localStorage.setItem("teacher_token", data.access_token);
            localStorage.setItem("teacher_userId", data.user.id);
            localStorage.setItem("teacher_userName", data.user.full_name || "");
            localStorage.setItem("teacher_userEmail", data.user.email || "");
            router.push("/dashboard");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Signup failed.";
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ color: '#16a34a', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '32px' }}>
                Create AI Teacher Account
            </h2>
            <form onSubmit={handleSignup}>
                <div style={{ position: 'relative', marginBottom: '18px' }}>
                    <User style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#86efac' }} />
                    <Input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        disabled={isLoading} 
                        placeholder="Full name"
                        style={{ 
                            paddingLeft: '50px', 
                            height: '52px', 
                            borderRadius: '26px', 
                            backgroundColor: '#f0fdf4', 
                            border: 'none', 
                            width: '100%',
                            fontSize: '15px',
                            color: '#1f2937'
                        }} 
                    />
                </div>
                <div style={{ position: 'relative', marginBottom: '18px' }}>
                    <Mail style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#86efac' }} />
                    <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={isLoading} 
                        placeholder="Email address"
                        style={{ 
                            paddingLeft: '50px', 
                            height: '52px', 
                            borderRadius: '26px', 
                            backgroundColor: '#f0fdf4', 
                            border: 'none', 
                            width: '100%',
                            fontSize: '15px',
                            color: '#1f2937'
                        }} 
                    />
                </div>
                <div style={{ position: 'relative', marginBottom: '28px' }}>
                    <Lock style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#86efac' }} />
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        disabled={isLoading} 
                        placeholder="Create password"
                        style={{ 
                            paddingLeft: '50px', 
                            height: '52px', 
                            borderRadius: '26px', 
                            backgroundColor: '#f0fdf4', 
                            border: 'none', 
                            width: '100%',
                            fontSize: '15px',
                            color: '#1f2937'
                        }} 
                    />
                </div>
                {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '18px', fontSize: '14px' }}>{error}</p>}
                <div style={{ textAlign: 'center' }}>
                    <Button type="submit" disabled={isLoading} style={{ 
                        width: '160px', 
                        height: '48px', 
                        borderRadius: '24px', 
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                        color: 'white', 
                        fontWeight: 600, 
                        fontSize: '14px', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        border: 'none', 
                        cursor: 'pointer',
                        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.35)'
                    }}>
                        {isLoading ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : "Sign Up"}
                    </Button>
                </div>
                <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#6b7280' }}>
                    Already have an account? <Link href="/login" style={{ color: '#16a34a', fontWeight: 600 }}>Sign in</Link>
                </p>
            </form>
        </div>
    );
}
