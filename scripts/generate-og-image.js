const fs = require("fs");
const path = require("path");
const satori = require("satori").default;
const { Resvg } = require("@resvg/resvg-js");

const FONT_PATH = path.join(__dirname, "assets", "inter-bold.ttf");

async function generateOgImage(slug, title) {
  const fontData = fs.readFileSync(FONT_PATH);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#000000",
          padding: "80px",
        },
        children: [
          { type: "div", props: { style: { color: "#ffffff", fontSize: 36, fontWeight: 700 }, children: "Aptibots" } },
          { type: "div", props: { style: { color: "#ffffff", fontSize: 60, fontWeight: 700, lineHeight: 1.2, maxWidth: "1000px" }, children: title } },
          { type: "div", props: { style: { color: "#9a9a9a", fontSize: 24, fontWeight: 700 }, children: "Blog — aptibots.com" } },
        ],
      },
    },
    { width: 1200, height: 630, fonts: [{ name: "Inter", data: fontData, weight: 700, style: "normal" }] }
  );

  const resvg = new Resvg(svg);
  const png = resvg.render().asPng();

  const outDir = path.join(__dirname, "..", "public", "og");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.png`);
  fs.writeFileSync(outPath, png);
  return outPath;
}

module.exports = { generateOgImage };

if (require.main === module) {
  const [slug, title] = process.argv.slice(2);
  if (!slug || !title) {
    console.error("Usage: node scripts/generate-og-image.js <slug> \"<titre>\"");
    process.exit(1);
  }
  generateOgImage(slug, title).then((p) => console.log(`✓ Image OG créée : ${path.relative(process.cwd(), p)}`));
}
