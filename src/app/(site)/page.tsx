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
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-400 opacity-60 blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1626785774573-4b7993143486?w=1200&q=80"
                alt="RENU PRESS print studio"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/40 to-transparent" />
              {/* Brand panel on the visual — RENU PRESS identity */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <div className="rounded-2xl border border-white/20 bg-[#0a1628]/85 p-5 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 text-sm font-black text-white shadow-lg shadow-orange-500/40">
                      RP
                    </span>
                    <div>
                      <div className="font-display text-2xl font-black tracking-tight text-white">RENU PRESS</div>
                      <div className="text-[11px] font-bold tracking-[0.16em] text-orange-300 uppercase">
                        Saharsa · Bihar
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-200">
                    Printing & Branding Solutions — on the floor, in Saharsa.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Offset", "Digital", "Flex", "Signage", "Gifts"].map((t) => (
                      <span key={t} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-cyan-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
