# CLIPLAB — site de prezentare și portofoliu

Site de prezentare pentru un studio de editare video (shorts, highlights, compilații, montaj YouTube) pentru streameri și YouTuberi.

Site static (HTML + CSS + JavaScript simplu), **fără build și fără dependențe**: se deschide direct în browser și se poate găzdui gratuit pe GitHub Pages, Netlify, Vercel sau Cloudflare Pages.

## Ce conține

| Secțiune | Animații / interacțiuni |
|---|---|
| Preloader | bară de „render” 0–100% și tranziție de deschidere |
| Hero | titlu cu text rotativ „scramble”, editor video animat (timeline cu playhead, tăieturi, undă audio, subtitrări cuvânt cu cuvânt), telefon cu un short, contoare live, parallax la mouse |
| Benzi | două marquee-uri infinite, înclinate, cu platformele și serviciile |
| Statistici | contoare animate la scroll |
| Servicii | carduri cu tilt 3D, spotlight care urmărește mouse-ul, bordură luminoasă |
| Portofoliu | filtre cu indicator animat, grilă masonry, thumbnail-uri generate automat, preview la hover, modal video (YouTube sau fișier local) |
| Înainte / după | slider care se trage (mouse, touch, tastatură), cu demonstrație automată |
| Proces | scroll orizontal fixat (pe desktop), carduri care se activează pe rând |
| Testimoniale | două rânduri marquee în direcții opuse (pauză la hover) |
| Prețuri | 3 pachete, cel recomandat cu bordură animată |
| FAQ | acordeon animat |
| Contact | formular cu etichete flotante, validare, animație de succes |
| Global | cursor personalizat, bară de progres la scroll, header care se ascunde, fundal animat cu grain, butoane magnetice |

Respectă setarea **„reduce motion”** din sistem (animațiile se opresc) iar fără JavaScript textele rămân vizibile (doar grila de portofoliu are nevoie de JavaScript).

## Structură

```
index.html                 – tot conținutul paginii
assets/css/style.css       – stiluri și animații (culorile în :root, sus)
assets/js/main.js          – interacțiuni și animații
assets/js/portfolio-data.js – lista de clipuri din portofoliu
assets/img/favicon.svg     – iconița site-ului
```

## Personalizare rapidă

1. **Numele firmei** – „CLIPLAB” este provizoriu. Căutați `CLIPLAB` / `CLIP<em>LAB</em>` / `CLIP<span>LAB</span>` în `index.html` și înlocuiți-l.
2. **Date de contact** – emailul (`contact@cliplab.ro`), Discord și linkurile de social media (acum `href="#"`) sunt în `index.html`, secțiunile *Contact* și *Footer*. Actualizați și `data-email` de pe formular.
3. **Portofoliu** – editați `assets/js/portfolio-data.js`. Pentru fiecare clip puneți:
   - `youtube: 'ID'` – ID-ul din link (ex. `youtube.com/watch?v=`**`dQw4w9WgXcQ`** sau `youtube.com/shorts/`**`abc123`**), clipul se va deschide în modal;
   - sau `video: 'assets/videos/clip.mp4'` pentru un fișier propriu (rulează și ca preview la hover);
   - opțional `thumb: 'assets/img/clip.jpg'` pentru o imagine; fără ea se generează automat un thumbnail colorat.
4. **Cifre, testimoniale, prețuri** – sunt **exemple**, marcate în `index.html` cu comentarii `EXEMPLE`. Înlocuiți-le cu date reale.
5. **Culori** – în `assets/css/style.css`, blocul `:root` de la început (`--violet`, `--pink`, `--orange`, `--cyan` etc.).

### Formularul de contact

Implicit, butonul *Trimite* deschide aplicația de email a vizitatorului cu mesajul precompletat. Ca mesajele să ajungă direct în inbox fără server propriu:

1. Creați un formular gratuit pe [Formspree](https://formspree.io) (sau Getform / Basin);
2. Copiați URL-ul primit în `index.html`, pe formular: `data-endpoint="https://formspree.io/f/xxxxxxx"`.

## Rulare locală

Deschideți `index.html` în browser sau porniți un server mic:

```bash
npx serve .
# sau
python3 -m http.server 8080
```

## Publicare

- **GitHub Pages**: *Settings → Pages → Build and deployment → Deploy from a branch*, alegeți ramura și folderul `/ (root)`.
- **Netlify / Cloudflare Pages / Vercel**: importați repository-ul, fără comandă de build, folder de publicare `/`.
