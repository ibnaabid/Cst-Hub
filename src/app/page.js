import Footer from "./components/Footer";
import HeroSlider from "./components/Hero";
import Features from "./Features/page";
import AskWithImage from "./GEMINI/page";
import HowItWorks from "./How-Works/page";
import WhySection from "./WhyCst/page";
import WhatsAppButton from "./CR/page"
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSlider />
      

      <Features />

      <WhySection />

      <HowItWorks />

      <Footer />

      {/* Floating Buttons */}
     <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
       <AskWithImage />
      <WhatsAppButton />
     </div>
    </main>
  );
}