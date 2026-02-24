import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrustedBy from "../components/TrustedBy";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import DeveloperSection from "../components/DeveloperSection";
import SimplePrice from "../components/SimplePrice";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import WaterFlow from "../components/WaterFlow";

export default function HomePage() {
  return (
    <>
      <WaterFlow />
      <div className="relative z-10">
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
    </>
  );
}
