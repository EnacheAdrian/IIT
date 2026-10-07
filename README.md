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
| Limbi | comutator RO / EN în header, cu indicator animat și cortină la schimbarea limbii; titlurile, subtitrările și cuvintele rotative se reanimă în noua limbă |
| Global | cursor personalizat, bară de progres la scroll, header care se ascunde, fundal animat cu grain, butoane magnetice |

Respectă setarea **„reduce motion”** din sistem (animațiile se opresc) iar fără JavaScript textele rămân vizibile (doar grila de portofoliu are nevoie de JavaScript).

## Structură

```
index.html                 – tot conținutul paginii
assets/css/style.css       – stiluri și animații (culorile în :root, sus)
assets/js/main.js          – interacțiuni și animații
assets/js/i18n.js          – textele în engleză (versiunea EN a site-ului)
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

## Limbi (RO / EN)

Site-ul are două limbi: **română** și **engleză**. În header (și pe mobil, lângă butonul de meniu) există comutatorul **RO / EN**; la click, o cortină animată acoperă ecranul, textele se schimbă și cortina se retrage. Alegerea vizitatorului este reținută în browser (`localStorage`, cheia `cliplab-lang`).

### Unde sunt textele

- **Română** – direct în `index.html` (sursa principală, ca până acum). Excepție: textele generate din JavaScript (cuvintele rotative din hero, subtitrările animate, mesajele formularului) stau în `assets/js/i18n.js`, în `I18N.ui.ro`.
- **Engleză** – în `assets/js/i18n.js`, în obiectul `window.I18N`:
  - `I18N.en` – textele din pagină. Fiecare element tradus din `index.html` are o cheie:
    - `data-i18n="services.title"` → se traduce conținutul elementului (poate conține HTML simplu: `<strong>`, `<em>`, `<br>`, `<a class="link">`);
    - `data-i18n-attr="aria-label:nav.logo; title:cheie2"` → se traduc atribute (`aria-label`, `title`, `placeholder`, `alt`, `value`, `content`, `data-cursor`).
  - `I18N.ui.ro` / `I18N.ui.en` – textele generate din JavaScript: cuvintele rotative din hero (`words.hero`), subtitrările animate (`captions.editor`, `captions.phone`), categoriile din portofoliu, „vizualizări”, mesajele formularului, subiectul și etichetele emailului precompletat, formatul numerelor (`locale`). Textele `{intre_acolade}` sunt înlocuite automat.

### Cum modific un text

1. Găsiți elementul în `index.html` și citiți-i cheia (`data-i18n="..."`).
2. Textul **în română** se modifică direct în `index.html`.
3. Textul **în engleză** se modifică în `assets/js/i18n.js`, la aceeași cheie din `I18N.en`.

### Cum adaug un element nou tradus

1. În `index.html` puneți pe element `data-i18n="sectiune.cheie-noua"` (elementul trebuie să conțină **doar text** și formatare simplă – fără iconițe SVG sau câmpuri de formular; dacă textul stă lângă o iconiță, puneți-l într-un `<span data-i18n="...">`).
2. În `assets/js/i18n.js`, în `I18N.en`, adăugați `'sectiune.cheie-noua': 'Textul în engleză'`.
3. La titlurile mari animate (`data-split`), păstrați cuvintele evidențiate în `<em>...</em>` și în varianta engleză.

Dacă o cheie lipsește din `I18N.en`, se afișează textul în română, iar consola browserului arată un avertisment cu cheile lipsă.

### Portofoliul în engleză

În `assets/js/portfolio-data.js`, fiecare clip poate avea `titleEn` (titlul în engleză) și `hookEn` (textul de pe thumbnail-ul generat). Dacă lipsesc, se folosesc `title` și `hook`.

### Limba la prima vizită

În `assets/js/i18n.js`:

- `autoDetect: true` – vizitatorii al căror browser **nu** este în română văd site-ul în engleză; cei cu browserul în română îl văd în română. Cu `false`, toată lumea pornește în `defaultLang`.
- `defaultLang: 'ro'` – limba folosită când limba browserului nu poate fi detectată (sau când `autoDetect` este `false`).

Ordinea de alegere: parametrul `?lang=` din link → alegerea salvată a vizitatorului → limba browserului (dacă `autoDetect`) → `defaultLang`.

### Linkuri directe către o limbă

- `https://site-ul-vostru/?lang=en` – deschide site-ul în engleză (util pentru clienți din afara țării, bio-uri, reclame);
- `https://site-ul-vostru/?lang=ro` – îl deschide în română.

Dacă fișierul `assets/js/i18n.js` lipsește (sau are o greșeală de sintaxă) ori JavaScript este dezactivat, site-ul funcționează normal doar în română, iar comutatorul de limbă se ascunde.

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
