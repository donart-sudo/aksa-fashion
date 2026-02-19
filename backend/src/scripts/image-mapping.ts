/**
 * Maps each of the 66 Aksa Fashion products to scraped Allure Bridals images.
 *
 * Category → Source Collection mapping:
 *   Bridal (9)              → allure-bridals
 *   Ball Gown (2)           → allure-bridals
 *   Cape and Train (21)     → allure-couture
 *   Evening Dress (11)      → allure-women
 *   Royal Over Train (5)    → allure-couture
 *   Ruffled Dream (1)       → abella
 *   Silhouette Whisper (17) → abella + allure-women
 */

// Each entry: [main, hover, extra?]
// Filenames follow pattern: {collection}-{handle}-{01,02,03}.jpg

export const IMAGE_MAP: Record<string, string[]> = {
  // ══════════════════════════════════════════════════════════════════════════
  // CAPE AND TRAIN ELEGANCE (21 products) → allure-couture
  // ══════════════════════════════════════════════════════════════════════════
  "verdant-grace":    ["allure-couture-c800-01.jpg", "allure-couture-c800-02.jpg"],
  "ellea":            ["allure-couture-c801-01.jpg", "allure-couture-c801-02.jpg"],
  "lilac-queen-gown": ["allure-couture-c802-01.jpg", "allure-couture-c802-02.jpg"],
  "royal-lilac":      ["allure-couture-c803-01.jpg", "allure-couture-c803-02.jpg"],
  "royal-lilac-aura": ["allure-couture-c804nc-01.jpg", "allure-couture-c804nc-02.jpg"],
  "lumi":             ["allure-couture-c805-01.jpg", "allure-couture-c805-02.jpg"],
  "ari-royal-pink":   ["allure-couture-c806-01.jpg", "allure-couture-c806-02.jpg"],
  "golden-dawn":      ["allure-couture-c807-01.jpg", "allure-couture-c807-02.jpg"],
  "sun-goddess":      ["allure-couture-c808-01.jpg", "allure-couture-c808-02.jpg", "allure-couture-c808-03.jpg"],
  "emerald-empress":  ["allure-couture-c809-01.jpg", "allure-couture-c809-02.jpg", "allure-couture-c809-03.jpg"],
  "red-empress":      ["allure-couture-c810-01.jpg", "allure-couture-c810-02.jpg", "allure-couture-c810-03.jpg"],
  "sahara-glow":      ["allure-couture-c811nc-01.jpg", "allure-couture-c811nc-02.jpg", "allure-couture-c811nc-03.jpg"],
  "genevieve":        ["allure-couture-c780-01.jpg", "allure-couture-c780-02.jpg"],
  "ione":             ["allure-couture-c781-01.jpg", "allure-couture-c781-02.jpg", "allure-couture-c781-03.jpg"],
  "bledina":          ["allure-couture-c782nc-01.jpg", "allure-couture-c782nc-02.jpg", "allure-couture-c782nc-03.jpg"],
  "nyl":              ["allure-couture-c783-01.jpg", "allure-couture-c783-02.jpg", "allure-couture-c783-03.jpg"],
  "lenna":            ["allure-couture-c784-01.jpg", "allure-couture-c784-02.jpg", "allure-couture-c784-03.jpg"],
  "hara":             ["allure-couture-c785-01.jpg", "allure-couture-c785-02.jpg", "allure-couture-c785-03.jpg"],
  "naleena":          ["allure-couture-c786-01.jpg", "allure-couture-c786-02.jpg", "allure-couture-c786-03.jpg"],
  "golden-majesty":   ["allure-couture-c787-01.jpg", "allure-couture-c787-02.jpg", "allure-couture-c787-03.jpg"],
  "crimson-empress":  ["allure-couture-c788-01.jpg", "allure-couture-c788-02.jpg", "allure-couture-c788-03.jpg"],

  // ══════════════════════════════════════════════════════════════════════════
  // BRIDAL (9 products) → allure-bridals
  // ══════════════════════════════════════════════════════════════════════════
  "crystal-bloom": ["allure-bridals-a1400-01.jpg", "allure-bridals-a1400-02.jpg"],
  "snow":          ["allure-bridals-a1401-01.jpg", "allure-bridals-a1401-02.jpg"],
  "ajma":          ["allure-bridals-a1402-01.jpg", "allure-bridals-a1402-02.jpg"],
  "nathalie":      ["allure-bridals-a1403-01.jpg", "allure-bridals-a1403-02.jpg"],
  "anais":         ["allure-bridals-a1404-01.jpg", "allure-bridals-a1404-02.jpg"],
  "donatella":     ["allure-bridals-a1405-01.jpg", "allure-bridals-a1405-02.jpg"],
  "renata":        ["allure-bridals-a1406-01.jpg", "allure-bridals-a1406-02.jpg"],
  "elodie":        ["allure-bridals-a1407-01.jpg", "allure-bridals-a1407-02.jpg"],
  "natcha":        ["allure-bridals-a1408-01.jpg", "allure-bridals-a1408-02.jpg"],

  // ══════════════════════════════════════════════════════════════════════════
  // BALL GOWN (2 products) → allure-bridals
  // ══════════════════════════════════════════════════════════════════════════
  "jade-elegance": ["allure-bridals-a1409-01.jpg", "allure-bridals-a1409-02.jpg"],
  "borah":         ["allure-bridals-a1410-01.jpg", "allure-bridals-a1410-02.jpg"],

  // ══════════════════════════════════════════════════════════════════════════
  // EVENING DRESS (11 products) → allure-women
  // ══════════════════════════════════════════════════════════════════════════
  "diva":           ["allure-women-w550-01.jpg", "allure-women-w550-02.jpg"],
  "ari-art-emerald":["allure-women-w551-01.jpg", "allure-women-w551-02.jpg"],
  "imperial-flame": ["allure-women-w552-01.jpg", "allure-women-w552-02.jpg"],
  "pure-eternity":  ["allure-women-w553-01.jpg"],
  "goldina":        ["allure-women-w554-01.jpg", "allure-women-w554-02.jpg"],
  "daphne":         ["allure-women-w555-01.jpg", "allure-women-w555-02.jpg"],
  "linus":          ["allure-women-w556-01.jpg", "allure-women-w556-02.jpg"],
  "ophelia":        ["allure-women-w540-01.jpg", "allure-women-w540-02.jpg"],
  "pandora":        ["allure-women-w541-01.jpg", "allure-women-w541-02.jpg"],
  "kassia":         ["allure-women-w542-01.jpg", "allure-women-w542-02.jpg"],
  "seraphina":      ["allure-women-w543-01.jpg", "allure-women-w543-02.jpg", "allure-women-w543-03.jpg"],

  // ══════════════════════════════════════════════════════════════════════════
  // ROYAL OVER TRAIN (5 products) → allure-couture
  // ══════════════════════════════════════════════════════════════════════════
  "vlera":        ["allure-couture-c789-01.jpg", "allure-couture-c789-02.jpg"],
  "noir-beauty":  ["allure-couture-c790-01.jpg", "allure-couture-c790-02.jpg", "allure-couture-c790-03.jpg"],
  "pure-essence": ["allure-couture-c791-01.jpg", "allure-couture-c791-02.jpg", "allure-couture-c791-03.jpg"],
  "yara":         ["allure-couture-c760-01.jpg", "allure-couture-c760-02.jpg"],
  "rosalina":     ["allure-couture-c760j-01.jpg", "allure-couture-c760j-02.jpg", "allure-couture-c760j-03.jpg"],

  // ══════════════════════════════════════════════════════════════════════════
  // RUFFLED DREAM (1 product) → abella
  // ══════════════════════════════════════════════════════════════════════════
  "solar-elegance": ["abella-e550-carrington-01.jpg", "abella-e550-carrington-02.jpg"],

  // ══════════════════════════════════════════════════════════════════════════
  // SILHOUETTE WHISPER (17 products) → abella + allure-women
  // ══════════════════════════════════════════════════════════════════════════
  "mont-enneige":    ["abella-e551-lambri-01.jpg", "abella-e551-lambri-02.jpg"],
  "maison":          ["abella-e552-browne-01.jpg", "abella-e552-browne-02.jpg"],
  "arbennelle-gold": ["abella-e553-hudson-01.jpg", "abella-e553-hudson-02.jpg"],
  "midnight-gold":   ["abella-e554-paxson-01.jpg", "abella-e554-paxson-02.jpg"],
  "raquela":         ["abella-e555-morisot-01.jpg", "abella-e555-morisot-02.jpg"],
  "siera":           ["abella-e556-este-01.jpg", "abella-e556-este-02.jpg", "abella-e556-este-03.jpg"],
  "eumelia":         ["abella-e557-geer-01.jpg", "abella-e557-geer-02.jpg"],
  "thea":            ["abella-e558-dupre-01.jpg", "abella-e558-dupre-02.jpg"],
  "paola":           ["abella-e559-becker-01.jpg", "abella-e559-becker-02.jpg"],
  "beena":           ["abella-e560-bernini-01.jpg", "abella-e560-bernini-02.jpg", "abella-e560-bernini-03.jpg"],
  "mira":            ["allure-women-w544-01.jpg", "allure-women-w544-02.jpg"],
  "aloa":            ["allure-women-w545-01.jpg", "allure-women-w545-02.jpg"],
  "cora":            ["allure-women-w546-01.jpg", "allure-women-w546-02.jpg"],
  "hyna":            ["allure-women-w547-01.jpg", "allure-women-w547-02.jpg", "allure-women-w547-03.jpg"],
  "raya":            ["allure-women-w548-01.jpg", "allure-women-w548-02.jpg", "allure-women-w548-03.jpg"],
  "vera":            ["allure-women-w549-01.jpg", "allure-women-w549-02.jpg"],
  "tyla":            ["allure-women-w520-01.jpg", "allure-women-w520-02.jpg"],
};

// ── Editorial / Component picks ─────────────────────────────────────────────
// Hand-picked images for homepage components (dramatic, cinematic shots)

/** 4 hero slides for EditorialBanner */
export const HERO_IMAGES = [
  "allure-bridals-a1401-01.jpg",    // Snow → dramatic bridal
  "allure-couture-c800-01.jpg",     // Verdant Grace → cape drama
  "allure-women-w553-01.jpg",       // Pure Eternity → evening elegance
  "abella-e552-browne-01.jpg",      // Maison → silhouette
];

/** 6 collection cover images for FeaturedCollections */
export const COLLECTION_COVERS = {
  bridal:           "allure-bridals-a1400-01.jpg",
  evening:          "allure-women-w550-01.jpg",
  "cape-and-train": "allure-couture-c805-01.jpg",
  "ball-gown":      "allure-bridals-a1409-01.jpg",
  silhouette:       "abella-e551-lambri-01.jpg",
  "ruffled-dream":  "abella-e550-carrington-01.jpg",
};

/** 5 testimonial images for Testimonials */
export const TESTIMONIAL_IMAGES = [
  "allure-bridals-a1400-01.jpg",    // Crystal Bloom
  "allure-bridals-a1401-01.jpg",    // Snow
  "allure-couture-c800-01.jpg",     // Verdant Grace
  "allure-couture-c807-01.jpg",     // Golden Dawn
  "allure-women-w550-01.jpg",       // Ellea (Diva → Evening)
];

/** 1 editorial band parallax */
export const EDITORIAL_BAND_IMAGE = "allure-couture-c804nc-01.jpg";

/** 1 hero image (legacy) */
export const HERO_SINGLE_IMAGE = "allure-bridals-a1400-01.jpg";

/** 8 newsletter marquee images */
export const NEWSLETTER_IMAGES = [
  "abella-e552-browne-01.jpg",
  "allure-couture-c809-01.jpg",
  "allure-bridals-a1406-01.jpg",
  "allure-women-w554-01.jpg",
  "abella-e553-hudson-01.jpg",
  "allure-couture-c760j-01.jpg",
  "allure-bridals-a1403-01.jpg",
  "allure-women-w555-01.jpg",
];

/** 1 appointment image */
export const APPOINTMENT_IMAGE = "allure-bridals-a1407-01.jpg";

/** 8 header dropdown images */
export const HEADER_IMAGES = {
  newCollection:     "allure-bridals-a1402-01.jpg",
  bridalGowns:       "allure-bridals-a1400-01.jpg",
  eveningDress:      "allure-women-w550-01.jpg",
  ballGown:          "allure-bridals-a1409-01.jpg",
  capeAndTrain:      "allure-couture-c805-01.jpg",
  royalOverTrain:    "allure-couture-c789-01.jpg",
  silhouetteWhisper: "abella-e551-lambri-01.jpg",
  ruffledDream:      "abella-e550-carrington-01.jpg",
};

/** About page images for constants.ts */
export const ABOUT_IMAGES = {
  aboutHero:            "allure-bridals-a1400-01.jpg",
  aboutBride:           "allure-bridals-a1401-01.jpg",
  aboutCraftsmanship:   "allure-couture-c800-01.jpg",
  aboutFabric:          "abella-e552-browne-01.jpg",
  aboutAtelier:         "allure-bridals-a1407-01.jpg",
  aboutEvening:         "allure-women-w552-01.jpg",
};
