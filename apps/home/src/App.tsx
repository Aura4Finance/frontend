import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustedBy from "./components/TrustedBy";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import DeveloperSection from "./components/DeveloperSection";
import SimplePrice from "./components/SimplePrice";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <DeveloperSection />
      <SimplePrice />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
