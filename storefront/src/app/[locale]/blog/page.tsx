import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

const posts = [
  {
    slug: "choosing-perfect-bridal-gown",
    title: "How to Choose the Perfect Bridal Gown",
    excerpt:
      "Finding your dream wedding dress is one of the most exciting parts of planning your big day. Here are our expert tips.",
    image: PLACEHOLDER_IMAGES.bridal,
    date: "2024-12-15",
  },
  {
    slug: "evening-wear-trends-2025",
    title: "Evening Wear Trends for 2025",
    excerpt:
      "From bold metallics to romantic florals, discover the hottest evening wear trends that will dominate the coming season.",
    image: PLACEHOLDER_IMAGES.evening,
    date: "2024-12-01",
  },
  {
    slug: "bridal-accessories-guide",
    title: "The Complete Guide to Bridal Accessories",
    excerpt:
      "Veils, tiaras, jewelry — learn how to accessorize your bridal look for maximum impact.",
    image: PLACEHOLDER_IMAGES.accessories,
    date: "2024-11-20",
  },
];

export default function BlogPage() {
  const t = useTranslations("common");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-4 text-center">
        {t("blog")}
      </h1>
      <p className="text-charcoal/60 text-center mb-8 sm:mb-12">
        Bridal inspiration, style guides, and fashion tips
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`blog/${post.slug}`} className="block">
              <div className="relative aspect-[4/3] overflow-hidden mb-4">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <time className="text-xs text-charcoal/40 tracking-wider uppercase">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="font-serif text-xl text-charcoal mt-2 mb-2 group-hover:text-gold transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-charcoal/60 line-clamp-2">
                {post.excerpt}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
