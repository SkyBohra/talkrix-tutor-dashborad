"use client";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: '100vh', width: '100%', display: 'flex' }}>
            {/* Left Panel - With animated elements (Green/Teal Theme) */}
            <div style={{ 
                display: 'flex',
                width: '55%', 
                position: 'relative', 
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
            }}>
                {/* Animated Orbs */}
                <div style={{ 
                    position: 'absolute', 
                    top: '10%', 
                    left: '10%', 
                    width: '300px', 
                    height: '300px', 
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    animation: 'drift 20s ease-in-out infinite'
                }} />
                <div style={{ 
                    position: 'absolute', 
                    bottom: '20%', 
                    right: '10%', 
                    width: '250px', 
                    height: '250px', 
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    animation: 'drift 15s ease-in-out infinite reverse'
                }} />
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    width: '200px', 
                    height: '200px', 
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(234, 179, 8, 0.2) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    animation: 'drift 18s ease-in-out infinite'
                }} />

                {/* Grid Pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)'
                }} />

                {/* Floating particles */}
                <div style={{ position: 'absolute', top: '20%', left: '20%', width: '6px', height: '6px', backgroundColor: '#22c55e', borderRadius: '50%', opacity: 0.6, animation: 'float 6s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', top: '40%', left: '60%', width: '4px', height: '4px', backgroundColor: '#3b82f6', borderRadius: '50%', opacity: 0.6, animation: 'float 8s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', top: '70%', left: '30%', width: '5px', height: '5px', backgroundColor: '#eab308', borderRadius: '50%', opacity: 0.6, animation: 'float 7s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', top: '30%', left: '80%', width: '4px', height: '4px', backgroundColor: '#22c55e', borderRadius: '50%', opacity: 0.6, animation: 'float 9s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', top: '80%', left: '70%', width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', opacity: 0.6, animation: 'float 5s ease-in-out infinite' }} />
                
                {/* Text Content */}
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px' }}>
                    <div style={{ 
                        width: '56px', 
                        height: '56px', 
                        marginBottom: '24px',
                        borderRadius: '16px', 
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 12px 40px rgba(34, 197, 94, 0.3)'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '44px', fontWeight: 'bold', color: 'white', marginBottom: '20px', lineHeight: 1.2 }}>
                        <span style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Teacher</span> Admin
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', lineHeight: 1.7, maxWidth: '420px' }}>
                        Create and manage AI-powered teaching assistants. Build intelligent tutors that help students learn effectively.
                    </p>
                    
                    {/* Feature badges */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
                        <div style={{ padding: '8px 16px', backgroundColor: 'rgba(34, 197, 94, 0.15)', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '13px', color: '#22c55e' }}>
                            📚 Smart Tutoring
                        </div>
                        <div style={{ padding: '8px 16px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '13px', color: '#3b82f6' }}>
                            🎓 Personalized Learning
                        </div>
                        <div style={{ padding: '8px 16px', backgroundColor: 'rgba(234, 179, 8, 0.15)', borderRadius: '20px', border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '13px', color: '#eab308' }}>
                            ⚡ Interactive
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={{ 
                width: '45%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'white',
                padding: '48px'
            }}>
                <div style={{ width: '100%', maxWidth: '380px' }}>
                    {children}
                </div>
            </div>

            <style jsx global>{`
                @keyframes drift {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, -20px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
