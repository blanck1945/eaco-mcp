export type EacoMcpEnv = {
  apiBaseUrl: string;
};

export function loadEnv(): EacoMcpEnv {
  const apiBaseUrl = (
    process.env.EACO_API_BASE_URL ??
    process.env.EACO_API_URL ??
    'http://localhost:3004'
  )
    .trim()
    .replace(/\/+$/, '');
  if (!apiBaseUrl) throw new Error('EACO_API_BASE_URL requerido');
  return { apiBaseUrl };
}
