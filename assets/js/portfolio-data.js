/* =========================================================
   PORTOFOLIU — editați aici proiectele afișate pe site
   ---------------------------------------------------------
   Câmpuri pentru fiecare clip:

   title     – titlul clipului
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

   Clipurile de mai jos sunt EXEMPLE. Înlocuiți-le cu proiectele voastre.
   ========================================================= */

window.PORTFOLIO = [
  {
    title: 'Clutch 1v4 în ultima rundă',
    creator: '@exemplu.fps',
    category: 'shorts',
    format: 'vertical',
    platform: 'TikTok',
    views: '2.1M',
    duration: '0:38',
    hook: '1v4 clutch',
    hue: 265,
    youtube: '',
    video: '',
    thumb: ''
  },
  {
    title: 'Cele mai tari momente din stream-ul de 12 ore',
    creator: '@exemplu.live',
    category: 'highlights',
    format: 'horizontal',
    platform: 'YouTube',
    views: '480K',
    duration: '14:22',
    hook: 'Stream de 12 ore',
    hue: 200
  },
  {
    title: 'Reacția la donația de 1000€',
    creator: '@exemplu.irl',
    category: 'shorts',
    format: 'vertical',
    platform: 'Shorts',
    views: '3.4M',
    duration: '0:29',
    hook: 'Nu se poate',
    hue: 20
  },
  {
    title: 'Best of — luna martie',
    creator: '@exemplu.gaming',
    category: 'compilatii',
    format: 'horizontal',
    platform: 'YouTube',
    views: '1.3M',
    duration: '18:05',
    hook: 'Best of martie',
    hue: 330
  },
  {
    title: 'Am construit o bază în 100 de zile',
    creator: '@exemplu.survival',
    category: 'youtube',
    format: 'horizontal',
    platform: 'YouTube',
    views: '920K',
    duration: '24:10',
    hook: '100 de zile',
    hue: 140
  },
  {
    title: 'Rage quit legendar',
    creator: '@exemplu.fps',
    category: 'shorts',
    format: 'vertical',
    platform: 'Reels',
    views: '1.8M',
    duration: '0:21',
    hook: 'Rage quit',
    hue: 350
  },
  {
    title: 'Chatul a decis finalul',
    creator: '@exemplu.live',
    category: 'highlights',
    format: 'vertical',
    platform: 'TikTok',
    views: '640K',
    duration: '0:52',
    hook: 'Chatul decide',
    hue: 185
  },
  {
    title: 'Top 20 fail-uri din comunitate',
    creator: '@exemplu.gaming',
    category: 'compilatii',
    format: 'horizontal',
    platform: 'YouTube',
    views: '760K',
    duration: '11:47',
    hook: 'Top 20 fail-uri',
    hue: 45
  },
  {
    title: 'Turneul de 10.000€ — rezumatul finalei',
    creator: '@exemplu.esports',
    category: 'highlights',
    format: 'horizontal',
    platform: 'Twitch',
    views: '1.1M',
    duration: '9:58',
    hook: 'Marea finală',
    hue: 225
  },
  {
    title: 'Speedrun record personal',
    creator: '@exemplu.speed',
    category: 'shorts',
    format: 'vertical',
    platform: 'Shorts',
    views: '2.7M',
    duration: '0:44',
    hook: 'Record nou',
    hue: 95
  },
  {
    title: 'Vlog: prima mea convenție de gaming',
    creator: '@exemplu.vlog',
    category: 'youtube',
    format: 'horizontal',
    platform: 'YouTube',
    views: '310K',
    duration: '16:33',
    hook: 'Vlog convenție',
    hue: 290
  },
  {
    title: 'Momente amuzante — săptămâna 12',
    creator: '@exemplu.irl',
    category: 'compilatii',
    format: 'vertical',
    platform: 'TikTok',
    views: '540K',
    duration: '0:58',
    hook: 'Funny moments',
    hue: 310
  }
];
