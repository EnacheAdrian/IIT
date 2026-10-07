/* =========================================================
   PORTOFOLIU — editați aici proiectele afișate pe site
   ---------------------------------------------------------
   Câmpuri pentru fiecare clip:

   title     – titlul clipului (în română)
   titleEn   – (opțional) titlul în engleză, afișat când site-ul este pe EN;
               dacă lipsește, se folosește "title"
   creator   – numele / handle-ul creatorului
   category  – una dintre: "shorts" | "highlights" | "compilatii" | "youtube"
   format    – "vertical" (9:16, shorts) sau "horizontal" (16:9)
   platform  – eticheta din colțul cardului (ex: "TikTok", "YouTube")
   views     – numărul de vizualizări afișat (text liber, ex: "1.2M")
   duration  – durata afișată (ex: "0:42")

   youtube   – (opțional) ID-ul video-ului de YouTube. Exemple:
                 https://www.youtube.com/watch?v=dQw4w9WgXcQ  ->  "dQw4w9WgXcQ"
                 https://youtube.com/shorts/abc123XYZ         ->  "abc123XYZ"
   video     – (opțional) cale către un fișier video local, ex: "assets/videos/clip1.mp4"
               (pe card rulează un preview fără sunet la hover)
   thumb     – (opțional) cale către o imagine thumbnail, ex: "assets/img/clip1.jpg"

   hook, hue – folosite doar când NU există "thumb": se generează automat
               un thumbnail animat cu textul "hook" și nuanța "hue" (0–360).
   hookEn    – (opțional) textul "hook" în engleză; dacă lipsește, se folosește "hook"

   Restul textelor din portofoliu (categorii, „vizualizări”) se traduc în
   assets/js/i18n.js, în I18N.ui.

   Clipurile de mai jos sunt EXEMPLE. Înlocuiți-le cu proiectele voastre.
   ========================================================= */

window.PORTFOLIO = [
  {
    title: 'Clutch 1v4 în ultima rundă',
    titleEn: '1v4 clutch in the final round',
    creator: '@exemplu.fps',
    category: 'shorts',
    format: 'vertical',
    platform: 'TikTok',
    views: '2.1M',
    duration: '0:38',
    hook: '1v4 clutch',
    hookEn: '1v4 clutch',
    hue: 265,
    youtube: '',
    video: '',
    thumb: ''
  },
  {
    title: 'Cele mai tari momente din stream-ul de 12 ore',
    titleEn: 'The best moments from a 12-hour stream',
    creator: '@exemplu.live',
    category: 'highlights',
    format: 'horizontal',
    platform: 'YouTube',
    views: '480K',
    duration: '14:22',
    hook: 'Stream de 12 ore',
    hookEn: '12-hour stream',
    hue: 200
  },
  {
    title: 'Reacția la donația de 1000€',
    titleEn: 'Reacting to a €1,000 donation',
    creator: '@exemplu.irl',
    category: 'shorts',
    format: 'vertical',
    platform: 'Shorts',
    views: '3.4M',
    duration: '0:29',
    hook: 'Nu se poate',
    hookEn: 'No way',
    hue: 20
  },
  {
    title: 'Best of — luna martie',
    titleEn: 'Best of — March',
    creator: '@exemplu.gaming',
    category: 'compilatii',
    format: 'horizontal',
    platform: 'YouTube',
    views: '1.3M',
    duration: '18:05',
    hook: 'Best of martie',
    hookEn: 'Best of March',
    hue: 330
  },
  {
    title: 'Am construit o bază în 100 de zile',
    titleEn: 'I built a base in 100 days',
    creator: '@exemplu.survival',
    category: 'youtube',
    format: 'horizontal',
    platform: 'YouTube',
    views: '920K',
    duration: '24:10',
    hook: '100 de zile',
    hookEn: '100 days',
    hue: 140
  },
  {
    title: 'Rage quit legendar',
    titleEn: 'Legendary rage quit',
    creator: '@exemplu.fps',
    category: 'shorts',
    format: 'vertical',
    platform: 'Reels',
    views: '1.8M',
    duration: '0:21',
    hook: 'Rage quit',
    hookEn: 'Rage quit',
    hue: 350
  },
  {
    title: 'Chatul a decis finalul',
    titleEn: 'Chat decided the ending',
    creator: '@exemplu.live',
    category: 'highlights',
    format: 'vertical',
    platform: 'TikTok',
    views: '640K',
    duration: '0:52',
    hook: 'Chatul decide',
    hookEn: 'Chat decides',
    hue: 185
  },
  {
    title: 'Top 20 fail-uri din comunitate',
    titleEn: 'Top 20 community fails',
    creator: '@exemplu.gaming',
    category: 'compilatii',
    format: 'horizontal',
    platform: 'YouTube',
    views: '760K',
    duration: '11:47',
    hook: 'Top 20 fail-uri',
    hookEn: 'Top 20 fails',
    hue: 45
  },
  {
    title: 'Turneul de 10.000€ — rezumatul finalei',
    titleEn: '€10,000 tournament — grand final recap',
    creator: '@exemplu.esports',
    category: 'highlights',
    format: 'horizontal',
    platform: 'Twitch',
    views: '1.1M',
    duration: '9:58',
    hook: 'Marea finală',
    hookEn: 'Grand final',
    hue: 225
  },
  {
    title: 'Speedrun record personal',
    titleEn: 'Personal best speedrun',
    creator: '@exemplu.speed',
    category: 'shorts',
    format: 'vertical',
    platform: 'Shorts',
    views: '2.7M',
    duration: '0:44',
    hook: 'Record nou',
    hookEn: 'New record',
    hue: 95
  },
  {
    title: 'Vlog: prima mea convenție de gaming',
    titleEn: 'Vlog: my first gaming convention',
    creator: '@exemplu.vlog',
    category: 'youtube',
    format: 'horizontal',
    platform: 'YouTube',
    views: '310K',
    duration: '16:33',
    hook: 'Vlog convenție',
    hookEn: 'Convention vlog',
    hue: 290
  },
  {
    title: 'Momente amuzante — săptămâna 12',
    titleEn: 'Funny moments — week 12',
    creator: '@exemplu.irl',
    category: 'compilatii',
    format: 'vertical',
    platform: 'TikTok',
    views: '540K',
    duration: '0:58',
    hook: 'Funny moments',
    hookEn: 'Funny moments',
    hue: 310
  }
];
