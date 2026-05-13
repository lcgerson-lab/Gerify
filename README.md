# Gerify

Reproductor de música vía YouTube Data API v3.

## Setup

```bash
npm install
npm run dev
```

## API Key

Edita `src/constants.js` y reemplaza `YT_API_KEY`:

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea proyecto → habilita **YouTube Data API v3**
3. Credenciales → **Crear API Key**

## Deploy en Vercel

1. Sube este repo a GitHub
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo
3. Framework: **Vite** — Vercel lo detecta automáticamente
4. **Deploy** — listo

El archivo `vercel.json` ya maneja el routing SPA.
