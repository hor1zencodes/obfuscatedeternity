import crypto from 'crypto';

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eternity_secret_checkpoint_salt_2026';

export interface CheckpointSession {
  sessionId: string;
  cp1Started: boolean;
  cp1StartedAt: number;
  cp1Completed: boolean;
  cp2Started: boolean;
  cp2StartedAt: number;
  cp2Completed: boolean;
  eligible: boolean;
  createdAt: number;
}

export function signCheckpointSession(session: CheckpointSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyCheckpointSession(token: string): CheckpointSession | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const session: CheckpointSession = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    );

    // Expire session after 1 hour of inactivity
    if (Date.now() - session.createdAt > 60 * 60 * 1000) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
