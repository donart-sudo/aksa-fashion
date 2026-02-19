import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

// ─── Aksa Fashion Product Data ─────────────────────────────────────────────

interface SeedProduct {
  name: string;
  slug: string;
  price: number; // EUR whole numbers
  regularPrice: number;
  salePrice?: number;
  description: string;
  images: string[];
  category: string; // must match a category name below
  colors: string[];
  sizes: string[];
  inStock: boolean;
}

const CATEGORIES = [
  "Bridal",
  "Ball Gown",
  "Cape and Train Elegance",
  "Evening Dress",
  "Royal Over Train",
  "Ruffled Dream",
  "Silhouette Whisper",
] as const;

const PRODUCTS: SeedProduct[] = [
  // ── New Collection (Jan-Feb 2026) ──
  {
    name: "Verdant Grace",
    slug: "verdant-grace",
    price: 980,
    regularPrice: 980,
    description: "A sophisticated nude dress enhanced by a grand green cape that adds movement, depth, and couture presence.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C800-01.jpg?v=1761851936",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C800-04.jpg?v=1761851939",
    ],
    category: "Cape and Train Elegance",
    colors: ["Nude"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Mont Enneigé",
    slug: "mont-enneige",
    price: 840,
    regularPrice: 840,
    description: "Designed for women who own every room they enter.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E551-Lambri-Studio-01.jpg?v=1753978763",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E551-Lambri-05.jpg?v=1753978764",
    ],
    category: "Silhouette Whisper",
    colors: ["Black", "Brown", "Fuchsia", "Gold", "Lilac", "Navy Blue", "Orange", "Pink", "Red"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Vlera",
    slug: "vlera",
    price: 650,
    regularPrice: 650,
    description: "The Royale Vlera is a magnificent dress in deep cherry color, symbolizing passion, power, and timeless elegance.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C789-01.jpg?v=1752731654",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C789-02.jpg?v=1752731655",
    ],
    category: "Royal Over Train",
    colors: ["Cherry"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Solar Elegance",
    slug: "solar-elegance",
    price: 880,
    regularPrice: 880,
    description: "The rays of the sun embrace this majestic gown with a long train, illuminating elegance and beauty with every step.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E550-Carrington-Studio-01.jpg?v=1753978764",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E550-Carrington-02.jpg?v=1753980667",
    ],
    category: "Ruffled Dream",
    colors: ["Yellow"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Maison",
    slug: "maison",
    price: 930,
    regularPrice: 930,
    description: "Something you need to shine at any party to inspire and feel special and elegant.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E552-Studio-Browne-01.jpg?v=1753980948",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E552-Studio-Browne-04.jpg?v=1755183913",
    ],
    category: "Silhouette Whisper",
    colors: ["Nude"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Arbennelle Gold",
    slug: "arbennelle-gold",
    price: 930,
    regularPrice: 930,
    description: "Handcrafted golden elegance: Arbennelle Gold blends luxurious detail with timeless style.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E553-Studio-Hudson-01.jpg?v=1753978763",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E553-Hudson-02.jpg?v=1755184056",
    ],
    category: "Silhouette Whisper",
    colors: ["Gold"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Crystal Bloom",
    slug: "crystal-bloom",
    price: 1250,
    regularPrice: 1250,
    description: "Sparkle and bloom: a handcrafted stone-studded gown with 3D floral beauty.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1400-Studio-01.jpg?v=1761851890",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1400-01.jpg?v=1761851748",
    ],
    category: "Bridal",
    colors: ["White"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Snow",
    slug: "snow",
    price: 1470,
    regularPrice: 1470,
    description: "A white couture gown with floral embroidery, fitted silhouette, and elegant transparency for a luxurious look.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1401-Studio-01.jpg?v=1761851890",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1401-01.jpg?v=1761851748",
    ],
    category: "Bridal",
    colors: ["White"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Midnight Gold",
    slug: "midnight-gold",
    price: 960,
    regularPrice: 960,
    description: "A black couture gown with gold details, designed for elegance and shine.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E554-Studio-Paxson-04.jpg?v=1753978762",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E554-T120-Paxson-02.jpg?v=1755184206",
    ],
    category: "Silhouette Whisper",
    colors: ["Black"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Ellea",
    slug: "ellea",
    price: 950,
    regularPrice: 950,
    description: "Glamorous fitted silhouette with elegant cape, luxurious hand-embellished details, soft illusion sleeves, and statement train for red-carpet impact.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C801-02.jpg?v=1761851938",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C801-07.jpg?v=1761881916",
    ],
    category: "Cape and Train Elegance",
    colors: ["Peach"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Lilac Queen Gown",
    slug: "lilac-queen-gown",
    price: 930,
    regularPrice: 930,
    description: "A gown crafted with elegance to shine among diamonds.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C802-01.jpg?v=1761851937",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C802-02.jpg?v=1761851939",
    ],
    category: "Cape and Train Elegance",
    colors: ["Lilac"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Royal Lilac",
    slug: "royal-lilac",
    price: 730,
    regularPrice: 730,
    description: "The Royal Lilac gown blends elegance with regal glamour, featuring a figure-hugging silhouette adorned with hand-beaded pearls and crystals.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C803-01.jpg?v=1761851937",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C803-03.jpg?v=1761851939",
    ],
    category: "Cape and Train Elegance",
    colors: ["Lilac"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Royal Lilac Aura",
    slug: "royal-lilac-aura",
    price: 1150,
    regularPrice: 1150,
    description: "Hand-embellished crystal embroidery with dramatic lilac ruffled sleeves.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C804NC-01.jpg?v=1761851935",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C804NC-05.jpg?v=1761851938",
    ],
    category: "Cape and Train Elegance",
    colors: ["Lilac"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Lumi",
    slug: "lumi",
    price: 940,
    regularPrice: 940,
    description: "Sculpted, figure-hugging silhouette with hand-embellished crystal detailing, statement puff sleeves, flowing draped cape panels, and elegant floor-length finish.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C805-01.jpg?v=1761851938",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C805-05.jpg?v=1761851939",
    ],
    category: "Cape and Train Elegance",
    colors: ["Baby Blue"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Diva",
    slug: "diva",
    price: 960,
    regularPrice: 960,
    description: "Where luxury meets timeless sophistication.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W550-Studio-01.jpg?v=1761857122",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W550-02.jpg?v=1761857785",
    ],
    category: "Evening Dress",
    colors: ["Black"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Ari Royal Pink",
    slug: "ari-royal-pink",
    price: 880,
    regularPrice: 880,
    description: "A pink dress that radiates finesse and romance, designed to emphasize the natural elegance of the silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C806-01.jpg?v=1761851937",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C806-05.jpg?v=1761851939",
    ],
    category: "Cape and Train Elegance",
    colors: ["Pink"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Golden Dawn",
    slug: "golden-dawn",
    price: 960,
    regularPrice: 960,
    description: "The Golden Dawn gown is long and flowing, made of shimmering fabric. Its vibrant yellow hue and flared hem create an elegant, eye-catching look.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C807-01.jpg?v=1761851938",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C807J-C807-05.jpg?v=1761851939",
    ],
    category: "Cape and Train Elegance",
    colors: ["Yellow"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Ari Art Emerald",
    slug: "ari-art-emerald",
    price: 960,
    regularPrice: 960,
    description: "Ari Art Emerald Glow features a handcrafted corset, intricate golden embroidery, and ruby accents, creating a flawless couture silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W551-Studio-01.jpg?v=1761857122",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W551-06.jpg?v=1761857711",
    ],
    category: "Evening Dress",
    colors: ["Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Imperial Flame",
    slug: "imperial-flame",
    price: 960,
    regularPrice: 960,
    description: "Luxury evening dress in red with gold details, featuring an elegant cut and design that highlights the silhouette. Ideal for special events.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W552-Studio-01.jpg?v=1761857122",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W552-01.jpg?v=1761857636",
    ],
    category: "Evening Dress",
    colors: ["Red"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  // ── Popular Products ──
  {
    name: "Sun Goddess",
    slug: "sun-goddess",
    price: 650,
    regularPrice: 650,
    description: "Hand-embroidered crystal detailing, 3D floral appliqués, lustrous gold velvet with elegant draping, fitted silhouette with flowing train.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C808-CP75-01.jpg?v=1761851938",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C808-CP75-06.jpg?v=1761851939",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C808-04.jpg?v=1761851938",
    ],
    category: "Cape and Train Elegance",
    colors: ["Beige"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Pure Eternity",
    slug: "pure-eternity",
    price: 980,
    regularPrice: 980,
    description: "Handcrafted 3D floral appliqués in metallic gold, luxurious velvet drape with dramatic train, sheer illusion bodice with intricate beadwork and crystals.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W553-Studio-01.jpg?v=1761857122",
    ],
    category: "Evening Dress",
    colors: ["Gold"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Noir Beauty",
    slug: "noir-beauty",
    price: 1250,
    regularPrice: 1250,
    description: "Over train long sleeves. Silhouette design embellished with lace details.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C790-01.jpg?v=1752731652",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C790-02.jpg?v=1752731652",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C790-03.jpg?v=1752731651",
    ],
    category: "Royal Over Train",
    colors: ["Black"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Pure Essence",
    slug: "pure-essence",
    price: 1150,
    regularPrice: 1150,
    description: "Deep v-neck. Detachable over train. Long sleeve embellished with lace detail.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C791-01.jpg?v=1752731654",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C791-02.jpg?v=1752731652",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C791-04.jpg?v=1752731651",
    ],
    category: "Royal Over Train",
    colors: ["Dark Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Jade Elegance",
    slug: "jade-elegance",
    price: 630,
    regularPrice: 630,
    description: "Long sleeves. Deep V neckline. Ball gown with added lace parts through the dress and embellished with silver rhinestones.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1409-Studio-01.jpg?v=1761851889",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1409-02.jpg?v=1761851752",
    ],
    category: "Ball Gown",
    colors: ["Dark Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Emerald Empress",
    slug: "emerald-empress",
    price: 580,
    regularPrice: 580,
    description: "High Neck. Long Sleeves with lace straight fitted.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C809-01.jpg?v=1761851937",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C809-07.jpg?v=1761851939",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C809-03.jpg?v=1761851937",
    ],
    category: "Cape and Train Elegance",
    colors: ["Dark Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Red Empress",
    slug: "red-empress",
    price: 730,
    regularPrice: 730,
    description: "Bright red dress with georgette wrapped through the waist and two capes flowing. Long sleeves. Mermaid silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C810-01.jpg?v=1761851937",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C810-05.jpg?v=1761851938",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C810-02.jpg?v=1761851937",
    ],
    category: "Cape and Train Elegance",
    colors: ["Blue", "Green", "Purple", "Red"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Sahara Glow",
    slug: "sahara-glow",
    price: 750,
    regularPrice: 750,
    description: "Yellow sand color, ruffled detail from waist up to shoulder, exaggerated Large Crystal Choker Necklace, one side tail and silver rhinestones.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C811NC-01.jpg?v=1761851938",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C811NC-04.jpg?v=1761851939",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C811NC-03.jpg?v=1761851938",
    ],
    category: "Cape and Train Elegance",
    colors: ["Burgundy", "Green", "Mint", "Navy Blue", "Orange", "Sand Yellow"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Raquela",
    slug: "raquela",
    price: 860,
    regularPrice: 860,
    description: "Corset shape, silhouette, embellished with gold stones.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E555-Studio-Morisot-01.jpg?v=1753978761",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E555-Morisot-03.jpg?v=1753978762",
    ],
    category: "Silhouette Whisper",
    colors: ["Gold", "Silver"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Goldina",
    slug: "goldina",
    price: 880,
    regularPrice: 880,
    description: "Mermaid silhouette, leaf details in one side of bustier that are handmade, wide side-skirt.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W554-Studio-01.jpg?v=1761857122",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W554-02.jpg?v=1761857497",
    ],
    category: "Evening Dress",
    colors: ["Gold"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  // ── Sale Items ──
  {
    name: "Genevieve",
    slug: "genevieve",
    price: 294,
    regularPrice: 420,
    salePrice: 294,
    description: "Long sleeves, Deep V-neckline, Side tail.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C780-01.jpg?v=1752731652",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C780-V083-02.jpg?v=1752731651",
    ],
    category: "Cape and Train Elegance",
    colors: ["Dark Green", "Light Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Ajma",
    slug: "ajma",
    price: 468,
    regularPrice: 780,
    salePrice: 468,
    description: "Long sleeves, Deep V-neckline, Mermaid silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1402-Studio-01.jpg?v=1761851888",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1402-01-New.jpg?v=1770410780",
    ],
    category: "Bridal",
    colors: ["White"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Siera",
    slug: "siera",
    price: 336,
    regularPrice: 480,
    salePrice: 336,
    description: "Mermaid silhouette. Long sleeves. Burgundy lace.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E556-Studio-Este-01.jpg?v=1753978761",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E556-Este-06.jpg?v=1755184340",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E556-Este-10.jpg?v=1755184340",
    ],
    category: "Silhouette Whisper",
    colors: ["Red", "Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  // ── Classic Collection ──
  {
    name: "Ione",
    slug: "ione",
    price: 830,
    regularPrice: 830,
    description: "Light green fabric with purple 3D flowers. Mermaid silhouette with satin side train. Ruffled off shoulder satin.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C781-01.jpg?v=1752731651",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C781-02.jpg?v=1752731651",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C781-06.jpg?v=1753264381",
    ],
    category: "Cape and Train Elegance",
    colors: ["Light Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Yara",
    slug: "yara",
    price: 730,
    regularPrice: 730,
    description: "Bright red beaded fabric in mermaid style. Two satin folds at waist and shoulder. Removable overtrain with embellished belt.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C760-01.jpg?v=1752899833",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C760-02.jpg?v=1752899833",
    ],
    category: "Royal Over Train",
    colors: ["Burgundy", "Green", "Red"],
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
  },
  {
    name: "Eumelia",
    slug: "eumelia",
    price: 430,
    regularPrice: 430,
    description: "Off shoulder embellished with lace details. Scalloped sleeves. Mermaid silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E557-Studio-Geer-01.jpg?v=1753978761",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E557-Studio-Geer-04.jpg?v=1753978761",
    ],
    category: "Silhouette Whisper",
    colors: ["Blue"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Thea",
    slug: "thea",
    price: 430,
    regularPrice: 430,
    description: "Beige satin with beaded straps and bustier. Straight fit. Sleeves with nude tulle and scattered beads. Draped satin flowing as side tail embellished with pearls.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E558-Studio-Dupre-01.jpg?v=1753978761",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E558-Dupre-02.jpg?v=1753978759",
    ],
    category: "Silhouette Whisper",
    colors: ["Blue", "Light Pink", "Red", "Silver"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Paola",
    slug: "paola",
    price: 780,
    regularPrice: 780,
    description: "Mermaid silhouette. Red feathered corset. Crystal-embellished.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E559-Studio-Becker-01.jpg?v=1753978761",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E559-Studio-Becker-02.jpg?v=1753978761",
    ],
    category: "Silhouette Whisper",
    colors: ["Red"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Borah",
    slug: "borah",
    price: 520,
    regularPrice: 520,
    description: "Red satin. Fitted waist. Handmade embellishments on ball gown. Cut-out neckline. Long sleeves.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1410-Studio-01.jpg?v=1761851891",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1410-01.jpg?v=1762139252",
    ],
    category: "Ball Gown",
    colors: ["Red"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Beena",
    slug: "beena",
    price: 470,
    regularPrice: 470,
    description: "High neck. Feathered. Mermaid dress. Long sleeves.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E560-Studio-Bermini-01.jpg?v=1753978761",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E560-Bernini-01.jpg?v=1755184557",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/E560-Studio-Bermini-02.jpg?v=1755184557",
    ],
    category: "Silhouette Whisper",
    colors: ["Black"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Rosalina",
    slug: "rosalina",
    price: 1070,
    regularPrice: 1070,
    description: "Long sleeves. Wrapped satin on the shoulders and bustier. Silver and pink rhinestones. Royal overtrain with few extra details from the beaded fabric.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C760J-01.jpg?v=1752899844",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C760J-02.jpg?v=1752899850",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C760J-03.jpg?v=1752899845",
    ],
    category: "Royal Over Train",
    colors: ["Dark Blue", "Pink"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Bledina",
    slug: "bledina",
    price: 930,
    regularPrice: 930,
    description: "Deep V-neckline. Long sleeves. Mermaid silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C782NC-01.jpg?v=1752731653",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C782NC-02.jpg?v=1752731653",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C782NC-03.jpg?v=1752731653",
    ],
    category: "Cape and Train Elegance",
    colors: ["Turquoise"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  // ── Bridal Collection ──
  {
    name: "Nathalie",
    slug: "nathalie",
    price: 625,
    regularPrice: 1250,
    salePrice: 625,
    description: "Hanging tassels short sleeves, mermaid silhouette, beading details. A breathtaking blend of glamour and sophistication.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1403-Studio-01.jpg?v=1761851890",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1403-05.jpg?v=1761851750",
    ],
    category: "Bridal",
    colors: ["Off White"],
    sizes: ["L", "M"],
    inStock: false,
  },
  {
    name: "Anaïs",
    slug: "anais",
    price: 1470,
    regularPrice: 1470,
    description: "Bold, sculptural, and seductively elegant — a form-fitting mermaid gown crafted with sheer illusion fabric and dramatic bead embroidery.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1404-Studio-01.jpg?v=1761851888",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1404-02.jpg?v=1761851747",
    ],
    category: "Bridal",
    colors: ["Off White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Donatella",
    slug: "donatella",
    price: 1050,
    regularPrice: 2100,
    salePrice: 1050,
    description: "A bridal ball gown with long sleeves exudes timeless elegance, featuring a fitted bodice, voluminous skirt, and graceful sleeves.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1405-Studio-01.jpg?v=1761851890",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1405-07.jpg?v=1761851753",
    ],
    category: "Bridal",
    colors: ["White"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Renata",
    slug: "renata",
    price: 1050,
    regularPrice: 2100,
    salePrice: 1050,
    description: "Radiating elegance and romance in a fairytale-inspired wedding gown with deep plunging neckline and voluminous A-line skirt.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1406-Studio-01.jpg?v=1761851890",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1406-18.jpg?v=1761851748",
    ],
    category: "Bridal",
    colors: ["White"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Elodie",
    slug: "elodie",
    price: 2100,
    regularPrice: 2100,
    description: "Deep V neckline ball gown embellished with pearls. A bridal ball gown featuring a corset that combines regal elegance with a fitted bodice.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1407-Studio-01.jpg?v=1761851890",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1407-02.jpg?v=1761851749",
    ],
    category: "Bridal",
    colors: ["White"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Natcha",
    slug: "natcha",
    price: 1100,
    regularPrice: 1100,
    description: "An exquisite gown featuring a fitted corset embellished with delicate lace flowers. A dramatic side skirt crafted from layers of airy tulle.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1408-Studio-01.jpg?v=1761851889",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/A1408-01.jpg?v=1761851753",
    ],
    category: "Bridal",
    colors: ["White"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  // ── Evening / Velvet Collection ──
  {
    name: "Daphne",
    slug: "daphne",
    price: 570,
    regularPrice: 570,
    description: "Emerald green velvet adorned with off-white lace and green rhinestone embellishments. Featuring an irregular cut-out, shoulder pads with hanging silver tassels.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W555-Studio-01.jpg?v=1761857450",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W555-08.jpg?v=1761857450",
    ],
    category: "Evening Dress",
    colors: ["Emerald Green"],
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
  },
  {
    name: "Linus",
    slug: "linus",
    price: 580,
    regularPrice: 580,
    description: "A luxurious black velvet dress with a deep V-neckline, ruched detailing on the hips, and a daring high side slit.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W556-01.jpg?v=1761856775",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W556-05.jpg?v=1761856774",
    ],
    category: "Evening Dress",
    colors: ["Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
  },
  {
    name: "Ophelia",
    slug: "ophelia",
    price: 580,
    regularPrice: 580,
    description: "Navy blue velvet with gray lace embellished with silver rhinestones and hanging silver tassels. Mermaid silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W540-Studio-01.jpg?v=1753596176",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W540-02.jpg?v=1753596193",
    ],
    category: "Evening Dress",
    colors: ["Navy Blue"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Pandora",
    slug: "pandora",
    price: 580,
    regularPrice: 580,
    description: "Champagne velvet dress with richly embellished corset, featuring middle cut-out in belly and bust, draped on the hips. Mermaid silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W541-Studio-01.jpg?v=1753596219",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W541-02.jpg?v=1755214394",
    ],
    category: "Evening Dress",
    colors: ["Champagne"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Kassia",
    slug: "kassia",
    price: 580,
    regularPrice: 580,
    description: "Black satin dress with a deep V-neckline and a sleek mermaid silhouette. Featuring satin sleeves and sparkling silver tassels.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W542-Studio-01.jpg?v=1753596203",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W542-Studio-02.jpg?v=1753596209",
    ],
    category: "Evening Dress",
    colors: ["Black"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  // ── More Silhouette / Cape Products ──
  {
    name: "Mira",
    slug: "mira",
    price: 670,
    regularPrice: 670,
    description: "A striking blend of elegance and allure in a rich green hue, featuring delicate hanging tassels, long sleeves, mermaid silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W544-Studio-01.jpg?v=1753596181",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W544-02.jpg?v=1755214445",
    ],
    category: "Silhouette Whisper",
    colors: ["Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Aloa",
    slug: "aloa",
    price: 740,
    regularPrice: 740,
    description: "Embellished with white and gold pearls, high slit, corset shape. A stunning fusion of opulence and elegance.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W545-Studio-01.jpg?v=1753596192",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W545-03.jpg?v=1755214468",
    ],
    category: "Silhouette Whisper",
    colors: ["Gold"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Cora",
    slug: "cora",
    price: 680,
    regularPrice: 680,
    description: "Mint beaded fabric embellished with shiny leaves and rhinestones. Mermaid silhouette. Deep V line.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W546-Studio-01.jpg?v=1753596179",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W546-01.jpg?v=1755214486",
    ],
    category: "Silhouette Whisper",
    colors: ["Mint"],
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: false,
  },
  {
    name: "Hyna",
    slug: "hyna",
    price: 780,
    regularPrice: 780,
    description: "A dramatic high-neck dress with a corset shape, featuring feathers on the sleeves and side for a striking, textured look.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W547-Studio-01.jpg?v=1753596195",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W547-03.jpg?v=1755214504",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W547-01.jpg?v=1755214504",
    ],
    category: "Silhouette Whisper",
    colors: ["Light Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Raya",
    slug: "raya",
    price: 570,
    regularPrice: 950,
    salePrice: 570,
    description: "Mermaid silhouette, long sleeves, bolero design, embellished with lace details. A breathtaking masterpiece.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W548-Studio-01.jpg?v=1753596193",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W548-02.jpg?v=1753596201",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W548-Studio-04.jpg?v=1753596194",
    ],
    category: "Silhouette Whisper",
    colors: ["Silver"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Nyl",
    slug: "nyl",
    price: 520,
    regularPrice: 520,
    description: "Green beaded fabric with long sleeves and deep neckline opening. Flowing Georgette creates a breathtaking silhouette.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C783-01.jpg?v=1752731652",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C783-02.jpg?v=1752731654",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C783-03.jpg?v=1752731651",
    ],
    category: "Cape and Train Elegance",
    colors: ["Black", "Gold", "Gray", "Light Purple"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Lenna",
    slug: "lenna",
    price: 790,
    regularPrice: 790,
    description: "Straps design, corset shape, embellished with stones, straight fitted. A sleek gown with intricate beadwork and shimmering geometric patterns.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C784-01.jpg?v=1752731652",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C784-02.jpg?v=1752731652",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C784-03.jpg?v=1752731653",
    ],
    category: "Cape and Train Elegance",
    colors: ["Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Hara",
    slug: "hara",
    price: 520,
    regularPrice: 520,
    description: "A stunning mermaid silhouette dress featuring a side tail for added drama. Folded fabric detailing over the bustier.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C785-01.jpg?v=1752731654",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C785-02.jpg?v=1752731655",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C785-03.jpg?v=1752731655",
    ],
    category: "Cape and Train Elegance",
    colors: ["Gold", "Gray", "Green", "Light Purple"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Vera",
    slug: "vera",
    price: 830,
    regularPrice: 830,
    description: "Mermaid silhouette with deep V-neckline. Collar with rhinestones. Corset shape with structured seams that cinch the waist.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W549-Studio-01.jpg?v=1753596198",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W549-03.jpg?v=1755214527",
    ],
    category: "Silhouette Whisper",
    colors: ["Black"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Naleena",
    slug: "naleena",
    price: 790,
    regularPrice: 790,
    description: "Mermaid silhouette with long sleeves. Turtle neck embellished with rhinestones spread all over up to hips. Side tail.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C786-01.jpg?v=1752731653",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C786-02.jpg?v=1752731652",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C786-03.jpg?v=1752731654",
    ],
    category: "Cape and Train Elegance",
    colors: ["Black"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Tyla",
    slug: "tyla",
    price: 840,
    regularPrice: 840,
    description: "High neck, cut-out back, long sleeves, straight fitted.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W520-01.jpg?v=1753596252",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W520-02.jpg?v=1753596281",
    ],
    category: "Silhouette Whisper",
    colors: ["Black"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    name: "Golden Majesty",
    slug: "golden-majesty",
    price: 552,
    regularPrice: 920,
    salePrice: 552,
    description: "One-shoulder gown hand-embellished with silver crystals on nude tulle. Fitted silhouette with royal side drape and long flowing cape.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C787-01.jpg?v=1752731652",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C787-02.jpg?v=1752731647",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C787-03.jpg?v=1752731653",
    ],
    category: "Cape and Train Elegance",
    colors: ["Gold"],
    sizes: ["M", "S"],
    inStock: false,
  },
  {
    name: "Crimson Empress",
    slug: "crimson-empress",
    price: 980,
    regularPrice: 980,
    description: "One-shoulder gown in deep red velvet, adorned with lavish crystal embellishments that radiate power and feminine luxury.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C788-01.jpg?v=1752731655",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C788-02.jpg?v=1752731655",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/C788-03.jpg?v=1752731654",
    ],
    category: "Cape and Train Elegance",
    colors: ["Cherry Red"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
  {
    name: "Seraphina",
    slug: "seraphina",
    price: 520,
    regularPrice: 520,
    description: "An evening/bridal wear dress with customization options available. Elegant silhouette in baby pink.",
    images: [
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W543-Studio-01.jpg?v=1753596214",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W543-02.jpg?v=1753596281",
      "https://cdn.shopify.com/s/files/1/0592/3396/0030/files/W543-01.jpg?v=1753596281",
    ],
    category: "Evening Dress",
    colors: ["Baby Pink"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: false,
  },
];


// ─── Helper: generate SKU from slug + size ──────────────────────────────────

function generateSku(slug: string, size: string): string {
  return `AF-${slug.toUpperCase().replace(/-/g, "")}-${size}`.substring(0, 40);
}

// ─── Helper: build variants for a product ───────────────────────────────────

function buildVariants(product: SeedProduct) {
  const hasMultipleColors = product.colors.length > 1;
  const options: { title: string; values: string[] }[] = [
    { title: "Size", values: product.sizes },
  ];
  if (hasMultipleColors) {
    options.push({ title: "Color", values: product.colors });
  }

  const variants: {
    title: string;
    sku: string;
    options: Record<string, string>;
    manage_inventory: boolean;
    prices: { amount: number; currency_code: string }[];
  }[] = [];

  if (hasMultipleColors) {
    // Create variant for each size × color combination
    for (const size of product.sizes) {
      for (const color of product.colors) {
        variants.push({
          title: `${size} / ${color}`,
          sku: generateSku(product.slug, `${size}-${color.replace(/\s+/g, "")}`),
          options: { Size: size, Color: color },
          manage_inventory: true,
          prices: [{ amount: product.price, currency_code: "eur" }],
        });
      }
    }
  } else {
    // Single color — variants per size only
    for (const size of product.sizes) {
      variants.push({
        title: size,
        sku: generateSku(product.slug, size),
        options: { Size: size },
        manage_inventory: true,
        prices: [{ amount: product.price, currency_code: "eur" }],
      });
    }
  }

  return { options, variants };
}

// ─── Update store currencies workflow ───────────────────────────────────────

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => ({
      selector: { id: data.input.store_id },
      update: {
        supported_currencies: data.input.supported_currencies.map((c) => ({
          currency_code: c.currency_code,
          is_default: c.is_default ?? false,
        })),
      },
    }));
    const stores = updateStoresStep(normalizedInput);
    return new WorkflowResponse(stores);
  }
);

// ─── Main Seed Function ─────────────────────────────────────────────────────

export default async function seedAksaFashion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  // Kosovo (XK) + key European markets
  const countries = ["xk", "al", "de", "at", "fr", "it", "gb", "ch", "nl", "be"];

  // ── 1. Store Setup ──
  logger.info("Setting up Aksa Fashion store...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        { currency_code: "eur", is_default: true },
        { currency_code: "usd" },
        { currency_code: "gbp" },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // ── 2. Region ──
  logger.info("Seeding regions...");
  let region: any;
  try {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europe",
            currency_code: "eur",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  } catch (e: any) {
    logger.info("Regions already exist, fetching existing...");
    const regionModule = container.resolve(Modules.REGION);
    const existing = await regionModule.listRegions({});
    region = existing[0];
  }

  // ── 3. Tax Regions ──
  logger.info("Seeding tax regions...");
  try {
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  } catch (e: any) {
    logger.info("Tax regions already exist, skipping...");
  }

  // ── 4. Stock Location (Prishtina) ──
  logger.info("Seeding stock location...");
  let stockLocation: any;
  try {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Aksa Fashion Atelier",
            address: {
              city: "Prishtina",
              country_code: "XK",
              address_1: "Rruga Rexhep Luci",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { default_location_id: stockLocation.id },
      },
    });

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });
  } catch (e: any) {
    logger.info("Stock location already exists, fetching existing...");
    const stockModule = container.resolve(Modules.STOCK_LOCATION);
    const existing = await stockModule.listStockLocations({});
    stockLocation = existing[0];
  }

  // ── 5. Fulfillment / Shipping ──
  logger.info("Seeding fulfillment...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [{ name: "Default Shipping Profile", type: "default" }],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  try {
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Aksa Fashion Shipping",
      type: "shipping",
      service_zones: [
        {
          name: "Europe",
          geo_zones: countries.map((c) => ({ country_code: c, type: "country" as const })),
        },
      ],
    });

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    });

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping (3-5 business days)",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Delivery in 3-5 business days.",
            code: "standard",
          },
          prices: [
            { currency_code: "eur", amount: 15 },
            { currency_code: "usd", amount: 18 },
            { currency_code: "gbp", amount: 13 },
            { region_id: region.id, amount: 15 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "Express Shipping (1-2 business days)",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Priority delivery in 1-2 business days.",
            code: "express",
          },
          prices: [
            { currency_code: "eur", amount: 30 },
            { currency_code: "usd", amount: 35 },
            { currency_code: "gbp", amount: 26 },
            { region_id: region.id, amount: 30 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "Free Shipping (orders over €150)",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Free",
            description: "Free shipping for orders over €150. Delivery in 3-5 business days.",
            code: "free",
          },
          prices: [
            { currency_code: "eur", amount: 0 },
            { currency_code: "usd", amount: 0 },
            { currency_code: "gbp", amount: 0 },
            { region_id: region.id, amount: 0 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
    logger.info("Finished fulfillment setup.");
  } catch (e: any) {
    logger.info("Fulfillment/shipping already exists, skipping...");
  }

  // ── 6. Publishable API Key ──
  logger.info("Seeding API keys...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: { type: "publishable" },
  });
  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          { title: "Aksa Fashion Storefront", type: "publishable", created_by: "" },
        ],
      },
    });
    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  // ── 7. Product Categories ──
  logger.info("Seeding product categories...");
  let categoryResult: any[];
  try {
    const { result } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: CATEGORIES.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
    categoryResult = result;
  } catch (e: any) {
    logger.info("Categories already exist, fetching existing...");
    const catModule = container.resolve(Modules.PRODUCT);
    categoryResult = await catModule.listProductCategories({}, { select: ["id", "name"] });
  }

  // ── 8. Products ──
  // Delete existing products and inventory items first so we can re-seed with new images
  logger.info("Deleting existing products and inventory...");
  const productModule = container.resolve(Modules.PRODUCT);
  const inventoryModule = container.resolve(Modules.INVENTORY);

  // Delete inventory items first (they reference product variants via SKU)
  const existingInventory = await inventoryModule.listInventoryItems({}, { select: ["id"], take: 1000 });
  if (existingInventory.length > 0) {
    await inventoryModule.deleteInventoryItems(existingInventory.map((i: any) => i.id));
    logger.info(`  Deleted ${existingInventory.length} inventory items.`);
  }

  // Now delete products
  const existingProducts = await productModule.listProducts({}, { select: ["id"], take: 200 });
  if (existingProducts.length > 0) {
    await productModule.deleteProducts(existingProducts.map((p: any) => p.id));
    logger.info(`  Deleted ${existingProducts.length} existing products.`);
  }

  logger.info(`Seeding ${PRODUCTS.length} products...`);

  // Batch products in groups of 10 to avoid overloading
  const BATCH_SIZE = 10;
  for (let i = 0; i < PRODUCTS.length; i += BATCH_SIZE) {
    const batch = PRODUCTS.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(PRODUCTS.length / BATCH_SIZE);

    logger.info(`  Product batch ${batchNum}/${totalBatches} (${batch.length} products)...`);

    const medusaProducts = batch.map((product) => {
      const { options, variants } = buildVariants(product);
      const categoryId = categoryResult.find(
        (cat) => cat.name === product.category
      )?.id;

      return {
        title: product.name,
        handle: product.slug,
        description: product.description,
        status: ProductStatus.PUBLISHED,
        weight: 2000, // ~2kg for gowns
        shipping_profile_id: shippingProfile!.id,
        category_ids: categoryId ? [categoryId] : [],
        images: product.images.map((url) => ({ url })),
        options,
        variants,
        sales_channels: [{ id: defaultSalesChannel[0].id }],
        metadata: {
          colors: JSON.stringify(product.colors),
          regular_price: String(product.regularPrice),
          ...(product.salePrice ? { sale_price: String(product.salePrice) } : {}),
          in_stock: String(product.inStock),
        },
      };
    });

    await createProductsWorkflow(container).run({
      input: { products: medusaProducts },
    });
  }
  logger.info(`Finished seeding ${PRODUCTS.length} products.`);

  // ── 8b. Link products to categories explicitly ──
  logger.info("Linking products to categories...");
  const allProducts = await productModule.listProducts({}, { select: ["id", "handle"], take: 200 });
  let linkedCount = 0;
  for (const product of PRODUCTS) {
    const categoryId = categoryResult.find(
      (cat: any) => cat.name === product.category
    )?.id;
    const dbProduct = allProducts.find((p: any) => p.handle === product.slug);
    if (categoryId && dbProduct) {
      await productModule.updateProducts(dbProduct.id, {
        category_ids: [categoryId],
      });
      linkedCount++;
    }
  }
  logger.info(`  Linked ${linkedCount} products to categories.`);

  // ── 9. Inventory Levels ──
  logger.info("Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = inventoryItems.map(
    (item) => ({
      location_id: stockLocation.id,
      inventory_item_id: item.id,
      stocked_quantity: 50, // Realistic quantity for couture fashion
    })
  );

  await createInventoryLevelsWorkflow(container).run({
    input: { inventory_levels: inventoryLevels },
  });
  logger.info("Finished seeding inventory levels.");

  logger.info("────────────────────────────────────────────");
  logger.info("  Aksa Fashion seed complete!");
  logger.info(`  ${PRODUCTS.length} products seeded`);
  logger.info(`  ${CATEGORIES.length} categories created`);
  logger.info(`  ${inventoryItems.length} inventory items tracked`);
  logger.info(`  Publishable API Key: ${publishableApiKey.id}`);
  logger.info("────────────────────────────────────────────");
}
