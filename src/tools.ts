import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { EacoMcpEnv } from './env.js';
import { apiFetch, loginWithPassword, logout, sessionInfo } from './api.js';

function textResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function registerEacoTools(server: McpServer, env: EacoMcpEnv): void {
  server.tool(
    'eaco_login',
    'Login en Éaco (email + password). Guarda JWT en ~/.eaco-mcp/token. Alternativa: EACO_API_TOKEN en env.',
    {
      email: z.string().email(),
      password: z.string().min(1),
      tenantId: z.string().uuid().optional(),
    },
    async ({ email, password, tenantId }) => {
      const token = await loginWithPassword(env, email, password, tenantId);
      return textResult({ ok: true, expiresHint: 'ver JWT_ACCESS_TTL_SEC del API', tokenPrefix: token.slice(0, 12) + '…' });
    },
  );

  server.tool('eaco_whoami', 'Estado de sesión MCP', {}, async () => textResult(sessionInfo()));

  server.tool('eaco_logout', 'Borrar token local', {}, async () => {
    logout();
    return textResult({ ok: true });
  });

  server.tool(
    'eaco_request_create',
    'Crear solicitud de acceso (PENDING). Opcional janusMaterialization al aprobar.',
    {
      tenantId: z.string().uuid(),
      resourceType: z.string(),
      resourceId: z.string(),
      action: z.string().optional(),
      reason: z.string().optional(),
      janusBind: z
        .object({
          janusTenantId: z.string().uuid(),
          roleSlugs: z.array(z.string()).min(1),
        })
        .optional(),
    },
    async ({ tenantId, resourceType, resourceId, action, reason, janusBind }) => {
      const janusMaterialization = janusBind
        ? {
            type: 'bind_resource' as const,
            janusTenantId: janusBind.janusTenantId,
            resourceType,
            resourceId,
            roleSlugs: janusBind.roleSlugs,
          }
        : undefined;
      const data = await apiFetch(env, '/access-requests', {
        method: 'POST',
        body: JSON.stringify({
          tenantId,
          resourceType,
          resourceId,
          action: action ?? 'access',
          reason,
          janusMaterialization,
        }),
      });
      return textResult(data);
    },
  );

  server.tool(
    'eaco_requests_list',
    'Listar solicitudes por tenant',
    {
      tenantId: z.string().uuid(),
      status: z.enum(['pending', 'approved', 'rejected', 'expired', 'cancelled']).optional(),
    },
    async ({ tenantId, status }) => {
      const q = new URLSearchParams({ tenantId });
      if (status) q.set('status', status);
      return textResult(await apiFetch(env, `/access-requests?${q}`));
    },
  );

  server.tool(
    'eaco_request_approve',
    'Aprobar solicitud — materializa en Janus si estaba configurado',
    { requestId: z.string().uuid() },
    async ({ requestId }) =>
      textResult(
        await apiFetch(env, `/access-requests/${requestId}/approve`, {
          method: 'POST',
          body: '{}',
        }),
      ),
  );

  server.tool(
    'eaco_request_reject',
    'Rechazar solicitud',
    { requestId: z.string().uuid(), reason: z.string().optional() },
    async ({ requestId, reason }) =>
      textResult(
        await apiFetch(env, `/access-requests/${requestId}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }),
      ),
  );

  server.tool(
    'eaco_check_approved',
    '¿Hay aprobación vigente para recurso/acción?',
    {
      tenantId: z.string().uuid(),
      resourceType: z.string(),
      resourceId: z.string(),
      action: z.string().optional(),
    },
    async ({ tenantId, resourceType, resourceId, action }) => {
      const q = new URLSearchParams({
        tenantId,
        resourceType,
        resourceId,
        action: action ?? 'access',
      });
      return textResult(await apiFetch(env, `/access-requests/check/approved?${q}`));
    },
  );
}
