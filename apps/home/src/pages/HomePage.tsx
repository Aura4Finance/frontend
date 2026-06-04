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
import { Helmet } from "react-helmet-async";

export default function HomePage() {
  return (
    <>
    <Helmet>
        <title>OraFi - Payments infrastructure for crypto</title>
        <meta name="description" content="OraFi is the easiest way to accept crypto payments. A simple API, beautiful checkout, and real-time webhooks — so you can focus on your product, not the blockchain." />
      </Helmet>
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
