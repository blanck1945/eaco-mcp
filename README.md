# @virtualsnake9/eaco-mcp

Servidor MCP **stdio** para gestionar solicitudes de acceso en **Éaco** desde Cursor u otros agentes.

**No usar en producción** — en backends usá [`@virtualsnake9/eaco-sdk`](https://www.npmjs.com/package/@virtualsnake9/eaco-sdk).

---

## Cursor

```json
{
  "mcpServers": {
    "eaco": {
      "command": "npx",
      "args": ["-y", "@virtualsnake9/eaco-mcp"],
      "env": {
        "EACO_API_BASE_URL": "http://localhost:3004"
      }
    }
  }
}
```

1. Levantar API Éaco (`:3004`)
2. Tool **`eaco_login`** (email + password)
3. Tools de solicitudes

Token local: `~/.eaco-mcp/token`  
Alternativa sin login: `EACO_API_TOKEN` en `env` del MCP.

Ver [`AGENTS.md`](./AGENTS.md) para la lista de tools.
