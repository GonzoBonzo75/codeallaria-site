# codeallaria-site

Sito vetrina di [www.codeallaria.com](https://www.codeallaria.com), in HTML e CSS semplici, pubblicato con GitHub Pages.

## Struttura

- `index.html`: pagina principale (per ora "Stiamo Arrivando!" con il logo)
- `404.html`: pagina di errore
- `css/style.css`: stili
- `images/`: logo (`logo.jpg`) e versione quadrata per icona e anteprime (`logo-quadrato.jpg`)
- `CNAME`: dominio personalizzato per GitHub Pages
- `.nojekyll`: disattiva l'elaborazione Jekyll

## Anteprima in locale

```
python3 -m http.server 8000
```

Poi apri http://localhost:8000.

## Pubblicazione

GitHub Pages è configurato sul branch `main`, cartella radice. Ogni push su `main` aggiorna il sito.
