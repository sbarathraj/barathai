
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { GetStarted } from "@/components/GetStarted";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <GetStarted />
      <Footer />
    </div>
  );
};

export default Index;
