#!/usr/bin/env node
/**
 * Publie un article de blog aptibots-site : génère la page HTML statique
 * à partir du markdown, et met à jour blog.html (index) + sitemap.xml.
 *
 * Usage : node scripts/new-blog-post.js <slug>
 * Prérequis : public/blog/<slug>.md doit déjà exister, au format :
 *   # Titre
 *
 *   *Par Armand Hespel — 17 juillet 2026*
 *
 *   Paragraphe d'intro...
 *
 *   ## Section
 *   ...
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "public", "blog");

const FR_MONTHS = {
  janvier: "01", février: "02", mars: "03", avril: "04", mai: "05", juin: "06",
  juillet: "07", août: "08", septembre: "09", octobre: "10", novembre: "11", décembre: "12",
};

function toISODate(frenchDate) {
  const m = frenchDate.trim().toLowerCase().match(/^(\d{1,2})\s+([a-zéû]+)\s+(\d{4})$/);
  if (!m) return null;
  const [, day, month, year] = m;
  const mm = FR_MONTHS[month];
  if (!mm) return null;
  return `${year}-${mm}-${day.padStart(2, "0")}`;
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function inlineFormat(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="text-primary underline hover:opacity-70 transition-opacity" href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-primary font-bold">$1</strong>');
}

function parseMarkdown(raw) {
  const lines = raw.split("\n");

  const titleLine = lines.find((l) => l.trim().startsWith("# "));
  const title = titleLine.replace(/^#\s+/, "").trim();

  const bylineIdx = lines.findIndex((l) => /^\*Par .+\*$/.test(l.trim()));
  const bylineClean = lines[bylineIdx].trim().replace(/^\*|\*$/g, "").replace(/^Par\s+/, "");
  const [author, dateFr] = bylineClean.split("—").map((s) => s.trim());

  const bodyLines = lines.slice(bylineIdx + 1);

  let excerpt = "";
  for (const l of bodyLines) {
    const t = l.trim();
    if (t && !t.startsWith("#")) { excerpt = t.slice(0, 180); break; }
  }

  const toc = [];
  const htmlParts = [];
  let i = 0;
  let h2Count = 0;

  while (i < bodyLines.length) {
    const line = bodyLines[i];
    const t = line.trim();

    if (!t) { i++; continue; }

    if (t.startsWith("## ")) {
      const text = t.replace(/^##\s+/, "");
      h2Count++;
      const id = slugifyHeading(text) || `section-${h2Count}`;
      toc.push({ id, text, num: h2Count });
      htmlParts.push(`<h2 id="${id}" class="font-headline-md text-headline-md text-primary mt-16 mb-5 pt-8 border-t border-primary/20">${inlineFormat(text)}</h2>`);
      i++;
      continue;
    }

    if (t.startsWith("### ")) {
      const text = t.replace(/^###\s+/, "");
      htmlParts.push(`<h3 class="text-xl font-bold text-primary mt-10 mb-3">${inlineFormat(text)}</h3>`);
      i++;
      continue;
    }

    if (t.startsWith("> ")) {
      htmlParts.push(`<blockquote class="border-l-2 border-primary pl-6 my-8 text-secondary italic">${inlineFormat(t.replace(/^>\s+/, ""))}</blockquote>`);
      i++;
      continue;
    }

    if (/^-\s+/.test(t)) {
      const items = [];
      while (i < bodyLines.length && /^-\s+/.test(bodyLines[i].trim())) {
        items.push(`<li>${inlineFormat(bodyLines[i].trim().replace(/^-\s+/, ""))}</li>`);
        i++;
      }
      htmlParts.push(`<ul class="list-disc list-outside pl-5 my-6 space-y-2">${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(t)) {
      const items = [];
      while (i < bodyLines.length && /^\d+\.\s+/.test(bodyLines[i].trim())) {
        items.push(`<li>${inlineFormat(bodyLines[i].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        i++;
      }
      htmlParts.push(`<ol class="list-decimal list-outside pl-5 my-6 space-y-2">${items.join("")}</ol>`);
      continue;
    }

    // Paragraphe normal
    htmlParts.push(`<p class="my-5">${inlineFormat(t)}</p>`);
    i++;
  }

  return { title, author, dateFr, dateIso: toISODate(dateFr), excerpt, toc, contentHtml: htmlParts.join("\n\n") };
}

function buildTocHtml(toc) {
  return toc
    .map((item, idx) => {
      const cls = idx === 0
        ? "toc-link block font-label-caps text-label-caps text-primary border-l-2 border-primary pl-4 py-1"
        : "toc-link block font-label-caps text-label-caps text-secondary border-l-2 border-transparent hover:text-primary transition-colors pl-4 py-1";
      return `<a class="${cls}" data-target="${item.id}" href="#${item.id}">${String(idx + 1).padStart(2, "0")}. ${item.text}</a>`;
    })
    .join("\n");
}

function buildArticleHtml({ slug, title, author, dateFr, dateIso, excerpt, toc, contentHtml }) {
  return `<!DOCTYPE html>

<html class="light" lang="fr"><head>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied'
  });
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-28T34PJ3HT"></script>
<script>
  gtag('js', new Date());
  gtag('config', 'G-28T34PJ3HT');
</script>

<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${title} - Aptibots</title>
<meta content="${excerpt}" name="description"/>
<link href="https://aptibots.com/blog/${slug}" rel="canonical"/>
<meta content="article" property="og:type"/>
<meta content="${title} - Aptibots" property="og:title"/>
<meta content="${excerpt}" property="og:description"/>
<meta content="https://aptibots.com/blog/${slug}" property="og:url"/>
<meta content="fr_FR" property="og:locale"/>
<meta content="${dateIso}" property="article:published_time"/>
<meta content="${author}" property="article:author"/>
<meta content="summary" name="twitter:card"/>
<meta content="${title} - Aptibots" name="twitter:title"/>
<meta content="${excerpt}" name="twitter:description"/>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${title}",
  "description": "${excerpt}",
  "author": { "@type": "Person", "name": "${author}" },
  "publisher": { "@type": "Organization", "name": "Aptibots" },
  "datePublished": "${dateIso}",
  "mainEntityOfPage": "https://aptibots.com/blog/${slug}"
}
</script>
<style>
        body {
            background-color: #f9f9f9;
            color: #000000;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
        }

        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
            .reveal {
                transition: opacity 0.3s ease-in-out;
                transform: none !important;
            }
            .reveal.active {
                transform: none !important;
            }
            * {
                transition-duration: 0.01ms !important;
                animation-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }

        .article-grid { display: grid; grid-template-columns: 1fr; gap: 40px; }
        @media (min-width: 1024px) {
            .article-grid { grid-template-columns: 260px 1fr; gap: 64px; }
        }
      </style>
<link rel="icon" href="/favicon.ico" sizes="any"/>
<link rel="icon" href="/favicon.png" type="image/png"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<link href="/styles.css" rel="stylesheet"/>
</head>
<body class="bg-background text-primary antialiased min-h-screen flex flex-col">
<!-- TopNavBar Shared Component -->
<nav class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 bg-background border-b border-primary">
<a class="font-headline-md text-headline-md font-bold text-primary" href="/">
            Aptibots
        </a>
<div class="hidden md:flex items-center gap-8">
<a class="text-secondary hover:opacity-70 transition-opacity duration-300 font-label-caps text-label-caps" href="/services">
                Services
            </a>
<a class="text-secondary hover:opacity-70 transition-opacity duration-300 font-label-caps text-label-caps" href="/case-studies">
                Case Studies
            </a>
<a class="text-primary font-bold border-b-2 border-primary hover:opacity-70 transition-opacity duration-300 font-label-caps text-label-caps" href="/blog">
                Blog
            </a>
<a class="text-secondary hover:opacity-70 transition-opacity duration-300 font-label-caps text-label-caps" href="/propos">
                À Propos
            </a>
</div>
<a class="hidden md:flex bg-primary text-on-primary rounded-full px-6 py-3 font-button-text text-button-text hover:bg-secondary transition-all duration-300 items-center gap-2 active:scale-95" href="/contact">
            Réserver l'audit
            <svg class="material-symbols-outlined" data-icon="arrow_forward" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/></svg>
</a>
<button aria-label="Menu" class="md:hidden text-primary flex items-center justify-center p-2 border border-primary" id="menu-toggle">
<svg class="material-symbols-outlined" style="font-size: 28px;" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
</button>
</nav>
<div class="hidden md:hidden fixed inset-0 z-40 bg-background pt-24 px-margin-mobile flex-col gap-6" id="mobile-menu">
<a class="font-label-caps text-label-caps text-secondary border-b border-primary/20 pb-4" href="/">Accueil</a>
<a class="font-label-caps text-label-caps text-secondary border-b border-primary/20 pb-4" href="/services">Services</a>
<a class="font-label-caps text-label-caps text-secondary border-b border-primary/20 pb-4" href="/propos">À Propos</a>
<a class="font-label-caps text-label-caps text-secondary border-b border-primary/20 pb-4" href="/case-studies">Case Studies</a>
<a class="font-label-caps text-label-caps text-primary border-b border-primary/20 pb-4" href="/blog">Blog</a>
<a class="bg-primary text-on-primary font-button-text text-button-text rounded-full px-6 py-4 flex items-center justify-center gap-2 mt-4" href="/contact">
                Réserver l'audit
                <svg class="material-symbols-outlined" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/></svg>
</a>
</div>
<main class="flex-grow pt-[120px] pb-section-gap">
<article class="px-margin-desktop md:px-margin-desktop px-margin-mobile max-w-[1104px] mx-auto w-full">
<div class="reveal">
<a class="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors" href="/blog">&larr; Blog</a>

<h1 class="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mt-6 mb-4 max-w-[760px]">
                ${title}
            </h1>
<p class="font-label-caps text-label-caps text-secondary uppercase tracking-widest mb-12">Par ${author} — ${dateFr}</p>
</div>

<div class="article-grid">
<aside class="hidden lg:block">
<nav class="sticky top-32 space-y-4">
${buildTocHtml(toc)}
</nav>
</aside>

<div class="max-w-[760px]">
<div class="font-body-lg text-body-lg text-secondary leading-relaxed">

${contentHtml}

</div>

<!-- Article CTA -->
<div class="mt-16 bg-primary text-on-primary p-10 md:p-14 flex flex-col items-start gap-6">
<h3 class="font-headline-md text-headline-md">Un audit gratuit de 30 minutes, sans engagement.</h3>
<a class="bg-surface-white text-primary rounded-full px-8 py-4 font-button-text text-button-text hover:bg-surface-dim hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2" href="/contact">
                Réserver l'audit gratuit
                <svg class="material-symbols-outlined" data-icon="arrow_forward" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/></svg>
</a>
</div>
</div>
</div>
</article>
</main>
<!-- Omnipresent CTA (Fixed Bottom Right) -->
<div class="fixed bottom-8 right-8 z-50">
<a class="bg-primary text-on-primary rounded-full px-6 py-4 font-button-text text-button-text shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2" href="/contact">
            Réserver l'audit gratuit
            <svg class="material-symbols-outlined" data-icon="calendar_today" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>
</a>
</div>
<!-- Footer Shared Component -->
<footer class="w-full py-gutter px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 border-t border-primary bg-background reveal">
<div class="font-headline-md text-headline-md font-bold text-primary">
            Aptibots
        </div>
<div class="flex flex-col md:flex-row flex-wrap justify-center gap-6 w-full md:w-auto">
<a class="font-body-md text-body-md text-secondary hover:text-primary transition-colors duration-300 border-b border-primary/20 pb-4 md:border-b-0 md:pb-0" href="/mentions-legales">Mentions Légales</a>
<a class="font-body-md text-body-md text-secondary hover:text-primary transition-colors duration-300 border-b border-primary/20 pb-4 md:border-b-0 md:pb-0" href="/confidentialite">Politique de Confidentialité</a>
<a class="font-body-md text-body-md text-secondary hover:text-primary transition-colors duration-300" href="#">LinkedIn</a>
<a class="font-body-md text-body-md text-secondary hover:text-primary transition-colors duration-300" href="#">Instagram</a>
</div>
<div class="font-body-md text-body-md text-secondary">© 2026 Aptibots. Tous droits réservés.</div>
</footer>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(element => revealObserver.observe(element));

        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                mobileMenu.classList.toggle('flex');
            });
        }

        // Table of contents: smooth scroll + active section highlight
        document.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById(link.dataset.target);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });

        const tocObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const link = document.querySelector(\`.toc-link[data-target="\${id}"]\`);
                if (entry.isIntersecting && link) {
                    document.querySelectorAll('.toc-link').forEach(l => {
                        l.classList.replace('text-primary', 'text-secondary');
                        l.classList.replace('border-primary', 'border-transparent');
                    });
                    link.classList.replace('text-secondary', 'text-primary');
                    link.classList.replace('border-transparent', 'border-primary');
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('h2[id]').forEach(h => tocObserver.observe(h));
    });
</script>
<div id="cookie-consent-banner" class="hidden fixed bottom-0 left-0 right-0 z-50 bg-primary text-on-primary p-4 md:p-6">
  <div class="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
    <p class="text-sm text-white/80">Ce site utilise des cookies pour mesurer l&#39;audience et analyser le comportement des visiteurs (Google Analytics, Microsoft Clarity). Vous pouvez accepter ou refuser leur utilisation. <a href="/confidentialite.html" class="underline">En savoir plus</a></p>
    <div class="flex gap-3 flex-shrink-0">
      <button id="cc-refuse" type="button" class="px-4 py-2 rounded-full border border-white/40 text-sm hover:opacity-80 transition">Refuser</button>
      <button id="cc-accept" type="button" class="px-4 py-2 rounded-full bg-white text-primary text-sm font-bold hover:opacity-80 transition">Accepter</button>
    </div>
  </div>
</div>
<script src="/consent.js" defer></script>
</body></html>
`;
}

function insertIntoIndex(slug, title, dateFr, excerpt) {
  const indexPath = path.join(ROOT, "public", "blog.html");
  let html = fs.readFileSync(indexPath, "utf-8");

  const marker = '<div class="flex flex-col border-t-2 border-primary">';
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error("Marqueur introuvable dans blog.html");

  const entry = `
<a class="py-12 border-b border-primary flex flex-col md:flex-row md:items-baseline justify-between group hover:bg-surface-container transition-all duration-300 cursor-pointer" href="/blog/${slug}">
<div class="w-full md:w-1/2">
<span class="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-3">${dateFr}</span>
<h2 class="font-headline-md text-headline-md text-primary">
                        ${title}
                    </h2>
</div>
<div class="w-full md:w-1/2 mt-4 md:mt-0 flex justify-between items-center gap-4">
<p class="font-body-lg text-body-lg text-secondary group-hover:text-primary transition-colors duration-300">${excerpt}</p>
<svg class="material-symbols-outlined text-4xl text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 shrink-0" data-icon="arrow_forward" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/></svg>
</div>
</a>`;

  const insertPos = idx + marker.length;
  html = html.slice(0, insertPos) + entry + html.slice(insertPos);
  fs.writeFileSync(indexPath, html, "utf-8");
}

function insertIntoSitemap(slug) {
  const sitemapPath = path.join(ROOT, "public", "sitemap.xml");
  let xml = fs.readFileSync(sitemapPath, "utf-8");

  const marker = "<loc>https://aptibots.com/blog</loc>";
  const blockEndMarker = "</url>";
  const markerIdx = xml.indexOf(marker);
  if (markerIdx === -1) throw new Error("Marqueur /blog introuvable dans sitemap.xml");
  const insertPos = xml.indexOf(blockEndMarker, markerIdx) + blockEndMarker.length;

  const entry = `
  <url>
    <loc>https://aptibots.com/blog/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

  xml = xml.slice(0, insertPos) + entry + xml.slice(insertPos);
  fs.writeFileSync(sitemapPath, xml, "utf-8");
}

function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: node scripts/new-blog-post.js <slug>");
    process.exit(1);
  }

  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) {
    console.error(`Introuvable : ${mdPath}. Crée d'abord le fichier .md.`);
    process.exit(1);
  }

  const raw = fs.readFileSync(mdPath, "utf-8");
  const parsed = parseMarkdown(raw);

  const htmlPath = path.join(BLOG_DIR, `${slug}.html`);
  fs.writeFileSync(htmlPath, buildArticleHtml({ slug, ...parsed }), "utf-8");
  console.log(`✓ Page créée : public/blog/${slug}.html`);

  insertIntoIndex(slug, parsed.title, parsed.dateFr, parsed.excerpt);
  console.log("✓ Index mis à jour : public/blog.html");

  insertIntoSitemap(slug);
  console.log("✓ Sitemap mis à jour : public/sitemap.xml");

  console.log("\nRappel : pas d'image OG générée automatiquement.");
  console.log(`Optionnel : ajoute public/og/${slug}.png (1200x630) et le meta og:image dans le .html si tu veux une preview soignée sur les réseaux sociaux.`);
  console.log("\nProchaine étape : git add + commit + push.");
  console.log(`Une fois déployé (déploiement Vercel propagé), lance : node scripts/submit-to-search-console.js blog/${slug}`);
}

main();
