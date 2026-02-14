import Hero from "@/components/home/Hero";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import Appointment from "@/components/home/Appointment";
import { fetchNewProductsForCards } from "@/lib/data/medusa-products";

export default async function HomePage() {
  const products = await fetchNewProductsForCards(4);

  return (
    <>
      <Hero />
      <FeaturedCollections />
      <NewArrivals products={products} />
      <Testimonials />
      <Appointment />
      <Newsletter />
    </>
  );
}
