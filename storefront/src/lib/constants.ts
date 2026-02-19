export const SITE_NAME = "Aksa Fashion";
export const SITE_URL = "https://aksafashion.com";
export const SITE_DESCRIPTION =
  "Luxury bridal gowns and evening wear from Prishtina, Kosovo. Handcrafted elegance for your most precious moments.";

export const FREE_SHIPPING_THRESHOLD = 15000; // €150 in cents

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/aksafashion",
  facebook: "https://facebook.com/aksafashion",
  tiktok: "https://tiktok.com/@aksafashion",
  whatsapp: "https://wa.me/38349000000",
};

export const CONTACT_INFO = {
  email: "info@aksafashion.com",
  phone: "+383 49 000 000",
  address: "Prishtina, Kosovo",
  hours: "Mon-Sat: 10:00 - 20:00",
};

import { ABOUT_IMAGES, TESTIMONIAL_IMAGES } from "@/lib/cdn-image-urls";

export const PLACEHOLDER_IMAGES = {
  hero: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=1920&q=80",
  bridal: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  evening: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
  accessories: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
  newCollection: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
  product1: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600&q=80",
  product2: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
  product3: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
  product4: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
  product5: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=600&q=80",
  product6: "https://images.unsplash.com/photo-1549404444-8d3f8c49e0f3?w=600&q=80",
  // About page images
  aboutHero: ABOUT_IMAGES.aboutHero,
  aboutBride: ABOUT_IMAGES.aboutBride,
  aboutCraftsmanship: ABOUT_IMAGES.aboutCraftsmanship,
  aboutFabric: ABOUT_IMAGES.aboutFabric,
  aboutAtelier: ABOUT_IMAGES.aboutAtelier,
  aboutEvening: ABOUT_IMAGES.aboutEvening,
};

export const MOCK_TESTIMONIALS = [
  {
    id: "1",
    name: "Elona K.",
    location: "Prishtina, Kosovo",
    text: "It's even more beautiful in person, it's perfect!",
    rating: 5,
    image: TESTIMONIAL_IMAGES[0],
  },
  {
    id: "2",
    name: "Arjeta M.",
    location: "Tirana, Albania",
    text: "The whole process was so smooth with you. Fast shipping and amazing quality.",
    rating: 5,
    image: TESTIMONIAL_IMAGES[1],
  },
  {
    id: "3",
    name: "Dafina S.",
    location: "Zurich, Switzerland",
    text: "From the first message to receiving my dress, everything was handled with such care. The attention to detail is incredible.",
    rating: 5,
    image: TESTIMONIAL_IMAGES[2],
  },
  {
    id: "4",
    name: "Liridona B.",
    location: "Munich, Germany",
    text: "I couldn't believe how perfectly it fit. The custom measurements made all the difference.",
    rating: 5,
    image: TESTIMONIAL_IMAGES[3],
  },
  {
    id: "5",
    name: "Fjolla H.",
    location: "London, United Kingdom",
    text: "My wedding dress exceeded every expectation. The craftsmanship is outstanding.",
    rating: 5,
    image: TESTIMONIAL_IMAGES[4],
  },
];
