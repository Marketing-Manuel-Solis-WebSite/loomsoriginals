# Loom Originals — Project Status

Snapshot al 23-abr-2026 del estado tras la primera fase de build. Este documento es el manifiesto operativo — consúltelo antes de cualquier tarea de deploy.

## Lo que funciona (compilado y verificado)

- `npm run build` pasa sin errores (Next 16.2 + TypeScript strict).
- `npx tsc --noEmit` pasa sin errores.
- 28 rutas generadas (7 estáticas, 21 dinámicas).
- Design system completo: Fraunces + Inter, paleta navy + dorado, glassmorphism, micro-animaciones ease-apple.
- Homepage con hero rotativo, rails horizontales, empty state.
- Páginas de serie, episodio (con player custom de YouTube IFrame), categorías, búsqueda, legales, acerca, contacto.
- Auth con Supabase: magic link + Google OAuth, `proxy.ts` con guardias, callback, signout.
- "Mi lista" (favoritos) + "Continuar viendo" (watch_history con progreso).
- Panel de admin completo: dashboard, CRUD de series y episodios, analíticas con Recharts.
- SEO: sitemap.xml dinámico, robots.txt, RSS en /feed.xml, JSON-LD (Organization, WebSite, TVSeries, TVEpisode, VideoObject, BreadcrumbList).
- OG images estáticas (fallback) + dinámicas por episodio en `/api/og/[episodeId]`.
- Twitter Player Card con endpoint `/embed/[episodeId]`.
- Tracking: GA4 + Meta Pixel + TikTok Pixel + logs en Supabase (video_events, cta_clicks).
- CTA a manuelsolis.com con UTMs (contextual por categoría de episodio).
- CSP endurecido en vercel.json que permite YouTube, Supabase, GA, Meta, TikTok.
- Mobile scaffold en `../looms-mobile/` (Expo SDK 54 + expo-router + Supabase + YouTube iframe).

## Lo que falta: APIs y configuración

> Todas las demás piezas de código ya están. Este proyecto necesita únicamente las claves de terceros + la carga inicial de datos para estar vivo en producción.

### 1. Supabase — OBLIGATORIO antes del primer render con datos

1. Crear proyecto en <https://supabase.com/dashboard>, región **us-east-1**.
2. SQL Editor → ejecutar en orden:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_indexes.sql`
   - `supabase/seed.sql` (opcional, trae 8 episodios de ejemplo en español sobre inmigración)
3. Authentication → Providers:
   - Email → habilitar "Magic Link" (ya viene por default).
   - Google → crear OAuth client en Google Cloud Console; redirect: `https://<project-ref>.supabase.co/auth/v1/callback`. Pegar client_id + client_secret.
4. Authentication → URL Configuration:
   - **Site URL**: `https://loomsoriginal.com`
   - **Redirect URLs**: pegar:
     ```
     https://loomsoriginal.com/**
     http://localhost:3000/**
     looms://**
     ```
5. Storage → bucket nuevo llamado `media`, público en lectura.
6. Anotar de Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret key` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Variables de entorno

`.env.local.example` lista todas. Obligatorias para producción:

```
NEXT_PUBLIC_SITE_URL=https://loomsoriginal.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=carlos@manuelsolis.com,manuel@manuelsolis.com
```

Opcionales (se pueden agregar después):

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=...
NEXT_PUBLIC_TIKTOK_PIXEL_ID=...
NEXT_PUBLIC_GSC_VERIFICATION=...
YOUTUBE_API_KEY=...
```

### 3. YouTube (sin código)

- Subir cada episodio al canal como **público** (recomendado — suma descubrimiento en YouTube) o **no listado** (sólo desde Loom).
- Copiar el Video ID (11 caracteres tras `?v=`) y pegarlo en `/admin/episodios/<id>` en el campo "YouTube Video ID".
- La miniatura se toma automáticamente de `i.ytimg.com/vi/<id>/maxresdefault.jpg`.

### 4. Google Analytics 4

- Crear propiedad **nueva** (distinta de la de manuelsolis.com, para no mezclar funnels).
- Data Streams → Web → copiar `Measurement ID` (formato `G-XXXXXXXXXX`) → `NEXT_PUBLIC_GA_ID`.
- Configurar eventos de conversión recomendados:
  - `cta_click_consultation` (creado automáticamente por el código cuando el usuario toca la CTA al Bufete)
  - `video_complete`
  - `video_play`
  - `conversion` (enviado sólo cuando `cta_type=consultation`)

### 5. Meta Pixel (opcional, recomendado si se hará paid social)

- Business Suite → Events Manager → nuevo pixel.
- Pegar el ID en `NEXT_PUBLIC_META_PIXEL_ID`.
- Eventos que dispara el código:
  - `PageView` (automático en cada navegación)
  - `Lead` (al hacer clic en CTA de consulta)
  - `VideoComplete` (custom event)

### 6. TikTok Pixel (opcional)

- TikTok Ads Manager → Assets → Events → Web Events.
- Copiar el sdkid → `NEXT_PUBLIC_TIKTOK_PIXEL_ID`.

### 7. Vercel

1. Importar repo al proyecto `AdminManuelSolis`.
2. Framework: Next.js (auto-detectado).
3. **Settings → Environment Variables**: pegar TODO lo de `.env.local.example` con valores reales, para `Production` y `Preview`.
4. **Settings → Domains**: añadir `loomsoriginal.com` y `www.loomsoriginal.com` (redirigir www → apex).
5. **Analytics + Speed Insights**: habilitar (gratis en Hobby/Pro).
6. Primer deploy: `git push` a `main`.

### 8. Google Search Console + Bing Webmaster

Después del primer deploy:

- Search Console → Add property (Domain property para `loomsoriginal.com`).
- Verificar por DNS TXT.
- Submit sitemap: `https://loomsoriginal.com/sitemap.xml`.
- Mismo flujo en Bing Webmaster (importa directo desde GSC).

### 9. Redes sociales (cuentas)

Crear handles `@loomoriginals` en:
- YouTube (o usar el canal existente del Bufete con branding dual)
- Instagram
- TikTok
- Facebook

Actualizar las URLs correspondientes en `src/lib/site.ts` (ya tienen valores placeholder que apuntan al canal del bufete).

### 10. Link juice desde manuelsolis.com

Para que la autoridad de dominio del bufete empuje al dominio nuevo:
- Agregar un link contextual en 3 páginas del bufete hacia `loomsoriginal.com` con anchor text natural.
- Agregar un link a Loom Originals en el footer del sitio principal.

### 11. Mobile (Expo)

Antes de publicar en stores:
- `eas login && eas build:configure` → reemplaza `REPLACE_WITH_EAS_PROJECT_ID` en `looms-mobile/app.json`.
- Subir secrets de Supabase con `eas secret:create ...`.
- Iconos: `assets/icon.png` (1024x1024), `assets/adaptive-icon.png` (1024x1024), `assets/splash.png` (1284x2778).

## Riesgos conocidos

- **Supabase `Database` type**: escrito a mano en `src/lib/supabase/types.ts`. Si se cambia el schema en Supabase, regenerar manualmente (o instalar Supabase CLI local y correr `supabase gen types typescript`).
- **YouTube IDs del seed** son placeholder (`PLACEHOLDER_EP1`, etc.). El player intentará cargarlos y fallará. Reemplazar antes de demo pública.
- **i18n**: el switcher ES/EN en el navbar enlaza a `/en/...` pero aún no existen esos routes (la base está lista — los campos `title_en`, `synopsis_en`, `transcript_en` en la BD ya existen, y next-intl está instalado). Para agregar rutas en inglés basta con duplicar las carpetas de `(public)/` bajo `/en/` o refactorizar a `src/app/[locale]/` — ninguno rompe lo existente.

## Verificación local rápida (check-list de humo)

```bash
npm run build        # debe pasar
npm run dev          # abrir http://localhost:3000
# sin .env → empty state visible, sin crashes
# con .env + seed → hero, rails, admin funcionales
```

## Métricas al día 1 del lanzamiento

Recomiendo monitorear semanalmente:
- Indexación: rich results test de 1 episodio aleatorio por semana.
- Top-10 consultas en GSC, comparar con los clusters del plan SEO.
- Tasa de `cta_click_consultation / video_play` como proxy de eficiencia del funnel editorial→legal.
