# 🚀 Despliegue en Vercel — Guía AURA Frontend

Esta guía explica cómo conectar el frontend de AURA desplegado en **Vercel** con el backend de Django alojado en **DigitalOcean**.

---

## ⚙️ Paso 1 – Configurar la URL del backend

Antes de hacer el deploy, edita el archivo `src/config.js` y reemplaza `/api` con la URL completa de tu servidor en DigitalOcean:

```js
// src/config.js
window.API_BASE_URL = 'https://TU_IP_O_DOMINIO_DE_DIGITALOCEAN'; // ← cambia esto
```

**Ejemplos:**
```
window.API_BASE_URL = 'https://api.aura.tudominio.com';
window.API_BASE_URL = 'http://123.45.67.89';
```

> ⚠️ Sin barra `/` al final. Incluye el protocolo (`http://` o `https://`).

---

## 🌐 Paso 2 – Importar el repositorio en Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New… → Project**.
2. Conecta tu cuenta de GitHub y selecciona el repositorio `AURA-Front-End`.
3. En la configuración del proyecto:
   - **Framework Preset**: `Other`
   - **Root Directory**: `.` (raíz del repositorio)
   - **Output Directory**: `src`
   - **Build Command**: *(dejar vacío — no hay build step)*
4. Haz clic en **Deploy**.

---

## 🔒 Paso 3 – Configurar CORS en el backend de DigitalOcean

El backend Django debe aceptar solicitudes provenientes del dominio de Vercel. En tu servidor DigitalOcean, edita la configuración de Django:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://tu-proyecto.vercel.app",   # Dominio de Vercel (auto-generado)
    "https://tudominio.com",            # Tu dominio personalizado (si tienes)
]
```

Si usas `django-cors-headers`, asegúrate de que esté instalado y el middleware esté activo.

Si usas Nginx en DigitalOcean, verifica que no bloquee `OPTIONS` (preflight):

```nginx
location /api/ {
    # Permitir CORS para el dominio de Vercel
    add_header 'Access-Control-Allow-Origin' 'https://tu-proyecto.vercel.app';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';

    if ($request_method = 'OPTIONS') {
        return 204;
    }
    # ... resto de la config
}
```

---

## ✅ Paso 4 – Verificar el despliegue

Después del deploy en Vercel:

1. Abre la URL de tu proyecto en Vercel.
2. Abre las **DevTools del navegador** (F12) → pestaña **Network**.
3. Intenta iniciar sesión — verifica que las peticiones vayan a tu IP/dominio de DigitalOcean (no a `localhost` ni a `/api` relativo).
4. Recarga la página en una ruta interna (ej. `/dashboard`) — no debe aparecer un **404** gracias al `vercel.json`.

---

## 📂 Archivos clave de configuración

| Archivo | Propósito |
|---|---|
| `src/config.js` | Define `window.API_BASE_URL` — **edítalo antes de cada deploy** |
| `vercel.json` | Rewrites para SPA + headers de seguridad |
| `.env.example` | Referencia de variables de entorno |
| `nginx.conf` | Proxy para desarrollo local con Docker (sin cambios) |

---

## 🔁 Flujo de entornos

| Entorno | Cómo funciona |
|---|---|
| **Docker (local)** | Nginx proxia `/api/` → `http://backend:8000`. `config.js` usa `/api` relativo. |
| **Vercel (producción)** | No hay proxy. `config.js` debe tener la URL absoluta de DigitalOcean. |
