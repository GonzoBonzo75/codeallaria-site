#!/usr/bin/env python3
"""Genera le pagine del blog a partire dagli articoli in content/blog/*.md.

Uso:  python3 tools/build_blog.py

Produce:
  - blog.html                 elenco degli articoli
  - blog/<nome>.html          una pagina per ogni articolo
  - images/blog-web/*.jpg     copie ridimensionate delle foto (per non appesantire il sito)
  - sitemap.xml               (sezione tra i commenti BLOG-START / BLOG-END)

Gli articoli con "draft: true" non vengono pubblicati.
Servono i pacchetti: markdown, pyyaml, pillow.
"""
import datetime
import html
import re
import sys
from pathlib import Path

import markdown
import yaml
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "blog"
OUT_DIR = ROOT / "blog"
WEB_IMG = ROOT / "images" / "blog-web"
SITE = "https://www.codeallaria.com"
MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio",
        "agosto", "settembre", "ottobre", "novembre", "dicembre"]

NAV = [("/", "Home"), ("/pilastri.html", "I punti fermi"), ("/percorsi.html", "I nostri percorsi"),
       ("/storia.html", "La nostra storia"), ("/staff.html", "Lo staff"), ("/blog.html", "Blog"),
       ("/contatti.html", "Contatti")]

THEME_TOGGLE = ('<button class="theme-toggle" type="button" aria-label="Attiva la versione scura" aria-pressed="false">'
                '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2z"/></svg>'
                '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/>'
                '<path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg></button>')

SCROLL_SCRIPT = """  <script>
    (function () {
      var main = document.querySelector(".pillars-storia");
      var frame = document.querySelector(".storia-text");
      if (!main || !frame) return;
      main.addEventListener("wheel", function (e) {
        if (frame.contains(e.target)) return;
        frame.scrollTop += e.deltaY;
      }, { passive: true });
    })();
  </script>"""


def esc(s):
    return html.escape(str(s), quote=True)


def parse_post(path):
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", raw, re.S)
    if not m:
        print(f"[saltato] {path.name}: manca l'intestazione tra '---'", file=sys.stderr)
        return None
    meta = yaml.safe_load(m.group(1)) or {}
    body = m.group(2).strip()
    if "body" in meta and not body:  # alcuni editor mettono il testo nell'intestazione
        body = str(meta["body"])
    if meta.get("draft"):
        return None
    title = str(meta.get("title") or path.stem).strip()
    d = meta.get("date")
    if isinstance(d, datetime.datetime):
        d = d.date()
    elif isinstance(d, str):
        try:
            d = datetime.date.fromisoformat(d[:10])
        except ValueError:
            d = datetime.date.today()
    elif not isinstance(d, datetime.date):
        d = datetime.date.today()
    return {
        "slug": path.stem,
        "title": title,
        "date": d,
        "image": (meta.get("image") or "").strip() if isinstance(meta.get("image"), str) else "",
        "alt": str(meta.get("image_alt") or "").strip(),
        "summary": str(meta.get("summary") or "").strip(),
        "body": body,
    }


def it_date(d):
    return f"{d.day} {MESI[d.month - 1]} {d.year}"


def web_image(src, width):
    """Per le foto in /images/blog/ crea una copia ridimensionata e ne restituisce l'indirizzo."""
    if not src.startswith("/images/blog/"):
        return src, None
    original = ROOT / src.lstrip("/")
    if not original.exists():
        return src, None
    WEB_IMG.mkdir(parents=True, exist_ok=True)
    target = WEB_IMG / f"{original.stem}-{width}.jpg"
    if (not target.exists()) or target.stat().st_mtime < original.stat().st_mtime:
        with Image.open(original) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "L"):
                bg = Image.new("RGB", im.size, (255, 255, 255))
                bg.paste(im, mask=im.convert("RGBA").split()[-1])
                im = bg
            im = im.convert("RGB")
            if im.width > width:
                im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
            im.save(target, "JPEG", quality=82, optimize=True, progressive=True)
    with Image.open(target) as t:
        size = t.size
    return "/images/blog-web/" + target.name, size


def render_body(md_text):
    out = markdown.markdown(md_text, extensions=["extra", "sane_lists", "smarty"])

    def fix_img(m):
        tag = m.group(0)
        src = re.search(r'src="([^"]+)"', tag)
        if not src:
            return tag
        new, size = web_image(src.group(1), 1200)
        tag = tag.replace(src.group(0), f'src="{new}"')
        if size and "width=" not in tag:
            tag = tag.replace("<img ", f'<img width="{size[0]}" height="{size[1]}" ', 1)
        if "loading=" not in tag:
            tag = tag.replace("<img ", '<img loading="lazy" ', 1)
        return tag

    out = re.sub(r"<img [^>]*>", fix_img, out)
    # i link esterni si aprono in una nuova scheda
    out = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', out)
    return out


def page(title, description, canonical, og_image, body_html, active, og_type="website"):
    ACT = ' class="active" aria-current="page"'
    nav = "\n".join(
        '      <a%s href="%s">%s</a>' % (ACT if href == active else "", href, label)
        for href, label in NAV)
    return f"""<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">
  <link rel="canonical" href="{canonical}">
  <link rel="icon" type="image/jpeg" href="/images/logo-quadrato.jpg">
  <meta property="og:type" content="{og_type}">
  <meta property="og:locale" content="it_IT">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{og_image}">
  <link rel="preload" as="font" type="font/woff2" href="/fonts/playfair-display-700.woff2" crossorigin>
  <script>try{{if(localStorage.getItem("theme")==="dark")document.documentElement.setAttribute("data-theme","dark")}}catch(e){{}}</script>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body class="page-light">
  <header class="site-header">
    <a class="brand" href="/" aria-label="Code all'Aria - Home">
      <img class="logo-light" src="/images/logo.jpg" width="1489" height="835" alt="Logo Code all'Aria - Crescere Insieme, Percorsi Evolutivi per Cani">
      <img class="logo-dark" src="/images/logo-scuro.png" width="800" height="449" alt="" aria-hidden="true">
    </a>
    <nav class="nav" id="menu-principale" aria-label="Menu principale">
{nav}
      <a class="nav-prenota" href="#prenota" data-booking>Prenota ora</a>
    </nav>
    <a class="btn btn-orange btn-small header-prenota" href="#prenota" data-booking>Prenota ora</a>
    {THEME_TOGGLE}
    <a class="lang-toggle" href="/en/" hreflang="en" lang="en" aria-label="Read the site in English" title="English">EN</a>
    <button class="nav-toggle" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu-principale"><span></span><span></span><span></span></button>
  </header>

{body_html}
  <footer class="site-footer">
    <p>Code all'Aria - tutti i diritti riservati - 2026</p>
  </footer>
{SCROLL_SCRIPT}
  <script src="/js/nav.js" defer></script>
  <script src="/js/booking.js" defer></script>
</body>
</html>
"""


def build_list(posts):
    if posts:
        cards = []
        for p in posts:
            thumb = ""
            if p["image"]:
                src, size = web_image(p["image"], 600)
                dims = f' width="{size[0]}" height="{size[1]}"' if size else ""
                thumb = f'<img class="blog-thumb" src="{esc(src)}"{dims} alt="" loading="lazy">'
            summary = f'<span class="blog-summary">{esc(p["summary"])}</span>' if p["summary"] else ""
            cards.append(f"""          <li>
            <a class="blog-card" href="/blog/{p['slug']}.html">
              {thumb}
              <span class="blog-card-text">
                <time datetime="{p['date'].isoformat()}">{it_date(p['date'])}</time>
                <strong>{esc(p['title'])}</strong>
                {summary}
              </span>
            </a>
          </li>""")
        content = '        <ul class="blog-list">\n' + "\n".join(cards) + "\n        </ul>"
    else:
        content = '        <p class="blog-vuota">Stiamo preparando i primi articoli: torna a trovarci presto.</p>'
    body = f"""  <main class="pillars pillars-prato pillars-storia pillars-blog">
    <div class="pillars-inner">
      <h1>Il blog</h1>
      <span class="divider" aria-hidden="true"></span>
      <div class="storia-text blog-frame" tabindex="0" role="region" aria-label="Elenco degli articoli">
{content}
      </div>
    </div>
  </main>"""
    return page("Il blog - Code all'Aria",
                "Storie, consigli e novità dal mondo di Code all'Aria: educazione cinofila, percorsi e vita con i cani.",
                f"{SITE}/blog.html", f"{SITE}/images/logo-quadrato.jpg", body, "/blog.html")


def build_post(p):
    cover = ""
    og = f"{SITE}/images/logo-quadrato.jpg"
    if p["image"]:
        src, size = web_image(p["image"], 1200)
        dims = f' width="{size[0]}" height="{size[1]}"' if size else ""
        cover = f'<img class="blog-cover" src="{esc(src)}"{dims} alt="{esc(p["alt"])}">'
        og = SITE + src if src.startswith("/") else src
    desc = p["summary"] or re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", render_body(p["body"])))[:160].strip()
    body = f"""  <main class="pillars pillars-prato pillars-storia pillars-blog pillars-articolo">
    <div class="pillars-inner">
      <h1>{esc(p['title'])}</h1>
      <span class="divider" aria-hidden="true"></span>
      <div class="storia-text blog-post" tabindex="0" role="region" aria-label="{esc(p['title'])}">
        <p class="blog-meta"><a href="/blog.html">&larr; Tutti gli articoli</a><span aria-hidden="true"> · </span><time datetime="{p['date'].isoformat()}">{it_date(p['date'])}</time></p>
        {cover}
        <div class="blog-body">
{render_body(p['body'])}
        </div>
        <p class="blog-back"><a class="btn btn-orange btn-small" href="/blog.html">Tutti gli articoli</a></p>
      </div>
    </div>
  </main>"""
    return page(f"{p['title']} - Code all'Aria", desc, f"{SITE}/blog/{p['slug']}.html", og, body,
                "/blog.html", og_type="article")


def update_sitemap(posts):
    sm = ROOT / "sitemap.xml"
    text = sm.read_text(encoding="utf-8")
    urls = [f"{SITE}/blog.html"] + [f"{SITE}/blog/{p['slug']}.html" for p in posts]
    block = "  <!-- BLOG-START -->\n" + "".join(
        f"  <url>\n    <loc>{u}</loc>\n  </url>\n" for u in urls) + "  <!-- BLOG-END -->\n"
    if "<!-- BLOG-START -->" in text:
        text = re.sub(r"  <!-- BLOG-START -->.*?<!-- BLOG-END -->\n", lambda _: block, text, flags=re.S)
    else:
        text = text.replace("</urlset>", block + "</urlset>")
    sm.write_text(text, encoding="utf-8")


def main():
    posts = []
    for f in sorted(CONTENT.glob("*.md")):
        p = parse_post(f)
        if p:
            posts.append(p)
    posts.sort(key=lambda p: (p["date"], p["slug"]), reverse=True)

    OUT_DIR.mkdir(exist_ok=True)
    keep = set()
    for p in posts:
        (OUT_DIR / f"{p['slug']}.html").write_text(build_post(p), encoding="utf-8")
        keep.add(f"{p['slug']}.html")
    for old in OUT_DIR.glob("*.html"):
        if old.name not in keep:
            old.unlink()
    (ROOT / "blog.html").write_text(build_list(posts), encoding="utf-8")
    update_sitemap(posts)
    print(f"Blog: {len(posts)} articoli pubblicati")


if __name__ == "__main__":
    main()
