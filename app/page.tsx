import Layout from "@/components/Layout";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import HowICanHelp from "@/sections/HowICanHelp";
import Approach from "@/sections/Approach";
import Program from "@/sections/Program";
import Testimonials from "@/sections/Testimonials";
import Booking from "@/sections/Booking";
import Contact from "@/sections/Contact";

export default function HomePage() {
  return (
    <Layout>
      <Hero />
      <About />
      <HowICanHelp />
      <Approach />
      <Program />
      <Testimonials />
      <Booking />
      <Contact />
    </Layout>
  );
}
