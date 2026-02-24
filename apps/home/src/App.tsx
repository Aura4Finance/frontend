import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustedBy from "./components/TrustedBy";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import DeveloperSection from "./components/DeveloperSection";
import Stats from "./components/Stats";
import Pricing from "./components/Pricing";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <Stats />
      <HowItWorks />
      <DeveloperSection />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
