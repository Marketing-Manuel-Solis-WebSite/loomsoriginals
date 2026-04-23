import io
import re
import sys
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

url = sys.argv[1] if len(sys.argv) > 1 else "https://www.loomsoriginal.com/series/uniendo-familias-manuel-solis/t1/el-abrazo-que-espero-18-anos"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", errors="replace")

# Visible text inside <main>
m = re.search(r"<main[^>]*>(.*?)</main>", html, re.DOTALL)
body = m.group(1) if m else ""
body = re.sub(r"<script[\s\S]*?</script>", "", body)
body = re.sub(r"<template[^>]*></template>", "", body)
body = re.sub(r"<!--[\s\S]*?-->", "", body)
text = re.sub(r"<[^>]+>", " ", body)
text = re.sub(r"\s+", " ", text).strip()
print("--- visible <main> text (truncated) ---")
print(text[:800])
print()
print("--- status of key signals ---")
print(f"Has 'Página no encontrada': {'Página no encontrada' in text}")
print(f"Has '404': {'404' in text}")
print(f"Has 'Lourdes' or 'Eva' or 'Juana': {any(w in text for w in ['Lourdes','Eva López','Juana Cervantes'])}")
print(f"Has 'Reproducir': {'Reproducir' in text}")
