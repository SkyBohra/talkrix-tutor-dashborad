import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Live Classroom - AI Teacher',
    description: 'Interactive live classroom with AI-powered visual teaching',
};

export default function ClassroomLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
