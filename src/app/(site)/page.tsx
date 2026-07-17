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
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#9a3412]" />
        <div className="container-wide relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-orange-300 uppercase">Company introduction</p>
            <h2 className="font-display mt-3 text-3xl font-black text-white sm:text-5xl text-balance">{settings.aboutTitle}</h2>
            <p className="mt-5 text-base leading-relaxed text-slate-300">{settings.aboutBody}</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{settings.storyBody}</p>
          </div>
          <div className="relative flex items-center justify-center py-4">
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
