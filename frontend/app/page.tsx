import Navbar from "@/components/Navbar";
import Hero from "@/components/landing/Hero";
import OngoingHackathons from "@/components/landing/OngoingHackathons";
import UpcomingHackathons from "@/components/landing/UpcomingHackathons";
import Features from "@/components/landing/Features";
import WhyHackflow from "@/components/landing/WhyHackflow";
import SocialProof from "@/components/landing/SocialProof";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main id="top">
      <Navbar />
      <Hero />
      <OngoingHackathons />
      <UpcomingHackathons />
      <Features />
       <WhyHackflow />
       <SocialProof />
       <CTA />
       <Footer />
    </main>
  );
} 
