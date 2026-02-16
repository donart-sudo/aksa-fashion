import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-lg">
        <p className="text-gold text-xs tracking-[0.4em] uppercase mb-6">
          Page Not Found
        </p>
        <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl text-charcoal mb-4">
          404
        </h1>
        <p className="font-serif text-2xl sm:text-3xl text-charcoal mb-4">
          This page has slipped away
        </p>
        <p className="text-charcoal/50 leading-relaxed mb-10 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let us help you find something beautiful instead.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sq"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-charcoal text-white text-xs tracking-[0.15em] uppercase hover:bg-charcoal/90 transition-colors duration-300 min-w-[200px]"
          >
            Back to Home
          </Link>
          <Link
            href="/sq/collections"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-soft-gray text-charcoal text-xs tracking-[0.15em] uppercase hover:border-gold hover:text-gold transition-colors duration-300 min-w-[200px]"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
