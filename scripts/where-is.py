import io
import re
import sys
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

url = "https://www.loomsoriginal.com/series/uniendo-familias-manuel-solis/t1/el-abrazo-que-espero-18-anos"
html = urllib.request.urlopen(
    urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=20
).read().decode("utf-8", errors="replace")

for needle in ["Lourdes", "Página no encontrada", "Reproducir T1", "font-display text-6xl italic"]:
    print(f"===== {needle} =====")
    for m in re.finditer(re.escape(needle), html):
        i = m.start()
        pre = html[:i]
        script_start = pre.rfind("<script")
        script_end = pre.rfind("</script>")
        in_script = script_start > script_end
        meta = "<meta" in pre[max(0, i - 400):i] and ">" not in pre[pre.rfind("<meta"):i] if "<meta" in pre else False
        head_end = pre.rfind("</head>")
        in_head = head_end < 0
        print(f"  position {i}  in_script={in_script}  in_head={in_head}")
        ctx = html[max(0, i - 80):i + 120].replace("\n", " ")
        print(f"  ...{ctx}...")
    print()
