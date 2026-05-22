"""Tiny .env loader + env-var helpers for the Loom Originals data scripts.

Stdlib only — no python-dotenv dependency, matching the rest of these scripts
(which use stdlib + openpyxl on purpose).

It reads the project's `.env.local` (repo root) into ``os.environ`` if the file
exists, WITHOUT overriding variables already present in the shell — exported
shell vars always win. Then call :func:`require_env` to fetch a mandatory
variable and fail early with a clear message if it is missing, so a script
never runs against the database with an empty credential.

Usage in a script::

    from _env import require_env

    SUPABASE_URL = require_env("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
    SRK = require_env("SUPABASE_SERVICE_ROLE_KEY")
"""
import os
import sys
from pathlib import Path

# Repo root is the parent of this scripts/ directory.
_ROOT = Path(__file__).resolve().parent.parent
_ENV_FILE = _ROOT / ".env.local"

_loaded = False


def load_env(path: Path = _ENV_FILE) -> None:
    """Populate ``os.environ`` from a .env file. Existing shell vars take precedence.

    Idempotent: only reads the file the first time. Lines may be blank,
    ``# comments``, or ``KEY=VALUE`` (an optional leading ``export`` and
    matching surrounding quotes are stripped).
    """
    global _loaded
    if _loaded:
        return
    _loaded = True
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export ") :]
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        # Strip a single pair of matching surrounding quotes.
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        # Shell wins: don't clobber a var that's already set.
        if key and key not in os.environ:
            os.environ[key] = value


def require_env(*names: str) -> str:
    """Return the first env var set among ``names``; exit cleanly if none are.

    Loads ``.env.local`` first (once). Pass several names to allow fallbacks,
    e.g. ``require_env("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")``.
    """
    load_env()
    for name in names:
        value = os.environ.get(name)
        if value:
            return value
    wanted = " / ".join(names)
    sys.stderr.write(
        f"\n[X] Falta una variable de entorno requerida: {wanted}\n"
        f"    Definela en {_ENV_FILE} (ver .env.local.example) o exportala en\n"
        f"    tu shell antes de correr este script. Abortando para no operar\n"
        f"    contra la base de datos sin credenciales.\n\n"
    )
    raise SystemExit(1)
