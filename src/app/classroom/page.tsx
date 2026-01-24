'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with LiveKit
const RealisticClassroom = dynamic(
    () => import('@/components/classroom/RealisticClassroom'),
    { 
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(180,50%,3%) 0%, hsl(180,45%,5%) 50%, hsl(180,50%,4%) 100%)' }}>
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(160,90%,45%), hsl(180,85%,40%))' }}>
                        <span className="text-4xl">🎓</span>
                    </div>
                    <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full animate-spin" style={{ borderColor: 'hsl(160,90%,45%)', borderTopColor: 'transparent' }} />
                    <p className="text-xl text-white font-semibold">Loading AI Classroom...</p>
                    <p className="text-sm mt-2" style={{ color: 'hsl(180,20%,50%)' }}>Preparing your learning environment</p>
                </div>
            </div>
        )
    }
);

export default function ClassroomPage() {
    return <RealisticClassroom />;
}
