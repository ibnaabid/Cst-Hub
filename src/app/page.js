import Footer from "./components/Footer";
import LandingPage from "./components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <LandingPage />

      <Footer />
    </main>
  );
}