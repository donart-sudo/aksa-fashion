import Hero from "@/components/home/Hero";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import Appointment from "@/components/home/Appointment";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <NewArrivals />
      <Testimonials />
      <Appointment />
      <Newsletter />
    </>
  );
}
