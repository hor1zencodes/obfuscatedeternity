import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  signCheckpointSession, 
  verifyCheckpointSession, 
  CheckpointSession 
} from '@/lib/checkpointToken';

const COOKIE_NAME = 'etn_checkpoint_token';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function getSessionFromRequest(request: NextRequest, bodyToken?: string | null): { session: CheckpointSession | null; token: string | null } {
  let token = request.cookies.get(COOKIE_NAME)?.value || null;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  if (!token && bodyToken) {
    token = bodyToken;
  }
  if (!token) return { session: null, token: null };
  return { session: verifyCheckpointSession(token), token };
}

function createNewSession(): CheckpointSession {
  return {
    sessionId: crypto.randomUUID(),
    cp1Started: false,
    cp1StartedAt: 0,
    cp1Completed: false,
    cp2Started: false,
    cp2StartedAt: 0,
    cp2Completed: false,
    eligible: false,
    createdAt: Date.now(),
  };
}

export async function GET(request: NextRequest) {
  const { session, token } = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: true, valid: false, step: 1 });
  }

  let step = 1;
  if (session.eligible || (session.cp1Completed && session.cp2Completed)) {
    step = 3;
  } else if (session.cp1Completed) {
    step = 2;
  }

  return NextResponse.json({
    success: true,
    valid: true,
    step,
    session: {
      cp1Completed: session.cp1Completed,
      cp2Completed: session.cp2Completed,
      eligible: session.eligible,
    },
    token,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, token: bodyToken } = body;
    let { session } = getSessionFromRequest(request, bodyToken);

    if (action === 'start_cp1') {
      session = createNewSession();
      session.cp1Started = true;
      session.cp1StartedAt = Date.now();

      const token = signCheckpointSession(session);
      const response = NextResponse.json({ success: true, step: 1, token }, { headers: corsHeaders });
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 3600, // 1 hour
      });
      return response;
    }

    if (action === 'verify_cp1') {
      if (!session || !session.cp1Started) {
        return NextResponse.json(
          { success: false, error: 'Checkpoint 1 was skipped. Please start from Checkpoint 1.' },
          { status: 403, headers: corsHeaders }
        );
      }

      session.cp1Completed = true;
      const token = signCheckpointSession(session);
      const response = NextResponse.json({ success: true, step: 2, token }, { headers: corsHeaders });
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 3600,
      });
      return response;
    }

    if (action === 'start_cp2') {
      if (!session || !session.cp1Completed) {
        return NextResponse.json(
          { success: false, error: 'Checkpoint 1 must be completed before starting Checkpoint 2.' },
          { status: 403, headers: corsHeaders }
        );
      }

      session.cp2Started = true;
      session.cp2StartedAt = Date.now();

      const token = signCheckpointSession(session);
      const response = NextResponse.json({ success: true, step: 2, token }, { headers: corsHeaders });
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 3600,
      });
      return response;
    }

    if (action === 'verify_cp2') {
      if (!session || !session.cp1Completed || !session.cp2Started) {
        return NextResponse.json(
          { success: false, error: 'Checkpoints were skipped. Complete both checkpoints in order.' },
          { status: 403, headers: corsHeaders }
        );
      }

      session.cp2Completed = true;
      session.eligible = true;

      const token = signCheckpointSession(session);
      const response = NextResponse.json({ success: true, step: 3, token }, { headers: corsHeaders });
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 3600,
      });
      return response;
    }

    if (action === 'reset') {
      const response = NextResponse.json({ success: true }, { headers: corsHeaders });
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400, headers: corsHeaders });
  } catch (e: any) {
    console.error('Checkpoint API error:', e);
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
