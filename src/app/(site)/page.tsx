import { prisma } from "@/lib/db";
import { getSettings, getFeaturedServices } from "@/lib/site";
import { PremiumHero } from "@/components/home/PremiumHero";
import { AnimatedStats } from "@/components/home/AnimatedStats";
import { ServiceCards } from "@/components/home/ServiceCards";
import {
  MarqueeClients,
  WhyChooseGrid,
  ProcessShowcase,
  MachineGallery,
  PortfolioBurst,
  IndustriesRibbon,
  TestimonialsLuxury,
  TeamAwardsStrip,
  QuoteCalculatorCta,
  InstagramStrip,
} from "@/components/home/HomeSections";
import { FaqTeaser } from "@/components/home/FaqTeaser";
import { LaptopBrand } from "@/components/home/LaptopBrand";

export default async function HomePage() {
  const [settings, services, why, process, industries, testimonials, portfolio, faqs] = await Promise.all([
    getSettings(),
    getFeaturedServices(8),
    prisma.whyChoose.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.processStep.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.industry.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.portfolioItem.findMany({ where: { isFeatured: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
  ]);

  return (
    <div className="bg-[#070d1a]">
      <PremiumHero title={settings.heroTitle} subtitle={settings.heroSubtitle} city={settings.city} />

      <AnimatedStats experienceYears={settings.experienceYears} />

      <MarqueeClients />

      {/* Intro band — colourful split */}
      <section className="relative overflow-hidden py-10 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#9a3412]" />
        <div className="container-wide relative grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="order-2 lg:order-1">
            <p className="text-[10px] font-bold tracking-[0.2em] text-orange-300 uppercase sm:text-xs sm:tracking-[0.25em]">
              Company introduction
            </p>
            <h2 className="font-display mt-2 text-2xl font-black text-white text-balance sm:mt-3 sm:text-5xl">
              {settings.aboutTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:mt-5 sm:text-base">{settings.aboutBody}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:mt-4">{settings.storyBody}</p>
          </div>
          <div className="relative order-1 flex items-center justify-center px-1 py-2 lg:order-2 lg:py-4">
            <LaptopBrand />
          </div>
        </div>
      </section>

      <ServiceCards services={services} />

      <WhyChooseGrid items={why} />

      <PortfolioBurst items={portfolio} />

      <MachineGallery />

      <ProcessShowcase steps={process} />

      <IndustriesRibbon industries={industries} />

      <TestimonialsLuxury items={testimonials} />

      <TeamAwardsStrip />

      <InstagramStrip />

      <FaqTeaser faqs={faqs} />

      <QuoteCalculatorCta />
    </div>
  );
}
