import io
import re
import sys
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
html = urllib.request.urlopen("https://www.loomsoriginal.com/", timeout=20).read().decode("utf-8", errors="replace")
body = re.sub(r"<head[\s\S]*?</head>", "", html)
body = re.sub(r"<script[\s\S]*?</script>", "", body)
body = re.sub(r"<!--[\s\S]*?-->", "", body)
text = re.sub(r"<[^>]+>", " ", body)
text = re.sub(r"\s+", " ", text).strip()

print("UF en hero:", "Uniendo Familias con Manuel Solís" in text)
print("Lourdes:", "Lourdes" in text)
print("Eva López:", "Eva López" in text)
print("Juana Cervantes:", "Juana Cervantes" in text)
print("\nOtras series visibles en rails:")
for t in ["Testimonios Reales", "Guía Migratoria", "En Vivo y Podcasts", "El Bufete", "Historias Cortas", "Explora todas las series"]:
    print(f"  · {t}: {t in text}")
