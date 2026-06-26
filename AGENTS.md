# eaco-mcp — guía para agentes de IA

Servidor MCP stdio. **No modifica el API Éaco** — solo llama HTTP.

Complementa **`@virtualsnake9/janus-mcp`** (roles estáticos): Éaco maneja solicitudes `pending` → `approved` / `rejected`.

---

## Setup Cursor

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

Siempre **`eaco_login`** antes del resto (o `EACO_API_TOKEN` en env).

---

## Tools

| Tool | Cuándo |
|------|--------|
| `eaco_login` | Obtener JWT (email + password) |
| `eaco_whoami` | Estado de sesión (`~/.eaco-mcp/token`) |
| `eaco_logout` | Borrar token local |
| `eaco_request_create` | Crear solicitud `pending`; opcional `janusBind` para materializar al aprobar |
| `eaco_requests_list` | Listar por tenant / estado |
| `eaco_request_approve` | Aprobar — materializa en Janus si estaba configurado |
| `eaco_request_reject` | Rechazar |
| `eaco_check_approved` | ¿Hay grant vigente para recurso? |

---

## Puertos (local)

| Servicio | Puerto |
|----------|--------|
| Éaco API | `3004` |
| Éaco Postgres | `5434` |
| Janus API (materialización) | `3001` |

Seed Éaco: `admin@eaco.local` / `admin12345`

---

## Backends en runtime

Producción: **`@virtualsnake9/eaco-sdk`** + **`@virtualsnake9/janus-sdk`**, no este MCP.

---

## Qué NO hacer

1. No commitear tokens ni `~/.eaco-mcp/`
2. No usar MCP como sustituto del SDK en backends
3. No duplicar roles de Janus en solicitudes Éaco sin necesidad
