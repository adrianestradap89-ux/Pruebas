# EDUHUB 2026 - Colegio España (Despliegue de Dominio Único)

Esta configuración permite que **todo el sistema** (Web y n8n) funcione bajo un mismo enlace (ej. `colegio-espana.vercel.app`) de forma transparente para el usuario.

## 1. El Portal Web (En Vercel)
El frontend estático vive en `/frontend`. Vercel se encarga de servirlo y de **redirigir el tráfico** hacia el motor de n8n oculto en tu servidor.

1. Sube esta carpeta a GitHub.
2. En Vercel, importa el proyecto y configura el **Root Directory** como `frontend/`.
3. Una vez desplegado, tu web funcionará en el dominio de Vercel.
4. **IMPORTANTE**: Edita el archivo `frontend/vercel.json` y cambia `https://api-colegioespana.duckdns.org` por la URL de tu VPS.

Al acceder a `tu-web.vercel.app/n8n/` entrarás al panel de n8n, y las funciones de la web (`/webhook/...`) hablarán con n8n sin que cambie el dominio en la barra de navegación.

---

## 2. El Motor (n8n en VPS)
Como n8n requiere un servidor encendido 24/7 y una base de datos para funcionar, lo mantenemos en tu VPS de Hetzner/Contabo bajo Docker, pero "enmascarado" por Vercel.

1. En tu VPS, usa `docker-compose.yml` para levantar n8n.
2. El archivo `.env` del VPS debe tener el dominio de DuckDNS que uses como "puente".
3. El `Caddyfile` en el VPS solo necesita recibir y pasar el tráfico a n8n.

---

## 3. Configuración Inicial n8n
1. Accede a tu URL de Vercel agregando `/n8n/` al final (ej. `mi-web.vercel.app/n8n/`).
2. Importa el archivo `n8n_base_flow.json`.
3. ¡Listo! Tu frontend y tu backend están sincronizados bajo el mismo dominio.
