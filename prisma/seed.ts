import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES: { name: string; slug: string; services: string[] }[] = [
  {
    name: "Core Printing",
    slug: "core-printing",
    services: [
      "Offset Printing",
      "Digital Printing",
      "Sticker Printing",
      "Label Printing",
      "Packaging Printing",
      "Paper Bags",
      "Carry Bags",
      "Calendar Printing",
      "Notebook Printing",
      "Magazine Printing",
      "Book Printing",
      "Catalogue Printing",
      "Brochure Printing",
      "Flyers",
      "Pamphlets",
      "Posters",
      "Wall Posters",
    ],
  },
  {
    name: "Outdoor & Signage",
    slug: "outdoor-signage",
    services: [
      "Flex Banner Printing",
      "Vinyl Printing",
      "ACP Sign Boards",
      "Glow Sign Boards",
      "LED Sign Boards",
      "Sun Board Printing",
      "Foam Board Printing",
      "Standee",
      "Roll Up Standee",
      "Hoarding Printing",
      "Stage Backdrop",
      "Vehicle Branding",
      "Glass Branding",
      "Wall Graphics",
    ],
  },
  {
    name: "Photo & Frames",
    slug: "photo-frames",
    services: ["Canvas Printing", "Photo Printing", "Passport Photo", "Photo Frames"],
  },
  {
    name: "Cards & Stationery",
    slug: "cards-stationery",
    services: [
      "Wedding Cards",
      "Invitation Cards",
      "Business Cards",
      "Visiting Cards",
      "Letterheads",
      "Bill Books",
      "Cash Memo",
      "Receipt Books",
      "Certificates",
      "School Printing",
      "College Printing",
      "Office Stationery",
      "Rubber Stamps",
      "Tent Cards",
      "Table Calendar",
    ],
  },
  {
    name: "ID & Access",
    slug: "id-access",
    services: ["ID Cards", "Lanyards", "PVC Cards", "Employee Cards", "Student Cards"],
  },
  {
    name: "Apparel & Gifts",
    slug: "apparel-gifts",
    services: [
      "T-Shirts Printing",
      "Polo Printing",
      "Hoodie Printing",
      "Cap Printing",
      "Mug Printing",
      "Bottle Printing",
      "Mobile Cover Printing",
      "Keychain Printing",
      "Pen Printing",
      "Corporate Gift Printing",
      "Customized Gifts",
      "Trophies",
      "Awards",
      "Medals",
    ],
  },
  {
    name: "Fabrication & Cutting",
    slug: "fabrication",
    services: ["Laser Cutting", "Acrylic Works", "CNC Cutting", "3D Printing"],
  },
  {
    name: "Branding & Campaigns",
    slug: "branding-campaigns",
    services: [
      "Corporate Branding",
      "Office Branding",
      "Interior Branding",
      "Event Branding",
      "Election Campaign Printing",
      "Political Banner",
      "Custom Orders",
    ],
  },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      phone: "+91 76314 25111",
      whatsapp: "917631425111",
    },
    create: {
      id: "main",
      phone: "+91 76314 25111",
      whatsapp: "917631425111",
    },
  });

  const adminPass = await bcrypt.hash("Renu@Admin2026", 12);
  await prisma.user.upsert({
    where: { email: "admin@renupress.in" },
    update: {},
    create: {
      email: "admin@renupress.in",
      phone: "9876543210",
      name: "RENU PRESS Admin",
      passwordHash: adminPass,
      role: "SUPER_ADMIN",
    },
  });

  const custPass = await bcrypt.hash("Customer@123", 12);
  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      phone: "9123456780",
      name: "Demo Customer",
      passwordHash: custPass,
      role: "CUSTOMER",
      customerProfile: { create: {} },
    },
  });

  let sort = 0;
  for (const cat of CATEGORIES) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug, sortOrder: sort++ },
    });

    let sOrder = 0;
    for (const name of cat.services) {
      const slug = slugify(name);
      await prisma.service.upsert({
        where: { slug },
        update: {
          name,
          categoryId: category.id,
          description: `Professional ${name.toLowerCase()} from RENU PRESS, Saharsa — quality materials, colour-accurate output, and on-time delivery for shops, schools, offices and events across Bihar.`,
          isFeatured: sOrder < 3,
          sortOrder: sOrder,
        },
        create: {
          name,
          slug,
          categoryId: category.id,
          description: `Professional ${name.toLowerCase()} from RENU PRESS, Saharsa — quality materials, colour-accurate output, and on-time delivery for shops, schools, offices and events across Bihar.`,
          isFeatured: sOrder < 3,
          sortOrder: sOrder,
          basePrice: 199 + sOrder * 50,
          unit: "starting",
        },
      });
      sOrder++;
    }
  }

  const why = [
    { title: "Local production floor", body: "Jobs stay in Saharsa — faster revisions, no courier delays for proofs, and face-to-face colour checks when you need them.", icon: "map" },
    { title: "Colour that matches the brief", body: "Digital and offset calibrated for consistent brand colours on cards, flex, vinyl and apparel.", icon: "palette" },
    { title: "One shop, full stack", body: "From passport photos to election hoardings and corporate gifting — you do not need three vendors.", icon: "layers" },
    { title: "Clear timelines", body: "We quote realistic delivery windows and update status as work moves through design, print and packing.", icon: "clock" },
  ];
  await prisma.whyChoose.deleteMany();
  for (let i = 0; i < why.length; i++) {
    await prisma.whyChoose.create({ data: { ...why[i], sortOrder: i } });
  }

  const process = [
    { title: "Brief & size", body: "Share product, quantity, size and deadline — in person, WhatsApp or online quote form." },
    { title: "Artwork & proof", body: "Upload your file or let our design desk prepare a print-ready proof for approval." },
    { title: "Production", body: "Printing, cutting, finishing and packing on our floor with QC before dispatch." },
    { title: "Delivery", body: "Collect from shop or request delivery within Saharsa and nearby districts." },
  ];
  await prisma.processStep.deleteMany();
  for (let i = 0; i < process.length; i++) {
    await prisma.processStep.create({ data: { ...process[i], sortOrder: i } });
  }

  const industries = [
    { name: "Retail & shops", body: "Boards, stickers, bags, visiting cards and seasonal offers." },
    { name: "Schools & colleges", body: "ID cards, certificates, notebooks, event backdrops and prospectuses." },
    { name: "Offices & brands", body: "Stationery, corporate gifts, office branding and presentation kits." },
    { name: "Weddings & events", body: "Invitations, albums, stage flex and guest favours." },
    { name: "Political campaigns", body: "Banners, hoardings, flags and high-volume outdoor media." },
    { name: "Startups", body: "Logo merch, packaging pilots and launch collateral." },
  ];
  await prisma.industry.deleteMany();
  for (let i = 0; i < industries.length; i++) {
    await prisma.industry.create({ data: { ...industries[i], sortOrder: i } });
  }

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      {
        name: "Amit Kumar",
        role: "Owner",
        company: "Kumar Electronics, Saharsa",
        body: "Our glow board and visiting cards both came from RENU PRESS. Finish is clean, and they fixed a spelling error on the proof before print — that attention matters.",
        rating: 5,
        sortOrder: 0,
      },
      {
        name: "Priya Sinha",
        role: "Wedding client",
        company: "Saharsa",
        body: "Wedding cards and stage backdrop delivered on schedule. The paper quality and gold foil work looked premium for the budget we agreed.",
        rating: 5,
        sortOrder: 1,
      },
      {
        name: "Rakesh Jha",
        role: "Principal",
        company: "Local Public School",
        body: "ID cards, certificates and annual day flex — one call, one bill, reliable output every term.",
        rating: 5,
        sortOrder: 2,
      },
    ],
  });

  await prisma.faq.deleteMany();
  await prisma.faq.createMany({
    data: [
      {
        question: "How do I get a price for flex or cards?",
        answer: "Use Quick Quote on the website, WhatsApp the size and quantity, or visit the shop in Saharsa. We confirm material and finish before locking the rate.",
        category: "Pricing",
        sortOrder: 0,
      },
      {
        question: "What file format should I upload?",
        answer: "PDF, AI, CDR, PNG or high-resolution JPG. We convert and check bleed, fonts and CMYK before production.",
        category: "Artwork",
        sortOrder: 1,
      },
      {
        question: "Do you offer same-day work?",
        answer: "Passport photos, small digital jobs and urgent stickers are often same-day. Large outdoor and offset runs need planned capacity — ask when you book.",
        category: "Delivery",
        sortOrder: 2,
      },
      {
        question: "Can you design from scratch?",
        answer: "Yes. Share your brief and reference. Design fees depend on complexity and are shown before we start.",
        category: "Design",
        sortOrder: 3,
      },
      {
        question: "Which payment methods do you accept?",
        answer: "UPI, Google Pay, PhonePe, bank transfer, cash, and online gateway (Razorpay) for web orders. Advance may apply on large jobs.",
        category: "Payment",
        sortOrder: 4,
      },
    ],
  });

  await prisma.portfolioItem.deleteMany();
  await prisma.portfolioItem.createMany({
    data: [
      {
        title: "Retail glow board — electronics store",
        client: "Saharsa market",
        category: "Signage",
        description: "ACP + LED glow for night visibility with brand-safe colours.",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        isFeatured: true,
        sortOrder: 0,
      },
      {
        title: "Wedding invitation suite",
        client: "Private client",
        category: "Wedding",
        description: "Premium invitation cards with matching envelopes.",
        imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
        isFeatured: true,
        sortOrder: 1,
      },
      {
        title: "School ID + lanyard batch",
        client: "Public school",
        category: "ID Cards",
        description: "PVC cards with photo alignment and durable lanyards.",
        imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80",
        isFeatured: true,
        sortOrder: 2,
      },
      {
        title: "Campaign outdoor flex",
        client: "Local campaign",
        category: "Outdoor",
        description: "High-opacity flex for roadside visibility.",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        isFeatured: false,
        sortOrder: 3,
      },
      {
        title: "Corporate stationery set",
        client: "Regional office",
        category: "Stationery",
        description: "Letterheads, visiting cards and bill books in one brand system.",
        imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=1200&q=80",
        isFeatured: false,
        sortOrder: 4,
      },
      {
        title: "Event stage backdrop",
        client: "College fest",
        category: "Events",
        description: "Seamless flex with accurate logo placement.",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
        isFeatured: false,
        sortOrder: 5,
      },
    ],
  });

  await prisma.galleryImage.deleteMany();
  await prisma.galleryImage.createMany({
    data: [
      { title: "Press floor", album: "Workshop", imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1000&q=80", sortOrder: 0 },
      { title: "Colour samples", album: "Workshop", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b7993143486?w=1000&q=80", sortOrder: 1 },
      { title: "Finished cards", album: "Output", imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1000&q=80", sortOrder: 2 },
      { title: "Outdoor install", album: "Output", imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80", sortOrder: 3 },
    ],
  });

  await prisma.slider.deleteMany();
  await prisma.slider.createMany({
    data: [
      {
        title: "Print that carries your name with pride",
        subtitle: "Saharsa’s complete printing & branding house",
        imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1600&q=80",
        ctaLabel: "Get a quote",
        ctaHref: "/quote",
        sortOrder: 0,
      },
      {
        title: "Outdoor media that holds up",
        subtitle: "Flex, vinyl, boards and vehicle branding",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
        ctaLabel: "View services",
        ctaHref: "/services",
        sortOrder: 1,
      },
    ],
  });

  await prisma.blogPost.upsert({
    where: { slug: "choosing-flex-vs-vinyl-saharsa" },
    update: {},
    create: {
      title: "Flex vs vinyl: what shops in Saharsa usually need",
      slug: "choosing-flex-vs-vinyl-saharsa",
      excerpt: "A practical guide to outdoor materials for Bihar weather and budget.",
      body: "Flex is ideal for large banners and temporary campaigns. Vinyl suits glass, vehicle and long-life graphics. At RENU PRESS we help you pick opacity, finish and installation method before print — so the board lasts the monsoon and still looks sharp at night under shop lights.",
      published: true,
      coverUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    },
  });

  await prisma.careerJob.deleteMany();
  await prisma.careerJob.create({
    data: {
      title: "Print Production Assistant",
      department: "Production",
      description: "Support digital and outdoor jobs: machine loading, packing, basic QC. Preference for candidates in Saharsa who can work shop hours.",
      isOpen: true,
    },
  });

  const visiting = await prisma.service.findFirst({ where: { slug: "visiting-cards" } });
  if (visiting) {
    await prisma.product.upsert({
      where: { slug: "standard-visiting-cards" },
      update: {},
      create: {
        name: "Standard Visiting Cards",
        slug: "standard-visiting-cards",
        description: "300 GSM matte or glossy, single or both sides.",
        serviceId: visiting.id,
        sizes: JSON.stringify(["Standard 90×55 mm"]),
        materials: JSON.stringify(["Matte 300 GSM", "Glossy 300 GSM"]),
        finishings: JSON.stringify(["None", "Spot UV", "Lamination"]),
        minQty: 100,
        basePrice: 299,
      },
    });
  }

  // --- ERP seed: staff, inventory, suppliers, sample order ---
  const staffPass = await bcrypt.hash("Staff@123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "staff@renupress.in" },
    update: {},
    create: {
      email: "staff@renupress.in",
      phone: "9988776655",
      name: "Om Kumar",
      passwordHash: staffPass,
      role: "EMPLOYEE",
      employeeProfile: {
        create: {
          department: "Production",
          designation: "Operations Head",
          salary: 28000,
          joinDate: new Date("2022-04-01"),
        },
      },
    },
  });
  // Keep name in sync if user already existed
  await prisma.user.update({
    where: { email: "staff@renupress.in" },
    data: { name: "Om Kumar" },
  });

  const supplier = await prisma.supplier.upsert({
    where: { id: "seed-supplier-1" },
    update: {},
    create: {
      id: "seed-supplier-1",
      name: "Bihar Paper Traders",
      phone: "9123400001",
      gst: "10AABCU9603R1ZM",
      address: "Patna wholesale market",
    },
  });

  const invSeed = [
    { name: "Art Paper 300 GSM", sku: "PAP-300", category: "Paper", quantity: 120, reorderLevel: 40, unitCost: 45 },
    { name: "Flex Banner Roll", sku: "FLX-01", category: "Flex", quantity: 8, reorderLevel: 10, unitCost: 1200 },
    { name: "Vinyl Glossy", sku: "VIN-G", category: "Vinyl", quantity: 15, reorderLevel: 5, unitCost: 800 },
    { name: "Offset Black Ink", sku: "INK-BK", category: "Ink", quantity: 3, reorderLevel: 5, unitCost: 950 },
    { name: "Photo Frame 8x10", sku: "FR-810", category: "Frames", quantity: 40, reorderLevel: 15, unitCost: 60 },
    { name: "White Mug Blank", sku: "MUG-W", category: "Mug Stock", quantity: 200, reorderLevel: 50, unitCost: 35 },
    { name: "Round Neck Tee M", sku: "TEE-M", category: "T-Shirt Stock", quantity: 60, reorderLevel: 20, unitCost: 120 },
    { name: "Baseball Cap", sku: "CAP-01", category: "Caps", quantity: 25, reorderLevel: 10, unitCost: 90 },
  ];
  for (const row of invSeed) {
    await prisma.inventoryItem.upsert({
      where: { sku: row.sku },
      update: { quantity: row.quantity, reorderLevel: row.reorderLevel },
      create: {
        ...row,
        unit: "pcs",
        warehouse: "Main",
        supplierId: supplier.id,
        barcode: `RP${row.sku}`,
      },
    });
  }

  await prisma.expense.create({
    data: {
      title: "Ink purchase — demo",
      category: "Ink & Chemicals",
      amount: 4500,
      vendorName: "Bihar Paper Traders",
      paymentMethod: "UPI",
      upiRef: "UPI123456789012",
      billNumber: "INV-DEMO-01",
      description: "Seed expense with proof-ready fields",
      status: "PAID",
      createdById: (
        await prisma.user.findUnique({ where: { email: "admin@renupress.in" } })
      )?.id,
    },
  });

  const customer = await prisma.user.findUnique({ where: { email: "customer@example.com" } });
  if (customer) {
    const existing = await prisma.order.findFirst({ where: { orderNumber: "RP-2026-0001" } });
    if (!existing) {
      const order = await prisma.order.create({
        data: {
          orderNumber: "RP-2026-0001",
          customerId: customer.id,
          assignedToId: staff.id,
          serviceName: "Flex Banner Printing",
          size: "8x4 ft",
          quantity: 2,
          status: "PRINTING",
          subtotal: 2400,
          tax: 432,
          total: 2832,
          advancePaid: 1000,
          paymentStatus: "PARTIAL",
          trackingCode: "TRK-RP-001",
        },
      });
      const stages = ["DESIGN", "APPROVAL", "PRINTING", "LAMINATION", "CUTTING", "PACKING", "DISPATCH", "DELIVERY"];
      for (let i = 0; i < stages.length; i++) {
        await prisma.productionStage.create({
          data: {
            orderId: order.id,
            stage: stages[i],
            status: i < 2 ? "DONE" : i === 2 ? "ACTIVE" : "PENDING",
            assigneeId: i <= 2 ? staff.id : null,
            sortOrder: i,
          },
        });
      }
      await prisma.invoice.create({
        data: {
          invoiceNumber: "INV-RP-0001",
          orderId: order.id,
          amount: 2400,
          tax: 432,
          total: 2832,
        },
      });
    }
    await prisma.customerProfile.update({
      where: { userId: customer.id },
      data: { walletBalance: 500, rewardPoints: 120 },
    });
  }

  console.log("RENU PRESS seed complete.");
  console.log("Admin ERP: admin@renupress.in / Renu@Admin2026 → /erp");
  console.log("Staff:     staff@renupress.in / Staff@123 → /staff");
  console.log("Customer:  customer@example.com / Customer@123 → /portal");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
