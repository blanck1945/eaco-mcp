#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadEnv } from './env.js';
import { registerEacoTools } from './tools.js';
import { readToken, writeToken } from './tokenStore.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const envToken = process.env.EACO_API_TOKEN?.trim();
  if (envToken && !readToken()) writeToken(envToken);

  const server = new McpServer(
    { name: 'eaco-mcp', version: '0.1.0' },
    {
      instructions:
        'Éaco — autorización dinámica (solicitudes PENDING → APPROVED/REJECTED). ' +
        'Complementa Janus (roles estáticos). Sesión: eaco_login. ' +
        'Tools: eaco_request_create, eaco_requests_list, eaco_request_approve, eaco_request_reject, eaco_check_approved.',
    },
  );

  registerEacoTools(server, env);

  await server.connect(new StdioServerTransport());
}

main().catch((e) => {
  console.error('[eaco-mcp]', e instanceof Error ? e.message : e);
  process.exit(1);
});
