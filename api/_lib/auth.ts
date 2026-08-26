import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sccp-super-secret-key';

export interface AuthUser {
  id: string;
  role: string;
  name: string;
}

/**
 * Verifies the JWT token from the Authorization header.
 * Returns the decoded user or null if invalid/missing.
 */
export function getAuthUser(req: VercelRequest): AuthUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Requires authentication. Sends 401 if not authenticated.
 * Returns the authenticated user or null (after sending the response).
 */
export function requireAuth(req: VercelRequest, res: VercelResponse): AuthUser | null {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

/**
 * Requires the user to have one of the specified roles.
 * Sends 403 if forbidden. Returns the user or null.
 */
export function requireRole(
  req: VercelRequest,
  res: VercelResponse,
  roles: string[]
): AuthUser | null {
  const user = requireAuth(req, res);
  if (!user) return null;

  if (!roles.includes(user.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return user;
}

/**
 * Signs a JWT token for the given payload.
 */
export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET);
}
