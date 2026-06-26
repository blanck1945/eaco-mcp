import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

const DEFAULT_FILE = join(homedir(), '.eaco-mcp', 'token');

export function tokenPath(): string {
  return process.env.EACO_TOKEN_FILE?.trim() || DEFAULT_FILE;
}

export function readToken(): string | null {
  const p = tokenPath();
  if (!existsSync(p)) return null;
  const t = readFileSync(p, 'utf8').trim();
  return t || null;
}

export function writeToken(token: string): void {
  const p = tokenPath();
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, token.trim(), 'utf8');
}

export function clearToken(): void {
  const p = tokenPath();
  if (existsSync(p)) writeFileSync(p, '', 'utf8');
}
