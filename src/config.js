/**
 * AURA – API Configuration
 *
 * Development (Docker): Leave as '/api' — Nginx proxies all /api/ requests
 *                        to the Django backend container automatically.
 *
 * Production (Vercel):  Set this to your full DigitalOcean backend URL,
 *                       e.g. "https://your-backend.digitalocean.com"
 *                       The Vercel deployment has no Nginx proxy, so an
 *                       absolute URL is required.
 *
 * ⚠️  Before deploying to Vercel, update the value below to point to your
 *     DigitalOcean server.  See DEPLOY.md for full instructions.
 */

window.API_BASE_URL = 'https://api.aurahealthcare.tech'; // ← Pega aquí la URL de DigitalOcean para Vercel: 'https://tu-backend.com'
