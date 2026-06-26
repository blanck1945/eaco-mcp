import type { EacoMcpEnv } from './env.js';
import { readToken, writeToken, clearToken, tokenPath } from './tokenStore.js';

export async function apiFetch(
  env: EacoMcpEnv,
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<unknown> {
  const token = init.token ?? readToken();
  if (!token) throw new Error('Sin sesión. Llamá eaco_login primero.');
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: string }).message)
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

export async function loginWithPassword(
  env: EacoMcpEnv,
  email: string,
  password: string,
  tenantId?: string,
): Promise<string> {
  const res = await fetch(`${env.apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password, tenantId }),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: string }).message)
        : `Login falló ${res.status}`,
    );
  }
  const token = (body as { accessToken: string }).accessToken;
  writeToken(token);
  return token;
}

export function sessionInfo(): object {
  return {
    tokenFile: tokenPath(),
    hasToken: !!readToken(),
  };
}

export function logout(): void {
  clearToken();
}
