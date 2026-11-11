# codeallaria-site

Sito vetrina di [www.codeallaria.com](https://www.codeallaria.com), in HTML e CSS semplici, pubblicato con GitHub Pages.

## Struttura

- `index.html`: pagina principale
- `404.html`: pagina di errore
- `css/style.css`: stili
- `CNAME`: dominio personalizzato per GitHub Pages
- `.nojekyll`: disattiva l'elaborazione Jekyll

## Anteprima in locale

```
python3 -m http.server 8000
```

Poi apri http://localhost:8000.

## Pubblicazione

GitHub Pages è configurato sul branch `main`, cartella radice. Ogni push su `main` aggiorna il sito.
