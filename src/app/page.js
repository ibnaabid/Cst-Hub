import Footer from "./components/Footer";
import HeroSlider from "./components/Hero";
import ContactSection from "./CR/page";
import Features from "./Features/page";
import HowItWorks from "./How-Works/page";
import WhySection from "./WhyCst/page";
// import LandingPage from "./components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSlider />
      <ContactSection/>
      <Features />
      <WhySection />
      <HowItWorks />

      <Footer />
    </main>
  );
}