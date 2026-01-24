/**
 * LiveKit Token Generation API
 * 
 * This endpoint generates access tokens for students to join LiveKit rooms.
 * The token includes permissions and metadata for the room session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

// Environment variables - check both naming conventions
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
const LIVEKIT_URL = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://your-project.livekit.cloud';

// Validate environment
if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.warn('LiveKit credentials not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET.');
}

console.log('LiveKit URL:', LIVEKIT_URL);
console.log('LiveKit API Key present:', !!LIVEKIT_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      roomName, 
      participantName, 
      metadata = {} 
    } = body;

    // Validate required fields
    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: 'roomName and participantName are required' },
        { status: 400 }
      );
    }

    // Create access token
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
      name: participantName,
      metadata: JSON.stringify(metadata),
      // Token expires in 24 hours
      ttl: 86400,
    });

    // Grant permissions for the room
    token.addGrant({
      room: roomName,
      roomJoin: true,
      roomCreate: true, // Allow creating the room if it doesn't exist
      canPublish: true, // Student can publish audio
      canSubscribe: true, // Student can receive agent audio
      canPublishData: true, // Allow data channel messages
    });

    // Create room with metadata (optional - room is created automatically)
    try {
      const roomService = new RoomServiceClient(
        LIVEKIT_URL.replace('wss://', 'https://'),
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET
      );

      // Set room metadata for the agent to read
      await roomService.createRoom({
        name: roomName,
        metadata: JSON.stringify({
          subject: metadata.subject || 'general',
          student_name: participantName,
          grade_level: metadata.grade_level || 'general',
          topic: metadata.topic || '',
          learning_goal: metadata.learning_goal || '',
          created_at: new Date().toISOString(),
        }),
        emptyTimeout: 300, // Room closes after 5 min if empty
        maxParticipants: 10, // Limit participants
      });
      console.log('Room created:', roomName);

      // Note: Agent dispatch is NOT needed when using @server.rtc_session() decorator
      // The rtc_session decorator automatically connects an agent when participants join
      // Using explicit dispatch here would cause TWO agents to join (double voice issue)
      // If you switch to @server.explicit_session(), then you need explicit dispatch
    } catch (e: any) {
      // Room might already exist, that's okay
      console.log('Room creation note:', e?.message || e);
    }

    return NextResponse.json({
      token: await token.toJwt(),
      roomName,
      serverUrl: LIVEKIT_URL,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomName = searchParams.get('room') || `test-room-${Date.now()}`;
  const participantName = searchParams.get('name') || 'TestStudent';

  // Redirect to POST handler
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ roomName, participantName }),
    headers: { 'Content-Type': 'application/json' },
  }));
}
