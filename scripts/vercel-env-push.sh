#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Sube las env vars de Loom Originals a Vercel (Production + Preview).
# Requiere:  npm i -g vercel && vercel login && vercel link
# Uso:       bash scripts/vercel-env-push.sh
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "✗ vercel CLI no instalado. Corre:  npm i -g vercel && vercel login"
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "✗ No encontré .env.local en $(pwd)"
  exit 1
fi

# Lee .env.local ignorando comentarios y líneas vacías
keys=(
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ADMIN_EMAILS
)

optional=(
  NEXT_PUBLIC_GA_ID
  NEXT_PUBLIC_META_PIXEL_ID
  NEXT_PUBLIC_TIKTOK_PIXEL_ID
  NEXT_PUBLIC_GSC_VERIFICATION
  YOUTUBE_API_KEY
)

push_key() {
  local name="$1"
  local value
  value=$(grep -E "^${name}=" .env.local | head -n1 | cut -d'=' -f2- || true)
  if [ -z "${value}" ]; then
    echo "· ${name} vacío — se salta"
    return
  fi
  echo "→ ${name}"
  for env in production preview development; do
    # vercel env rm es idempotente (falla si no existe, lo ignoramos)
    printf 'y\n' | vercel env rm "${name}" "${env}" >/dev/null 2>&1 || true
    printf '%s\n' "${value}" | vercel env add "${name}" "${env}" >/dev/null
  done
}

for k in "${keys[@]}"; do push_key "$k"; done
for k in "${optional[@]}"; do push_key "$k"; done

echo ""
echo "✓ Listo. Corre 'vercel --prod' para redeploy con las nuevas vars."
