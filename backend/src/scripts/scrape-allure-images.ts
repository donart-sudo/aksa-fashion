/**
 * Scrape high-quality bridal gown images from Allure Bridals (Shopify store).
 *
 * Usage:  npx tsx src/scripts/scrape-allure-images.ts
 *
 * Downloads portrait-orientation images (3 per product) from 4 collections
 * and saves them to backend/static/ with clean filenames.
 * Generates image-manifest.json for the mapping step.
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";

// ── Config ──────────────────────────────────────────────────────────────────

const COLLECTIONS = [
  "allure-bridals",
  "allure-couture",
  "abella",
  "allure-women",
] as const;

const STATIC_DIR = path.resolve(__dirname, "../../static");
const MANIFEST_PATH = path.resolve(__dirname, "image-manifest.json");
const IMAGES_PER_PRODUCT = 3;
const DELAY_MS = 400; // delay between downloads
const MAX_RETRIES = 3;

// ── Types ───────────────────────────────────────────────────────────────────

interface ShopifyImage {
  src: string;
  width: number;
  height: number;
}

interface ShopifyProduct {
  title: string;
  handle: string;
  images: ShopifyImage[];
}

interface ManifestEntry {
  collection: string;
  handle: string;
  title: string;
  files: string[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJSON(url: string): Promise<{ products: ShopifyProduct[] }> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "AksaFashion/1.0" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (loc) return fetchJSON(loc).then(resolve, reject);
          return reject(new Error(`Redirect with no location`));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON from ${url}`));
          }
        });
      })
      .on("error", reject);
  });
}

function downloadFile(url: string, dest: string, retries = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { "User-Agent": "AksaFashion/1.0" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
          const loc = res.headers.location;
          if (loc) return downloadFile(loc, dest, retries).then(resolve, reject);
          return reject(new Error(`Redirect with no location`));
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          if (retries < MAX_RETRIES) {
            return sleep(1000 * (retries + 1))
              .then(() => downloadFile(url, dest, retries + 1))
              .then(resolve, reject);
          }
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        if (retries < MAX_RETRIES) {
          sleep(1000 * (retries + 1))
            .then(() => downloadFile(url, dest, retries + 1))
            .then(resolve, reject);
        } else {
          reject(err);
        }
      });
  });
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Ensure static dir exists
  if (!fs.existsSync(STATIC_DIR)) {
    fs.mkdirSync(STATIC_DIR, { recursive: true });
  }

  const manifest: ManifestEntry[] = [];
  let totalDownloaded = 0;

  for (const collection of COLLECTIONS) {
    console.log(`\n━━━ Fetching collection: ${collection} ━━━`);
    const url = `https://www.allurebridals.com/collections/${collection}/products.json?limit=250`;

    let data: { products: ShopifyProduct[] };
    try {
      data = await fetchJSON(url);
    } catch (err) {
      console.error(`  ✗ Failed to fetch ${collection}: ${err}`);
      continue;
    }

    console.log(`  Found ${data.products.length} products`);

    for (const product of data.products) {
      // Filter for portrait images (height > width)
      const portraits = product.images.filter(
        (img) => img.height > img.width
      );

      if (portraits.length === 0) {
        console.log(`  ⊘ ${product.handle}: no portrait images, skipping`);
        continue;
      }

      const toDownload = portraits.slice(0, IMAGES_PER_PRODUCT);
      const files: string[] = [];

      for (let i = 0; i < toDownload.length; i++) {
        const img = toDownload[i];
        const ext = "jpg"; // Shopify CDN serves JPG
        const filename = `${collection}-${product.handle}-${String(i + 1).padStart(2, "0")}.${ext}`;
        const dest = path.join(STATIC_DIR, filename);

        // Skip if already downloaded
        if (fs.existsSync(dest)) {
          console.log(`  ✓ ${filename} (cached)`);
          files.push(filename);
          continue;
        }

        try {
          await downloadFile(img.src, dest);
          console.log(`  ↓ ${filename}`);
          files.push(filename);
          totalDownloaded++;
          await sleep(DELAY_MS);
        } catch (err) {
          console.error(`  ✗ ${filename}: ${err}`);
        }
      }

      manifest.push({
        collection,
        handle: product.handle,
        title: product.title,
        files,
      });
    }
  }

  // Write manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n━━━ Done ━━━`);
  console.log(`Downloaded: ${totalDownloaded} new images`);
  console.log(`Manifest: ${manifest.length} products → ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
