#!/usr/bin/env node
/**
 * Soumet une URL à Google pour indexation rapide, et notifie Search Console
 * du sitemap mis à jour, via le compte de service Google Cloud.
 *
 * Prérequis :
 *   - credentials/search-console-service-account.json (jamais commité, voir .gitignore)
 *   - Le compte de service doit être ajouté comme utilisateur dans Search Console
 *     pour la propriété SITE_URL ci-dessous.
 *
 * Usage : node scripts/submit-to-search-console.js /blog/mon-article
 */

const path = require("path");
const { google } = require("googleapis");

const KEY_FILE = path.join(__dirname, "..", "credentials", "search-console-service-account.json");
const SITE_URL = "sc-domain:aptibots.com";
const SITEMAP_URL = "https://aptibots.com/sitemap.xml";

async function getAuth(scopes) {
  const auth = new google.auth.GoogleAuth({ keyFile: KEY_FILE, scopes });
  return auth.getClient();
}

async function resubmitSitemap() {
  const authClient = await getAuth(["https://www.googleapis.com/auth/webmasters"]);
  const searchconsole = google.searchconsole({ version: "v1", auth: authClient });
  await searchconsole.sitemaps.submit({ siteUrl: SITE_URL, feedpath: SITEMAP_URL });
  console.log(`✓ Sitemap resoumis : ${SITEMAP_URL}`);
}

async function requestIndexing(fullUrl) {
  const authClient = await getAuth(["https://www.googleapis.com/auth/indexing"]);
  const indexing = google.indexing({ version: "v3", auth: authClient });
  try {
    const res = await indexing.urlNotifications.publish({
      requestBody: { url: fullUrl, type: "URL_UPDATED" },
    });
    console.log(`✓ Demande d'indexation envoyée : ${fullUrl}`);
    return res.data;
  } catch (err) {
    console.warn(`⚠ L'Indexing API a refusé/échoué pour ${fullUrl} (normal : elle n'est officiellement supportée que pour les pages JobPosting/BroadcastEvent).`);
    console.warn(`  Détail : ${err.message}`);
    console.warn("  Le sitemap a quand même été resoumis — Google découvrira la page via le crawl normal, ou soumets-la manuellement via l'inspection d'URL dans Search Console.");
  }
}

async function main() {
  let urlPath = process.argv[2];
  if (!urlPath) {
    console.error("Usage: node scripts/submit-to-search-console.js blog/mon-article");
    process.exit(1);
  }
  urlPath = urlPath.replace(/^\/+/, ""); // évite le path-mangling de Git Bash sur Windows
  const fullUrl = `https://aptibots.com/${urlPath}`;

  await resubmitSitemap();
  await requestIndexing(fullUrl);
}

main().catch((err) => {
  console.error("Erreur :", err.message);
  process.exit(1);
});
