/**
 * CDN URL Generator — fetches product images from Allure Bridals Shopify collections
 * and generates a central mapping file for the storefront.
 *
 * Usage: npx tsx storefront/src/scripts/generate-cdn-urls.ts
 */

const SHOPIFY_COLLECTIONS = [
  "https://www.allurebridals.com/collections/allure-bridals/products.json?limit=250",
  "https://www.allurebridals.com/collections/allure-couture/products.json?limit=250",
  "https://www.allurebridals.com/collections/abella/products.json?limit=250",
  "https://www.allurebridals.com/collections/allure-women/products.json?limit=250",
];

interface ShopifyImage {
  src: string;
}

interface ShopifyProduct {
  handle: string;
  images: ShopifyImage[];
}

interface ShopifyCollection {
  products: ShopifyProduct[];
}

// Brand prefix → collection slug
const BRAND_PREFIXES: Record<string, string> = {
  "allure-bridals": "allure-bridals",
  "allure-couture": "allure-couture",
  abella: "abella",
  "allure-women": "allure-women",
};

/**
 * Parse a local filename like "allure-bridals-a1400-01.jpg" into
 * { brand, handle, index }
 */
function parseLocalFilename(filename: string): {
  brand: string;
  handle: string;
  index: number;
} | null {
  // Try each brand prefix (longest first to avoid false matches)
  const prefixes = Object.keys(BRAND_PREFIXES).sort(
    (a, b) => b.length - a.length
  );

  for (const prefix of prefixes) {
    if (filename.startsWith(prefix + "-")) {
      const rest = filename.slice(prefix.length + 1); // e.g. "a1400-01.jpg" or "e551-lambri-01.jpg"
      const match = rest.match(/^(.+)-(\d{2})\.jpg$/);
      if (match) {
        return {
          brand: prefix,
          handle: match[1], // e.g. "a1400", "e551-lambri", "c804nc"
          index: parseInt(match[2], 10) - 1, // 01 → 0, 02 → 1, etc.
        };
      }
    }
  }
  return null;
}

async function main() {
  console.log("Fetching product data from Allure Bridals Shopify...\n");

  // Fetch all collections
  const handleToImages: Record<string, string[]> = {};

  for (const url of SHOPIFY_COLLECTIONS) {
    const collectionName = url.match(/collections\/([^/]+)/)?.[1] || "unknown";
    console.log(`  Fetching ${collectionName}...`);

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  ERROR: ${res.status} ${res.statusText}`);
      continue;
    }

    const data = (await res.json()) as ShopifyCollection;
    for (const product of data.products) {
      handleToImages[product.handle] = product.images.map((img) => img.src);
    }
    console.log(`  → ${data.products.length} products`);
  }

  console.log(
    `\nTotal handles fetched: ${Object.keys(handleToImages).length}\n`
  );

  // Collect all local filenames from the codebase patterns
  // These are the filenames used in ${MEDUSA_URL}/static/... references
  const localFilenames = extractAllLocalFilenames();

  console.log(`Local filenames to map: ${localFilenames.length}`);

  // Build the CDN mapping
  const cdnUrls: Record<string, string> = {};
  let mapped = 0;
  let unmapped = 0;

  for (const filename of localFilenames) {
    const parsed = parseLocalFilename(filename);
    if (!parsed) {
      console.warn(`  SKIP (unparseable): ${filename}`);
      unmapped++;
      continue;
    }

    const images = handleToImages[parsed.handle];
    if (!images) {
      console.warn(
        `  SKIP (handle not found): ${filename} → handle="${parsed.handle}"`
      );
      unmapped++;
      continue;
    }

    if (parsed.index >= images.length) {
      console.warn(
        `  SKIP (index ${parsed.index} out of range for ${parsed.handle}, has ${images.length} images): ${filename}`
      );
      // Use last available image as fallback
      cdnUrls[filename] = images[images.length - 1];
      mapped++;
      continue;
    }

    cdnUrls[filename] = images[parsed.index];
    mapped++;
  }

  console.log(`\nMapped: ${mapped}, Unmapped: ${unmapped}\n`);

  // Generate the output TypeScript file
  const output = generateOutputFile(cdnUrls, handleToImages);

  const fs = await import("fs");
  const path = await import("path");
  const outPath = path.resolve(
    __dirname,
    "../lib/cdn-image-urls.ts"
  );
  fs.writeFileSync(outPath, output, "utf-8");
  console.log(`Written to: ${outPath}`);
  console.log(`Total CDN_URLS entries: ${Object.keys(cdnUrls).length}`);
}

function extractAllLocalFilenames(): string[] {
  // All unique filenames used across the codebase
  // Extracted from products.ts, components, constants.ts, seed.ts
  return [
    // Product images (66 products × 2-3 images each)
    "allure-couture-c800-01.jpg", "allure-couture-c800-02.jpg",
    "abella-e551-lambri-01.jpg", "abella-e551-lambri-02.jpg",
    "allure-couture-c789-01.jpg", "allure-couture-c789-02.jpg",
    "abella-e550-carrington-01.jpg", "abella-e550-carrington-02.jpg",
    "abella-e552-browne-01.jpg", "abella-e552-browne-02.jpg",
    "abella-e553-hudson-01.jpg", "abella-e553-hudson-02.jpg",
    "allure-bridals-a1400-01.jpg", "allure-bridals-a1400-02.jpg",
    "allure-bridals-a1401-01.jpg", "allure-bridals-a1401-02.jpg",
    "abella-e554-paxson-01.jpg", "abella-e554-paxson-02.jpg",
    "allure-couture-c801-01.jpg", "allure-couture-c801-02.jpg",
    "allure-couture-c802-01.jpg", "allure-couture-c802-02.jpg",
    "allure-couture-c803-01.jpg", "allure-couture-c803-02.jpg",
    "allure-couture-c804nc-01.jpg", "allure-couture-c804nc-02.jpg",
    "allure-couture-c805-01.jpg", "allure-couture-c805-02.jpg",
    "allure-women-w550-01.jpg", "allure-women-w550-02.jpg",
    "allure-couture-c806-01.jpg", "allure-couture-c806-02.jpg",
    "allure-couture-c807-01.jpg", "allure-couture-c807-02.jpg",
    "allure-women-w551-01.jpg", "allure-women-w551-02.jpg",
    "allure-women-w552-01.jpg", "allure-women-w552-02.jpg",
    "allure-couture-c808-01.jpg", "allure-couture-c808-02.jpg", "allure-couture-c808-03.jpg",
    "allure-women-w553-01.jpg",
    "allure-couture-c790-01.jpg", "allure-couture-c790-02.jpg", "allure-couture-c790-03.jpg",
    "allure-couture-c791-01.jpg", "allure-couture-c791-02.jpg", "allure-couture-c791-03.jpg",
    "allure-bridals-a1409-01.jpg", "allure-bridals-a1409-02.jpg",
    "allure-couture-c809-01.jpg", "allure-couture-c809-02.jpg", "allure-couture-c809-03.jpg",
    "allure-couture-c810-01.jpg", "allure-couture-c810-02.jpg", "allure-couture-c810-03.jpg",
    "allure-couture-c811nc-01.jpg", "allure-couture-c811nc-02.jpg", "allure-couture-c811nc-03.jpg",
    "abella-e555-morisot-01.jpg", "abella-e555-morisot-02.jpg",
    "allure-women-w554-01.jpg", "allure-women-w554-02.jpg",
    "allure-couture-c780-01.jpg", "allure-couture-c780-02.jpg",
    "allure-bridals-a1402-01.jpg", "allure-bridals-a1402-02.jpg",
    "abella-e556-este-01.jpg", "abella-e556-este-02.jpg", "abella-e556-este-03.jpg",
    "allure-couture-c781-01.jpg", "allure-couture-c781-02.jpg", "allure-couture-c781-03.jpg",
    "allure-couture-c760-01.jpg", "allure-couture-c760-02.jpg",
    "abella-e557-geer-01.jpg", "abella-e557-geer-02.jpg",
    "abella-e558-dupre-01.jpg", "abella-e558-dupre-02.jpg",
    "abella-e559-becker-01.jpg", "abella-e559-becker-02.jpg",
    "allure-bridals-a1410-01.jpg", "allure-bridals-a1410-02.jpg",
    "abella-e560-bernini-01.jpg", "abella-e560-bernini-02.jpg", "abella-e560-bernini-03.jpg",
    "allure-couture-c760j-01.jpg", "allure-couture-c760j-02.jpg", "allure-couture-c760j-03.jpg",
    "allure-couture-c782nc-01.jpg", "allure-couture-c782nc-02.jpg", "allure-couture-c782nc-03.jpg",
    "allure-bridals-a1403-01.jpg", "allure-bridals-a1403-02.jpg",
    "allure-bridals-a1404-01.jpg", "allure-bridals-a1404-02.jpg",
    "allure-bridals-a1405-01.jpg", "allure-bridals-a1405-02.jpg",
    "allure-bridals-a1406-01.jpg", "allure-bridals-a1406-02.jpg",
    "allure-bridals-a1407-01.jpg", "allure-bridals-a1407-02.jpg",
    "allure-bridals-a1408-01.jpg", "allure-bridals-a1408-02.jpg",
    "allure-women-w555-01.jpg", "allure-women-w555-02.jpg",
    "allure-women-w556-01.jpg", "allure-women-w556-02.jpg",
    "allure-women-w540-01.jpg", "allure-women-w540-02.jpg",
    "allure-women-w541-01.jpg", "allure-women-w541-02.jpg",
    "allure-women-w542-01.jpg", "allure-women-w542-02.jpg",
    "allure-women-w544-01.jpg", "allure-women-w544-02.jpg",
    "allure-women-w545-01.jpg", "allure-women-w545-02.jpg",
    "allure-women-w546-01.jpg", "allure-women-w546-02.jpg",
    "allure-women-w547-01.jpg", "allure-women-w547-02.jpg", "allure-women-w547-03.jpg",
    "allure-women-w548-01.jpg", "allure-women-w548-02.jpg", "allure-women-w548-03.jpg",
    "allure-couture-c783-01.jpg", "allure-couture-c783-02.jpg", "allure-couture-c783-03.jpg",
    "allure-couture-c784-01.jpg", "allure-couture-c784-02.jpg", "allure-couture-c784-03.jpg",
    "allure-couture-c785-01.jpg", "allure-couture-c785-02.jpg", "allure-couture-c785-03.jpg",
    "allure-women-w549-01.jpg", "allure-women-w549-02.jpg",
    "allure-couture-c786-01.jpg", "allure-couture-c786-02.jpg", "allure-couture-c786-03.jpg",
    "allure-women-w520-01.jpg", "allure-women-w520-02.jpg",
    "allure-couture-c787-01.jpg", "allure-couture-c787-02.jpg", "allure-couture-c787-03.jpg",
    "allure-couture-c788-01.jpg", "allure-couture-c788-02.jpg", "allure-couture-c788-03.jpg",
    "allure-women-w543-01.jpg", "allure-women-w543-02.jpg", "allure-women-w543-03.jpg",
  ];
}

function generateOutputFile(
  cdnUrls: Record<string, string>,
  handleToImages: Record<string, string[]>
): string {
  const entries = Object.entries(cdnUrls)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  "${k}": "${v}"`)
    .join(",\n");

  return `// Auto-generated by scripts/generate-cdn-urls.ts — DO NOT EDIT MANUALLY
// Re-generate: npx tsx storefront/src/scripts/generate-cdn-urls.ts

/**
 * Maps local filenames (e.g. "allure-bridals-a1400-01.jpg") to Shopify CDN URLs.
 * Used to eliminate dependency on Medusa backend for serving static images.
 */
export const CDN_URLS: Record<string, string> = {
${entries},
};

/** Placeholder for missing images */
const PLACEHOLDER = "https://images.unsplash.com/photo-1594938328870-9623159c8c99?w=800&q=80";

/** Resolve a local filename to a CDN URL, with fallback */
export function cdnUrl(filename: string): string {
  return CDN_URLS[filename] || PLACEHOLDER;
}

// ── Editorial / Homepage constants ──

export const HERO_SINGLE_IMAGE = cdnUrl("allure-bridals-a1400-01.jpg");

export const HERO_IMAGES = [
  { image: cdnUrl("allure-bridals-a1401-01.jpg"), alt: "Snow luxury bridal gown with flowing silhouette", ctaLink: "collections", key: "slide0" },
  { image: cdnUrl("allure-couture-c800-01.jpg"), alt: "Verdant Grace cape gown with couture drama", ctaLink: "collections/bridal", key: "slide1" },
  { image: cdnUrl("allure-women-w553-01.jpg"), alt: "Pure Eternity evening gown with elegant drama", ctaLink: "collections/evening-dress", key: "slide2" },
  { image: cdnUrl("abella-e552-browne-01.jpg"), alt: "Maison gown with cascading drama and flowing silhouette", ctaLink: "collections/silhouette-whisper", key: "slide3" },
];

export const COLLECTION_COVERS: Record<string, string> = {
  bridal: cdnUrl("allure-bridals-a1400-01.jpg"),
  evening: cdnUrl("allure-women-w550-01.jpg"),
  "cape-and-train": cdnUrl("allure-couture-c805-01.jpg"),
  "ball-gown": cdnUrl("allure-bridals-a1409-01.jpg"),
  silhouette: cdnUrl("abella-e551-lambri-01.jpg"),
  "ruffled-dream": cdnUrl("abella-e550-carrington-01.jpg"),
};

export const TESTIMONIAL_IMAGES = [
  cdnUrl("allure-bridals-a1400-01.jpg"),
  cdnUrl("allure-bridals-a1401-01.jpg"),
  cdnUrl("allure-couture-c800-01.jpg"),
  cdnUrl("allure-couture-c807-01.jpg"),
  cdnUrl("allure-women-w550-01.jpg"),
];

export const EDITORIAL_BAND_IMAGE = cdnUrl("allure-couture-c804nc-01.jpg");

export const NEWSLETTER_IMAGES = [
  { src: cdnUrl("abella-e552-browne-01.jpg"), alt: "Maison" },
  { src: cdnUrl("allure-couture-c809-01.jpg"), alt: "Emerald Empress" },
  { src: cdnUrl("allure-bridals-a1406-01.jpg"), alt: "Renata" },
  { src: cdnUrl("allure-women-w554-01.jpg"), alt: "Goldina" },
  { src: cdnUrl("abella-e553-hudson-01.jpg"), alt: "Arbennelle Gold" },
  { src: cdnUrl("allure-couture-c760j-01.jpg"), alt: "Rosalina" },
  { src: cdnUrl("allure-bridals-a1403-01.jpg"), alt: "Nathalie" },
  { src: cdnUrl("allure-women-w555-01.jpg"), alt: "Daphne" },
];

export const APPOINTMENT_IMAGE = cdnUrl("allure-bridals-a1407-01.jpg");

export const HEADER_IMAGES: Record<string, string> = {
  "all-collections": cdnUrl("allure-bridals-a1402-01.jpg"),
  bridal: cdnUrl("allure-bridals-a1400-01.jpg"),
  "evening-dress": cdnUrl("allure-women-w550-01.jpg"),
  "ball-gown": cdnUrl("allure-bridals-a1409-01.jpg"),
  "cape-and-train-elegance": cdnUrl("allure-couture-c805-01.jpg"),
  "royal-over-train": cdnUrl("allure-couture-c789-01.jpg"),
  "silhouette-whisper": cdnUrl("abella-e551-lambri-01.jpg"),
  "ruffled-dream": cdnUrl("abella-e550-carrington-01.jpg"),
};

export const ABOUT_IMAGES = {
  aboutHero: cdnUrl("allure-bridals-a1400-01.jpg"),
  aboutBride: cdnUrl("allure-bridals-a1401-01.jpg"),
  aboutCraftsmanship: cdnUrl("allure-couture-c800-01.jpg"),
  aboutFabric: cdnUrl("abella-e552-browne-01.jpg"),
  aboutAtelier: cdnUrl("allure-bridals-a1407-01.jpg"),
  aboutEvening: cdnUrl("allure-women-w552-01.jpg"),
};

// ── Product images (slug → image URLs) ──

export const PRODUCT_IMAGES: Record<string, string[]> = {
  "verdant-grace": [cdnUrl("allure-couture-c800-01.jpg"), cdnUrl("allure-couture-c800-02.jpg")],
  "mont-enneige": [cdnUrl("abella-e551-lambri-01.jpg"), cdnUrl("abella-e551-lambri-02.jpg")],
  "vlera": [cdnUrl("allure-couture-c789-01.jpg"), cdnUrl("allure-couture-c789-02.jpg")],
  "serene-cascade": [cdnUrl("abella-e550-carrington-01.jpg"), cdnUrl("abella-e550-carrington-02.jpg")],
  "maison": [cdnUrl("abella-e552-browne-01.jpg"), cdnUrl("abella-e552-browne-02.jpg")],
  "arbennelle-gold": [cdnUrl("abella-e553-hudson-01.jpg"), cdnUrl("abella-e553-hudson-02.jpg")],
  "crystal-bloom": [cdnUrl("allure-bridals-a1400-01.jpg"), cdnUrl("allure-bridals-a1400-02.jpg")],
  "snow": [cdnUrl("allure-bridals-a1401-01.jpg"), cdnUrl("allure-bridals-a1401-02.jpg")],
  "bella-noche": [cdnUrl("abella-e554-paxson-01.jpg"), cdnUrl("abella-e554-paxson-02.jpg")],
  "pearl-mist": [cdnUrl("allure-couture-c801-01.jpg"), cdnUrl("allure-couture-c801-02.jpg")],
  "aurora-bliss": [cdnUrl("allure-couture-c802-01.jpg"), cdnUrl("allure-couture-c802-02.jpg")],
  "regal-whisper": [cdnUrl("allure-couture-c803-01.jpg"), cdnUrl("allure-couture-c803-02.jpg")],
  "stardust": [cdnUrl("allure-couture-c804nc-01.jpg"), cdnUrl("allure-couture-c804nc-02.jpg")],
  "golden-hour": [cdnUrl("allure-couture-c805-01.jpg"), cdnUrl("allure-couture-c805-02.jpg")],
  "ellea": [cdnUrl("allure-women-w550-01.jpg"), cdnUrl("allure-women-w550-02.jpg")],
  "moonlit-veil": [cdnUrl("allure-couture-c806-01.jpg"), cdnUrl("allure-couture-c806-02.jpg")],
  "golden-dawn": [cdnUrl("allure-couture-c807-01.jpg"), cdnUrl("allure-couture-c807-02.jpg")],
  "silvana": [cdnUrl("allure-women-w551-01.jpg"), cdnUrl("allure-women-w551-02.jpg")],
  "ivory-reign": [cdnUrl("allure-women-w552-01.jpg"), cdnUrl("allure-women-w552-02.jpg")],
  "noire-majesty": [cdnUrl("allure-couture-c808-01.jpg"), cdnUrl("allure-couture-c808-02.jpg"), cdnUrl("allure-couture-c808-03.jpg")],
  "pure-eternity": [cdnUrl("allure-women-w553-01.jpg")],
  "velvet-noir": [cdnUrl("allure-couture-c790-01.jpg"), cdnUrl("allure-couture-c790-02.jpg"), cdnUrl("allure-couture-c790-03.jpg")],
  "rouge-flame": [cdnUrl("allure-couture-c791-01.jpg"), cdnUrl("allure-couture-c791-02.jpg"), cdnUrl("allure-couture-c791-03.jpg")],
  "celestine": [cdnUrl("allure-bridals-a1409-01.jpg"), cdnUrl("allure-bridals-a1409-02.jpg")],
  "emerald-empress": [cdnUrl("allure-couture-c809-01.jpg"), cdnUrl("allure-couture-c809-02.jpg"), cdnUrl("allure-couture-c809-03.jpg")],
  "amethyst-dream": [cdnUrl("allure-couture-c810-01.jpg"), cdnUrl("allure-couture-c810-02.jpg"), cdnUrl("allure-couture-c810-03.jpg")],
  "ethereal-rose": [cdnUrl("allure-couture-c811nc-01.jpg"), cdnUrl("allure-couture-c811nc-02.jpg"), cdnUrl("allure-couture-c811nc-03.jpg")],
  "lumiere": [cdnUrl("abella-e555-morisot-01.jpg"), cdnUrl("abella-e555-morisot-02.jpg")],
  "goldina": [cdnUrl("allure-women-w554-01.jpg"), cdnUrl("allure-women-w554-02.jpg")],
  "enchanted-garden": [cdnUrl("allure-couture-c780-01.jpg"), cdnUrl("allure-couture-c780-02.jpg")],
  "seraphina": [cdnUrl("allure-bridals-a1402-01.jpg"), cdnUrl("allure-bridals-a1402-02.jpg")],
  "midnight-bloom": [cdnUrl("abella-e556-este-01.jpg"), cdnUrl("abella-e556-este-02.jpg"), cdnUrl("abella-e556-este-03.jpg")],
  "divina-lux": [cdnUrl("allure-couture-c781-01.jpg"), cdnUrl("allure-couture-c781-02.jpg"), cdnUrl("allure-couture-c781-03.jpg")],
  "cherished-moment": [cdnUrl("allure-couture-c760-01.jpg"), cdnUrl("allure-couture-c760-02.jpg")],
  "celestial-bloom": [cdnUrl("abella-e557-geer-01.jpg"), cdnUrl("abella-e557-geer-02.jpg")],
  "blossom-trail": [cdnUrl("abella-e558-dupre-01.jpg"), cdnUrl("abella-e558-dupre-02.jpg")],
  "opulent-whisper": [cdnUrl("abella-e559-becker-01.jpg"), cdnUrl("abella-e559-becker-02.jpg")],
  "sapphire-twilight": [cdnUrl("allure-bridals-a1410-01.jpg"), cdnUrl("allure-bridals-a1410-02.jpg")],
  "gilded-dream": [cdnUrl("abella-e560-bernini-01.jpg"), cdnUrl("abella-e560-bernini-02.jpg"), cdnUrl("abella-e560-bernini-03.jpg")],
  "rosalina": [cdnUrl("allure-couture-c760j-01.jpg"), cdnUrl("allure-couture-c760j-02.jpg"), cdnUrl("allure-couture-c760j-03.jpg")],
  "sovereign-drape": [cdnUrl("allure-couture-c782nc-01.jpg"), cdnUrl("allure-couture-c782nc-02.jpg"), cdnUrl("allure-couture-c782nc-03.jpg")],
  "nathalie": [cdnUrl("allure-bridals-a1403-01.jpg"), cdnUrl("allure-bridals-a1403-02.jpg")],
  "alaia": [cdnUrl("allure-bridals-a1404-01.jpg"), cdnUrl("allure-bridals-a1404-02.jpg")],
  "cascadia": [cdnUrl("allure-bridals-a1405-01.jpg"), cdnUrl("allure-bridals-a1405-02.jpg")],
  "renata": [cdnUrl("allure-bridals-a1406-01.jpg"), cdnUrl("allure-bridals-a1406-02.jpg")],
  "aurora-veil": [cdnUrl("allure-bridals-a1407-01.jpg"), cdnUrl("allure-bridals-a1407-02.jpg")],
  "elysian": [cdnUrl("allure-bridals-a1408-01.jpg"), cdnUrl("allure-bridals-a1408-02.jpg")],
  "daphne": [cdnUrl("allure-women-w555-01.jpg"), cdnUrl("allure-women-w555-02.jpg")],
  "fiora": [cdnUrl("allure-women-w556-01.jpg"), cdnUrl("allure-women-w556-02.jpg")],
  "celine": [cdnUrl("allure-women-w540-01.jpg"), cdnUrl("allure-women-w540-02.jpg")],
  "soleil": [cdnUrl("allure-women-w541-01.jpg"), cdnUrl("allure-women-w541-02.jpg")],
  "isadora": [cdnUrl("allure-women-w542-01.jpg"), cdnUrl("allure-women-w542-02.jpg")],
  "vivara": [cdnUrl("allure-women-w544-01.jpg"), cdnUrl("allure-women-w544-02.jpg")],
  "liora": [cdnUrl("allure-women-w545-01.jpg"), cdnUrl("allure-women-w545-02.jpg")],
  "bellina": [cdnUrl("allure-women-w546-01.jpg"), cdnUrl("allure-women-w546-02.jpg")],
  "estrella": [cdnUrl("allure-women-w547-01.jpg"), cdnUrl("allure-women-w547-02.jpg"), cdnUrl("allure-women-w547-03.jpg")],
  "diva": [cdnUrl("allure-women-w548-01.jpg"), cdnUrl("allure-women-w548-02.jpg"), cdnUrl("allure-women-w548-03.jpg")],
  "cashmere-cloud": [cdnUrl("allure-couture-c783-01.jpg"), cdnUrl("allure-couture-c783-02.jpg"), cdnUrl("allure-couture-c783-03.jpg")],
  "midnight-luxe": [cdnUrl("allure-couture-c784-01.jpg"), cdnUrl("allure-couture-c784-02.jpg"), cdnUrl("allure-couture-c784-03.jpg")],
  "crystalline": [cdnUrl("allure-couture-c785-01.jpg"), cdnUrl("allure-couture-c785-02.jpg"), cdnUrl("allure-couture-c785-03.jpg")],
  "adrienne": [cdnUrl("allure-women-w549-01.jpg"), cdnUrl("allure-women-w549-02.jpg")],
  "opulent-rose": [cdnUrl("allure-couture-c786-01.jpg"), cdnUrl("allure-couture-c786-02.jpg"), cdnUrl("allure-couture-c786-03.jpg")],
  "luna-garden": [cdnUrl("allure-women-w520-01.jpg"), cdnUrl("allure-women-w520-02.jpg")],
  "noir-enchantment": [cdnUrl("allure-couture-c787-01.jpg"), cdnUrl("allure-couture-c787-02.jpg"), cdnUrl("allure-couture-c787-03.jpg")],
  "primavera": [cdnUrl("allure-couture-c788-01.jpg"), cdnUrl("allure-couture-c788-02.jpg"), cdnUrl("allure-couture-c788-03.jpg")],
  "fantasia": [cdnUrl("allure-women-w543-01.jpg"), cdnUrl("allure-women-w543-02.jpg"), cdnUrl("allure-women-w543-03.jpg")],
};
`;
}

main().catch(console.error);
