import { Navbar } from "../components/prospectiq/landing/navbar";
import { Hero } from "../components/prospectiq/landing/hero";
import { Features } from "../components/prospectiq/landing/features";
import { ProductModules } from "../components/prospectiq/landing/product-modules";
import { HowItWorks } from "../components/prospectiq/landing/how-it-works";
import { DashboardPreview } from "../components/prospectiq/landing/dashboard-preview";
import { Pricing } from "../components/prospectiq/landing/pricing";
import { FAQ } from "../components/prospectiq/landing/faq";
import { CTA } from "../components/prospectiq/landing/cta";
import { Footer } from "../components/prospectiq/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white landing-scroll">
      <Navbar />
      <Hero />
      <Features />
      <ProductModules />
      <HowItWorks />
      <DashboardPreview />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
