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

// ─── Aksa Fashion Product Data (scraped from ariart.shop) ──────────────────

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
      "https://ariart.shop/wp-content/uploads/2026/01/Verdant-Grace-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Verdant-Grace-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Mont-enneige-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Mont-enneige-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Vlera-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Vlera1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Solar-Elegance-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Solar-Elegance-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Maison-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Maison-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Arbennelle-gold-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Arbennelle-gold-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Crystal-Bloom-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Crystal-Bloom-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Snow-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Snow-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Midnight-Gold-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Midnight-Gold-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Ellea-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Ellea-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Lilac-Queen-Gown1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Lilac-Queen-gown-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Royal-Lilac-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Royal-Lilac1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Royal-Lilac-Aura-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Royal-Lilac-Aura-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Lumi-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Lumi1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Diva1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Diva-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Ari-royal-pink-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Ari-royal-pink-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Golden-Dawn-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Golden-Dawn1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Ari-Art-Emerald-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Ari-Art-Emerald-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2026/01/Imperial-Flame-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2026/01/Imperial-Flame1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/10/Sun-Goddess-1-scaled.webp",
      "https://ariart.shop/wp-content/uploads/2025/10/Sun-Goddess-2-scaled.webp",
      "https://ariart.shop/wp-content/uploads/2025/10/Sun-Goddess-3-scaled.webp",
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
    images: ["https://ariart.shop/wp-content/uploads/2025/10/Pure-Eternity-1-scaled.webp"],
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
      "https://ariart.shop/wp-content/uploads/2025/02/Noir-Beauty-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Noir-Beauty-3-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Noir-Beauty-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/02/Pure-Essence-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Pure-Essence-3-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Pure-Essence-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/02/Jade-Elegance-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Jade-Elegance-3-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Jade-Elegance-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/02/Emerald-Empress-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Emerald-Empress-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Emerald-Empress-3-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/02/Red-Empress-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Red-Empress-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Red-Empress-3-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/02/Sahara-Glow-1-min-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Sahara-Glow-2-min-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Sahara-Glow-3-min-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/02/Raquela-1-min-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Raquela-2-min-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Raquela-3-min-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/02/Goldina-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Goldina-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/11-1.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/10-2.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/20.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/22.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/21.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/35-1.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/36-1.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/37-1.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/18-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/17-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/19-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/1-4.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/2-4.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/3-3.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/30-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/31-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/32-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/21-2.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/20-2.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/22-2.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/14-1.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/15-2.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/16-2.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/9-3.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/10-3.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/19-1.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/18-1.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/17-1.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/02/Rosalina-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Rosalina-3-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Rosalina-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/02/Bledina-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Bledina-3-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2025/02/Bledina-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/06/Nathalie-2-scaled.avif",
      "https://ariart.shop/wp-content/uploads/2025/06/Nathalie-scaled.avif",
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
      "https://ariart.shop/wp-content/uploads/2025/06/Anais-2.avif",
      "https://ariart.shop/wp-content/uploads/2025/06/Anais.avif",
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
      "https://ariart.shop/wp-content/uploads/2025/06/Donatella-2.avif",
      "https://ariart.shop/wp-content/uploads/2025/06/Donatella-.avif",
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
      "https://ariart.shop/wp-content/uploads/2025/06/Renata.avif",
      "https://ariart.shop/wp-content/uploads/2025/06/Renata-2-scaled.avif",
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
      "https://ariart.shop/wp-content/uploads/2025/06/Elodie-2.avif",
      "https://ariart.shop/wp-content/uploads/2025/06/Elodie.avif",
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
      "https://ariart.shop/wp-content/uploads/2025/06/Natcha-1.avif",
      "https://ariart.shop/wp-content/uploads/2025/06/Natcha-2-scaled.avif",
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
      "https://ariart.shop/wp-content/uploads/2024/12/10-4-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/9-4-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/7-3-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/8-3-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/5-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/6-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/3-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/4-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/1-3-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/2-3-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/26-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/25-1-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/24-1-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/23-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/1-5-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/2-5-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/34-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/35-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/33-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/6-4-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/5-4-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/4-4-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/31-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/32-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/30-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/44-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/43-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/42-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/51-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/53-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/52-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/38-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/37-2-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/36-2-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/67-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/68-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/69.jpg",
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
      "https://ariart.shop/wp-content/uploads/2024/12/12-4-scaled.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/10-5.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/11-4-scaled.jpg",
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
      "https://ariart.shop/wp-content/uploads/2025/10/Golden-majesty-1.webp",
      "https://ariart.shop/wp-content/uploads/2025/10/Golden-majesty-3.webp",
      "https://ariart.shop/wp-content/uploads/2025/10/Golden-majesty-2.webp",
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
      "https://ariart.shop/wp-content/uploads/2025/10/Crimson-Empress-1-scaled.webp",
      "https://ariart.shop/wp-content/uploads/2025/10/Crimson-Empress-2-scaled.webp",
      "https://ariart.shop/wp-content/uploads/2025/10/Crimson-Empress-3-scaled.webp",
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
      "https://ariart.shop/wp-content/uploads/2024/12/1-2.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/2-2.jpg",
      "https://ariart.shop/wp-content/uploads/2024/12/3-1.jpg",
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
  const region = regionResult[0];

  // ── 3. Tax Regions ──
  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });

  // ── 4. Stock Location (Prishtina) ──
  logger.info("Seeding stock location...");
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
  const stockLocation = stockLocationResult[0];

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
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: CATEGORIES.map((name) => ({
        name,
        is_active: true,
      })),
    },
  });

  // ── 8. Products (all 65 scraped products) ──
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
