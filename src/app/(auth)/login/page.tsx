"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Loader2, Check } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok || data.statusCode >= 400) {
                throw new Error(data.error || data.message || "Invalid credentials");
            }
            localStorage.setItem("teacher_token", data.data.access_token);
            const tokenPayload = JSON.parse(atob(data.data.access_token.split('.')[1]));
            localStorage.setItem("teacher_userId", tokenPayload.sub);
            localStorage.setItem("teacher_userName", data.data.name || "");
            localStorage.setItem("teacher_userEmail", data.data.email || "");
            router.push("/dashboard");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Login failed.";
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ color: '#16a34a', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '32px' }}>
                AI Teacher Login
            </h2>
            <form onSubmit={handleLogin}>
                <div style={{ position: 'relative', marginBottom: '18px' }}>
                    <User style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#86efac' }} />
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
                <div style={{ position: 'relative', marginBottom: '18px' }}>
                    <Lock style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#86efac' }} />
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        disabled={isLoading} 
                        placeholder="Password"
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <div onClick={() => setRememberMe(!rememberMe)} style={{ 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '50%', 
                            border: rememberMe ? 'none' : '2px solid #86efac', 
                            backgroundColor: rememberMe ? '#22c55e' : 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}>
                            {rememberMe && <Check style={{ width: '10px', height: '10px', color: 'white' }} />}
                        </div>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Remember me</span>
                    </label>
                    <Link href="#" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>Forgot password?</Link>
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
                        {isLoading ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : "Login"}
                    </Button>
                </div>
                <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#6b7280' }}>
                    Don't have an account? <Link href="/signup" style={{ color: '#16a34a', fontWeight: 600 }}>Sign up</Link>
                </p>
            </form>
        </div>
    );
}
