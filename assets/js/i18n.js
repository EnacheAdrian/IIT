/* =========================================================
   TRADUCERI — versiunea în engleză a site-ului (RO / EN)
   ---------------------------------------------------------
   Cum funcționează:
   • Textele în ROMÂNĂ rămân în index.html (ele sunt sursa principală).
     Excepție: textele generate din JavaScript (cuvintele rotative din hero,
     subtitrările animate, mesajele formularului) se modifică și în română
     aici, în I18N.ui.ro.
   • Fiecare element tradus din index.html are o cheie:
       data-i18n="services.title"                  -> se traduce conținutul elementului
       data-i18n-attr="aria-label:nav.logo"         -> se traduce un atribut
       (mai multe atribute: "aria-label:cheie1; title:cheie2")
   • Mai jos, I18N.en conține textul în ENGLEZĂ pentru fiecare cheie.

   Ca să modificați un text în engleză:
     căutați cheia elementului în index.html și schimbați valoarea ei din I18N.en.

   Ca să adăugați un element nou tradus:
     1. în index.html puneți pe element data-i18n="sectiune.cheie-noua"
        (elementul trebuie să conțină doar text și formatare simplă:
        <strong>, <em>, <br>, <a class="link">; fără iconițe SVG sau câmpuri de formular –
        dacă textul stă lângă o iconiță, puneți-l într-un <span data-i18n="...">);
     2. aici, în I18N.en, adăugați 'sectiune.cheie-noua': 'Textul în engleză'.
   Dacă o cheie lipsește din I18N.en, se afișează textul în română
   (și apare un avertisment în consola browserului).

   • Valorile pentru data-i18n pot conține HTML simplu (ex: <em>, <strong>);
     caracterul „&” se scrie &amp;. Valorile pentru atribute sunt text simplu.
   • La titlurile mari (data-split) cuvintele evidențiate stau în <em>...</em>.
   • I18N.ui conține textele generate din JavaScript (în ambele limbi):
     cuvintele rotative din hero, subtitrările animate, etichete din portofoliu,
     mesajele formularului etc. Textele {intre_acolade} sunt înlocuite automat.
   • Titlurile clipurilor din portofoliu se traduc în assets/js/portfolio-data.js
     (câmpurile titleEn și hookEn).
   ========================================================= */

window.I18N = {
  // Limba folosită când nu se poate detecta limba vizitatorului ('ro' sau 'en')
  defaultLang: 'ro',

  // true = vizitatorii al căror browser nu este în română văd site-ul în engleză
  // false = toată lumea vede site-ul în defaultLang până alege altă limbă
  autoDetect: true,

  /* ---------- Texte din pagină (cheile din index.html) ---------- */
  en: {
    // Titlu și descriere (Google, distribuire pe rețele)
    'meta.title': 'CLIPLAB — Video editing for streamers and YouTubers',
    'meta.description': 'Video editing studio for creators: shorts, TikToks, stream highlights, compilations and YouTube editing. We turn hours of streaming into clips that rack up views.',
    'meta.ogTitle': 'CLIPLAB — Video editing for streamers and YouTubers',
    'meta.ogDescription': 'Shorts, highlights, compilations and YouTube editing. You create the content, we make it go viral.',
    'meta.ogLocale': 'en_US',

    // Comutatorul de limbă
    'lang.label': 'Site language',

    // Navigare (header, meniu mobil, footer)
    'nav.logo': 'CLIPLAB — home',
    'nav.mainLabel': 'Main navigation',
    'nav.mobileLabel': 'Mobile navigation',
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.process': 'Process',
    'nav.pricing': 'Pricing',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.cta': 'Get a quote',
    // eticheta butonului de meniu (mobil) e în I18N.ui: 'menu.open' / 'menu.close'

    // Hero
    'hero.badge': 'Available for new projects',
    'hero.title': 'We turn long streams into viral clips',
    'hero.line1': 'We turn long',
    'hero.line2': 'streams into',
    'hero.sub': 'Video editing studio for <strong>streamers</strong> and <strong>YouTubers</strong>. Shorts, TikToks, highlights and compilations cut fast, with animated captions, sound design and pacing that keeps viewers hooked to the last second.',
    'hero.ctaWork': 'See our work',
    'hero.ctaQuote': 'Get a quote',
    'hero.trust': '<strong>60+ creators</strong> trust us with their content',
    'hero.scroll': 'Scroll down',

    // Machetele animate din hero (editor, telefon, chip-uri)
    'editor.chipViews': 'views in 7 days',
    'editor.feed1': 'YOU ▸ ENEMY_01',
    'editor.feed2': 'YOU ▸ ENEMY_02',
    'editor.effects': 'Effects',
    'editor.fx.zoom': 'Zoom punch',
    'editor.fx.captions': 'Captions',
    'editor.fx.sfx': 'SFX whoosh',
    'editor.fx.color': 'Color grade',
    'editor.audio': 'Audio',
    'editor.phoneHandle': '@your.channel',
    'editor.phoneCaption': 'this moment… #gaming #fyp',
    'editor.chipRetention': 'Avg. retention',
    'editor.chipDone': 'Delivered in 24h',

    // Benzile cu text (marquee)
    'bands.label': 'Platforms we deliver for',
    'bands.shorts': 'Shorts',
    'bands.highlights': 'Highlights',
    'bands.compilations': 'Compilations',
    'bands.captions': 'Captions',
    'bands.motion': 'Motion graphics',
    'bands.sound': 'Sound design',

    // Statistici
    'stats.clips': 'clips delivered',
    'stats.views': 'views generated',
    'stats.creators': 'happy creators',
    'stats.delivery': 'average turnaround',

    // Servicii
    'services.eyebrow': '01 — Services',
    'services.title': 'Everything you need to <em>grow</em> on any platform',
    'services.lead': 'You stream or film. We turn the raw footage into content that stops the scroll, keeps people watching and brings in new followers.',
    'services.shorts.title': 'Shorts, TikTok &amp; Reels',
    'services.shorts.text': 'Vertical 9:16 clips with a hook in the first 2 seconds, animated captions, dynamic zooms and sound effects.',
    'services.highlights.title': 'Stream highlights',
    'services.highlights.text': 'We watch your VODs and pull out the best moments: clutches, fails, reactions and chat interactions.',
    'services.compilations.title': 'Compilations',
    'services.compilations.text': 'Best-ofs, weekly or themed compilations with tight pacing, clean transitions and music that fits your vibe.',
    'services.youtube.title': 'YouTube editing',
    'services.youtube.text': 'Long-form videos edited for retention: on-beat cuts, b-roll, memes, graphics, color grading and sound design.',
    'services.motion.title': 'Motion graphics',
    'services.motion.text': 'Intros, outros, stream overlays, animated alerts and branding elements that make your channel instantly recognizable.',
    'services.monthly.title': 'Monthly packages',
    'services.monthly.text': 'A dedicated editor, steady delivery and a content plan. You go live, we handle the rest.',
    'services.tag.captions': 'Captions',
    'services.tag.hook': 'Hook',
    'services.tag.bestof': 'Best of',
    'services.tag.weekly': 'Weekly',
    'services.tag.themed': 'Themed',
    'services.tag.longform': 'Long-form',
    'services.tag.retention': 'Retention',
    'services.tag.broll': 'B-roll',
    'services.tag.intro': 'Intro',
    'services.tag.overlay': 'Overlay',
    'services.tag.branding': 'Branding',
    'services.tag.editor': 'Dedicated editor',
    'services.tag.subscription': 'Subscription',

    // Portofoliu
    'portfolio.eyebrow': '02 — Portfolio',
    'portfolio.title': 'Clips that <em>racked up millions</em> of views',
    'portfolio.lead': 'A selection of our recent projects. Hit play on any clip.',
    'portfolio.filterLabel': 'Filter the portfolio',
    'portfolio.filter.all': 'All',
    'portfolio.filter.shorts': 'Shorts &amp; TikTok',
    'portfolio.filter.highlights': 'Highlights',
    'portfolio.filter.compilations': 'Compilations',
    'portfolio.filter.youtube': 'YouTube videos',

    // Înainte / după
    'compare.eyebrow': '03 — The difference',
    'compare.title': 'From raw footage to <em>content that performs</em>',
    'compare.lead': 'Drag the slider to see what a stream moment looks like once we get our hands on it.',
    'compare.check1': 'A strong hook in the first 2 seconds',
    'compare.check2': 'Animated captions, word by word',
    'compare.check3': 'Zooms, punch-ins and transitions',
    'compare.check4': 'Sound effects and on-beat music',
    'compare.check5': 'Color grading and optimized formats',
    'compare.cursor': 'DRAG',
    'compare.before': 'RAW · 2:47:12 VOD',
    'compare.after': 'EDITED · 0:38 of gold',
    'compare.caption': '<span class="w is-on">THE</span> <span class="w is-on is-hl">BEST</span> <span class="w is-on">CLUTCH</span> <span class="w is-on">EVER</span>',
    'compare.rangeLabel': 'Compare the raw footage with the edited version',

    // Proces
    'process.eyebrow': '04 — Process',
    'process.title': 'Simple for you. <em>Obsessive</em> for us.',
    'process.lead': 'Four steps, zero headaches. Most creators spend less than 5 minutes a week working with us.',
    'process.step1.title': 'You send the footage',
    'process.step1.text': 'A VOD link, Google Drive or WeTransfer. Tell us the style you want and which platforms it’s for.',
    'process.step1.time': '~5 minutes of your time',
    'process.step2.title': 'We dig for the gold',
    'process.step2.text': 'We watch it all and pick the highest-potential moments: reactions, fails, clutches, chat interactions.',
    'process.step2.time': 'Hand-picked, not AI',
    'process.step3.title': 'Editing &amp; polish',
    'process.step3.text': 'On-beat cuts, animated captions, zooms, SFX, music, color grading and graphics that match your brand.',
    'process.step3.time': 'Editors who know your niche',
    'process.step4.title': 'Delivery &amp; revisions',
    'process.step4.text': 'You get ready-to-post clips in 24–72h, with revisions included until you’re 100% happy.',
    'process.step4.time': 'Revisions included',
    'process.cta.title': 'Ready to 10x your content?',
    'process.cta.text': 'Your first test clip is on us.',
    'process.cta.button': 'Let’s get started',

    // Testimoniale
    'testimonials.eyebrow': '05 — Testimonials',
    'testimonials.title': 'What <em>creators</em> say about us',
    'testimonials.q1': '“Since I started working with them, my TikTok went from 2K to 140K followers in 4 months. The clips are exactly my vibe.”',
    'testimonials.role1': 'Twitch streamer · 85K',
    'testimonials.q2': '“I send them the VOD at night and wake up to 10 shorts ready to post. I haven’t opened editing software in six months.”',
    'testimonials.role2': 'YouTube creator · 210K',
    'testimonials.q3': '“The monthly compilations are now the most-watched videos on my channel. Flawless pacing.”',
    'testimonials.role3': 'Kick streamer · 40K',
    'testimonials.q4': '“Fast replies, painless revisions and captions that actually look good. Just what I needed.”',
    'testimonials.role4': 'TikTok creator · 320K',
    'testimonials.q5': '“They got my channel’s humor right away. I save about 20 hours a week.”',
    'testimonials.role5': 'Gaming YouTuber · 95K',
    'testimonials.q6': '“The tournament highlights blew up in the community the next day. 100% recommend.”',
    'testimonials.role6': 'Esports player · 60K',

    // Prețuri
    'pricing.eyebrow': '06 — Pricing',
    'pricing.title': 'Packages for <em>every stage</em> of your channel',
    'pricing.lead': 'Transparent pricing, no hidden fees. Every package can be customized.',
    'pricing.perMonth': '/ month',
    'pricing.badge': 'Most popular',
    'pricing.starter.desc': 'For creators just getting started with short-form.',
    'pricing.starter.price': '€149',
    'pricing.starter.f1': '10 shorts / month',
    'pricing.starter.f2': 'Animated captions',
    'pricing.starter.f3': '1 round of revisions',
    'pricing.starter.f4': 'Delivery in 72h',
    'pricing.starter.cta': 'Choose Starter',
    'pricing.creator.desc': 'For streamers who want to grow consistently.',
    'pricing.creator.price': '€349',
    'pricing.creator.f1': '30 shorts / month',
    'pricing.creator.f2': '2 compilations / month',
    'pricing.creator.f3': 'Captions, SFX and zooms',
    'pricing.creator.f4': '2 rounds of revisions',
    'pricing.creator.f5': 'Delivery in 48h',
    'pricing.creator.cta': 'Choose Creator',
    'pricing.pro.desc': 'Your own fully dedicated post-production team.',
    'pricing.pro.price': 'Custom',
    'pricing.pro.f1': 'Dedicated editor',
    'pricing.pro.f2': 'Shorts + YouTube editing',
    'pricing.pro.f3': 'Motion graphics &amp; branding',
    'pricing.pro.f4': 'Unlimited revisions',
    'pricing.pro.f5': 'Delivery in 24h',
    'pricing.pro.cta': 'Let’s talk',
    'pricing.note': 'Need just one project? We do one-off jobs too, no subscription needed.',

    // Întrebări frecvente
    'faq.eyebrow': '07 — FAQ',
    'faq.title': 'Common <em>questions</em>',
    'faq.lead': 'Can’t find the answer? <a href="#contact" class="link">Message us</a> and we’ll reply within a few hours.',
    'faq.q1': 'How fast is delivery?',
    'faq.a1': 'Usually 24–72 hours for shorts and 3–5 business days for long-form videos, depending on volume and complexity.',
    'faq.q2': 'What footage do I need to send?',
    'faq.a2': 'Just the VOD link (Twitch, YouTube, Kick) or the raw files on Google Drive / WeTransfer. If you have style preferences, send us a few examples you like.',
    'faq.q3': 'How many revisions do I get?',
    'faq.a3': 'Depends on the package: from one round to unlimited. In practice, after the first 2–3 clips we’ve nailed your style and revisions become rare.',
    'faq.q4': 'Who owns the rights to the clips?',
    'faq.a4': 'You do, fully. You can post the clips on any platform and monetize them. We deliver in formats optimized for TikTok, YouTube Shorts, Instagram Reels and YouTube.',
    'faq.q5': 'Do you work with small creators?',
    'faq.a5': 'Absolutely. Many of our clients started out with just a few hundred followers. The Starter package is built exactly for that stage.',
    'faq.q6': 'How does payment work?',
    'faq.a6': 'Bank transfer or card, and you always get an invoice. Subscriptions are billed monthly; one-off projects are 50% upfront and 50% on delivery.',

    // Contact
    'contact.eyebrow': '08 — Contact',
    'contact.title': 'You create. We make it <em>viral.</em>',
    'contact.lead': 'Tell us a bit about your channel and get a custom quote plus a free test clip.',
    'contact.emailLabel': 'Email',
    'contact.responseLabel': 'Response time',
    'contact.responseValue': 'under 2 hours, Mon–Fri',

    // Formular de contact
    'form.name': 'Name',
    'form.nameError': 'Tell us your name',
    'form.email': 'Email',
    'form.emailError': 'Enter a valid email',
    'form.channel': 'Channel (Twitch, YouTube…)',
    'form.serviceLabel': 'Service',
    'form.option.shorts': 'Shorts / TikTok / Reels',
    'form.option.highlights': 'Stream highlights',
    'form.option.compilations': 'Compilations',
    'form.option.youtube': 'YouTube editing',
    'form.option.motion': 'Motion graphics',
    'form.option.monthly': 'Monthly package',
    'form.budget.legend': 'Estimated monthly budget',
    'form.budget.low': 'under €200',
    'form.budget.mid': '€200–500',
    'form.budget.high': '€500+',
    'form.budget.unsure': 'Not sure yet',
    'form.message': 'Tell us about your content',
    'form.messageError': 'Add a short message',
    'form.submit': 'Send message',
    'form.success.title': 'Message sent!',
    'form.success.text': 'Thank you! We’ll get back to you within 24 hours.',
    'form.success.again': 'Send another message',

    // Footer
    'footer.logo': 'CLIPLAB — back to top',
    'footer.about': 'Video editing studio for streamers and YouTubers. We help your content go further.',
    'footer.navTitle': 'Navigation',
    'footer.servicesTitle': 'Services',
    'footer.services.shorts': 'Shorts &amp; TikTok',
    'footer.services.highlights': 'Highlights',
    'footer.services.compilations': 'Compilations',
    'footer.services.youtube': 'YouTube editing',
    'footer.socialTitle': 'Social',
    'footer.rights': 'All rights reserved.',
    'footer.backToTop': 'Back to top',

    // Fereastra video (modal)
    'modal.close': 'Close'
  },

  /* ---------- Texte generate din JavaScript (ambele limbi) ---------- */
  ui: {
    ro: {
      // formatul numerelor (contoare, vizualizări)
      'locale': 'ro-RO',
      // cuvintele care se schimbă în titlul din hero
      'words.hero': ['clipuri virale', 'shorts care rup', 'compilații', 'highlights', 'vizualizări'],
      // subtitrările animate: cuvinte separate prin spațiu, cuvântul evidențiat are * în față
      'captions.editor': ['ASTA A FOST *INSANE*', 'NU-MI VINE SĂ *CRED*', 'CHATUL A *EXPLODAT*', '1 VS 4 *CLUTCH*'],
      'captions.phone': ['CÂND CHATUL ÎȚI *DONEAZĂ* 1000€', 'CEL MAI *RAPID* CLUTCH', 'AȘTEAPTĂ *FINALUL*'],
      // categoriile din portofoliu
      'cat.shorts': 'Shorts & TikTok',
      'cat.highlights': 'Highlights',
      'cat.compilatii': 'Compilații',
      'cat.youtube': 'Montaj YouTube',
      'portfolio.views': 'vizualizări',
      'portfolio.open': 'Deschide clipul: {title}',
      'modal.demo': 'Clip demonstrativ',
      // butonul de meniu (mobil)
      'menu.open': 'Deschide meniul',
      'menu.close': 'Închide meniul',
      // formularul de contact
      'form.sent': 'Mesajul a fost trimis.',
      'form.error': 'Ceva n-a mers. Încearcă din nou sau scrie-ne direct pe email.',
      'form.planMessage': 'Bună! Sunt interesat de pachetul {plan}.',
      // emailul precompletat (când formularul nu are endpoint)
      'mail.subject': 'Cerere ofertă — {service}',
      'mail.name': 'Nume',
      'mail.email': 'Email',
      'mail.channel': 'Canal',
      'mail.service': 'Serviciu',
      'mail.budget': 'Buget',
      // anunț pentru cititoarele de ecran la schimbarea limbii
      'lang.switchedTo': 'Site-ul este acum în română'
    },
    en: {
      'locale': 'en-US',
      'words.hero': ['viral clips', 'shorts that hit', 'compilations', 'highlights', 'views'],
      'captions.editor': ['THAT WAS *INSANE*', 'I CAN’T *BELIEVE* IT', 'CHAT WENT *WILD*', '1 VS 4 *CLUTCH*'],
      'captions.phone': ['WHEN CHAT *DONATES* €1,000', 'THE *FASTEST* CLUTCH', 'WAIT FOR THE *ENDING*'],
      'cat.shorts': 'Shorts & TikTok',
      'cat.highlights': 'Highlights',
      'cat.compilatii': 'Compilations',
      'cat.youtube': 'YouTube videos',
      'portfolio.views': 'views',
      'portfolio.open': 'Open clip: {title}',
      'modal.demo': 'Demo clip',
      'menu.open': 'Open menu',
      'menu.close': 'Close menu',
      'form.sent': 'Your message has been sent.',
      'form.error': 'Something went wrong. Please try again or email us directly.',
      'form.planMessage': 'Hi! I’m interested in the {plan} package.',
      'mail.subject': 'Quote request — {service}',
      'mail.name': 'Name',
      'mail.email': 'Email',
      'mail.channel': 'Channel',
      'mail.service': 'Service',
      'mail.budget': 'Budget',
      'lang.switchedTo': 'The site is now in English'
    }
  }
};
