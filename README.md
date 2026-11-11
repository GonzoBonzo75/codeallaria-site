# codeallaria-site

Sito vetrina di [www.codeallaria.com](https://www.codeallaria.com), in HTML e CSS semplici, pubblicato con GitHub Pages.

## Struttura

- `index.html`: pagina principale (logo, scritta "Stiamo Arrivando" e fascia a tutta larghezza con foto di cani che si alternano, solo CSS)
- `404.html`: pagina di errore
- `css/style.css`: stili
- `fonts/`: Quicksand 300 (licenza SIL OFL), inclusa nel sito
- `images/`: logo (`logo.jpg`), versione quadrata per icona e anteprime (`logo-quadrato.jpg`) e foto della fascia (`slide-N-1920.jpg` / `slide-N-960.jpg`)
- `CNAME`: dominio personalizzato per GitHub Pages
- `.nojekyll`: disattiva l'elaborazione Jekyll

## Crediti foto

Le foto della fascia sono pubblicate su [Unsplash](https://unsplash.com) con licenza Unsplash (uso libero, anche commerciale; l'attribuzione non è obbligatoria ma è riportata qui):

1. Joe Caione ([@joeyc](https://unsplash.com/@joeyc)), [foto](https://unsplash.com/photos/19889db9621e)
2. Richard Laursen ([@richard1975](https://unsplash.com/@richard1975)), [foto](https://unsplash.com/photos/5686aa34cf75)
3. Alvan Nee ([@alvannee](https://unsplash.com/@alvannee)), [foto](https://unsplash.com/photos/2b0866ed4223)
4. Alvan Nee ([@alvannee](https://unsplash.com/@alvannee)), [foto](https://unsplash.com/photos/765934785570)
5. Sue Winston ([@winniepix](https://unsplash.com/@winniepix)), [foto](https://unsplash.com/photos/db4a9b78f4ce)

## Anteprima in locale

```
python3 -m http.server 8000
```

Poi apri http://localhost:8000.

## Pubblicazione

GitHub Pages è configurato sul branch `main`, cartella radice. Ogni push su `main` aggiorna il sito.
