"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Leaf,
  Globe,
  Sprout,
  Truck,
} from "lucide-react";

// WoodSign component
function WoodSign({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative inline-block pt-4 ${className}`}>
      <div className="absolute left-6 top-0 h-4 w-0.5 bg-[#6F4724]" />
      <div className="absolute right-6 top-0 h-4 w-0.5 bg-[#6F4724]" />

      <div className="relative rotate-[-1deg] rounded-2xl border-[3px] border-[#6F4724] bg-[#9A6938] px-8 py-3 shadow-md">
        <div className="absolute inset-x-2 top-1 h-2 rounded-full bg-[#C08A52]/35" />
        <div className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#6F4724]" />
        <div className="absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#6F4724]" />

        <span className="relative text-sm font-black uppercase tracking-[0.18em] text-[#FFF4D6]">
          {children}
        </span>
      </div>
    </div>
  );
}

// Feature Card
function FeatureCard({
  icon,
  label,
  title,
  description,
  priceTag,
  stallBadge,
  videoUrl,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  priceTag?: string;
  stallBadge?: string;
  videoUrl?: string;
}) {
  return (
    <div className="group relative rounded-2xl border-[3px] border-[#C89D57] bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {stallBadge && (
        <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-md z-20">
          {stallBadge}
        </div>
      )}
      
      {videoUrl && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-10 transition-all duration-500 group-hover:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/90" />
        </div>
      )}
      
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-xl bg-primary/10 p-3 text-primary transition-all group-hover:scale-110">
            {icon}
          </div>
          {priceTag && (
            <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-primary shadow-sm">
              {priceTag}
            </div>
          )}
        </div>
        
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <span className="text-xs font-medium text-primary/60">{label}</span>
        </div>
        
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        
        <div className="mt-4 h-0.5 w-12 rounded-full bg-gradient-to-r from-primary/40 to-transparent" />
      </div>
    </div>
  );
}

// Step Card - Redesigned with image at top and badge above image
function StepCard({
  number,
  icon,
  title,
  description,
  marketTag,
  imageUrl,
  statusBadge,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  marketTag?: string;
  imageUrl?: string;
  statusBadge?: string;
}) {
  return (
    <div className="group relative rounded-2xl border-[3px] border-[#C89D57] bg-white overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Number Badge */}
      <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-lg z-20">
        {number}
      </div>
      
      {/* Image Section with Badge Above */}
      {imageUrl && (
        <div className="relative w-full h-48 overflow-hidden">
          {/* Status Badge Above Image */}
          {statusBadge && (
            <div className="absolute top-3 left-3 z-20">
              <div className="rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow-md">
                {statusBadge}
              </div>
            </div>
          )}
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      )}
      
      {/* Content Section */}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary transition-all group-hover:scale-110">
            {icon}
          </div>
        </div>
        
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        
        {marketTag && (
          <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            {marketTag}
          </div>
        )}
        
        <div className="mt-4 h-px w-full bg-gradient-to-r from-primary/20 to-transparent" />
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

export default function LandingPage() {
  const cropImageUrl = "/images/harvest.jpg";
  const sibolLogoUrl = "/sibolLogo.png";
  const harvestVideoUrl = "/harvest.mp4";
  
  // Local images for each step card
  const farmerImageUrl = "/images/11.jpg";
  const buyerImageUrl = "/images/12.jpg";
  const deliveryImageUrl = "/images/13.jpg";

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />

      <main>
        {/* HERO - With Video */}
        <section className="relative overflow-hidden bg-[linear-gradient(to_bottom,rgba(34,197,94,0.08),rgba(255,255,255,0))]">
          <div className="h-10 bg-[repeating-linear-gradient(90deg,#2E6C3C_0px,#2E6C3C_28px,#F7EED8_28px,#F7EED8_56px)] border-b-[3px] border-[#8A5A2B]" />

          <div className="absolute inset-0">
            <div className="absolute -top-24 left-[-120px] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute right-[-80px] top-32 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
            <div className="grid items-center gap-14 lg:grid-cols-12">
              <motion.div
                className="text-center lg:col-span-6 lg:text-left"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={fadeUp} className="mb-4">
                  <WoodSign>Decentralized Farm-to-Market on Base</WoodSign>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight font-headline sm:text-6xl lg:text-7xl"
                >
                  Fair prices for farmers.
                  <span className="block text-primary italic">
                    Better deals for buyers.
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground lg:mx-0 lg:text-xl"
                >
                  Sibol connects buyers directly to farmer cooperatives with
                  transparent pricing, secure escrow payments, and pooled buying
                  for smarter agricultural trade.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
                >
                  <Button
                    asChild
                    size="lg"
                    className="h-14 rounded-2xl px-8 text-base shadow-lg shadow-primary/20"
                  >
                    <Link href="/market">
                      Browse Marketplace
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl px-8 text-base"
                  >
                    <Link href="/farmer">Start Selling as a Farmer</Link>
                  </Button>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                >
                  {[
                    "Transparent Pricing",
                    "Secure Escrow",
                    "Verified Cooperatives",
                    "Pooled Buying",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-full border bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur"
                    >
                      {item}
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right - Video instead of Image */}
              <motion.div
                className="relative lg:col-span-6"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl opacity-50" />
                
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/30 bg-white/40 shadow-2xl backdrop-blur-sm">
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/11" }}>
                    <video
                      src={harvestVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t bg-white/95 p-5 backdrop-blur-sm sm:p-6">
                    <div className="rounded-xl bg-secondary/50 p-3 sm:p-4 transition-all hover:bg-secondary/70 text-center">
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        Typical farm gate price
                      </p>
                      <p className="mt-1 text-xl font-bold sm:text-2xl">₱20/kg</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-3 sm:p-4 transition-all hover:bg-primary/15 text-center">
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        Estimated direct price
                      </p>
                      <p className="mt-1 text-xl font-bold text-primary sm:text-2xl">
                        ₱35/kg+
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div
                  className="absolute -left-3 top-8 hidden rounded-2xl border bg-white/95 p-3 shadow-xl backdrop-blur md:block"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Escrow Protected</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Funds released after confirmation
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 right-4 hidden rounded-2xl border bg-white/95 p-3 shadow-xl backdrop-blur md:block"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-yellow-400/15 p-2.5">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Pooled Orders</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Better value through group buying
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 text-center">
              <WoodSign>Why Sibol</WoodSign>
              <h2 className="mt-8 text-3xl font-bold font-headline sm:text-4xl">
                A smarter, fairer way to trade
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for transparency, trust, and better outcomes for both
                farmers and buyers.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <FeatureCard
                icon={<ShieldCheck className="h-7 w-7 text-primary" />}
                label="Secure Escrow"
                title="Protected Payments"
                description="Funds are securely held in smart contract escrow and released only when you confirm delivery — just like paying at a trusted market stall."
                priceTag="₱0 fees"
                stallBadge="Trusted Stall"
                videoUrl={harvestVideoUrl}
              />
              <FeatureCard
                icon={<Users className="h-7 w-7 text-primary" />}
                label="Pooled Buying"
                title="Bulk Savings"
                description="Join forces with other buyers like a community market day. Combine orders to unlock bulk pricing and meet minimum quantities."
                priceTag="Save 30%"
                stallBadge="Community Deal"
                videoUrl={harvestVideoUrl}
              />
              <FeatureCard
                icon={<Zap className="h-7 w-7 text-primary" />}
                label="Direct Trade"
                title="No Middlemen"
                description="Trade directly with farmer cooperatives — cutting out intermediaries means farmers earn more and you pay less, just like a true Kadiwa."
                priceTag="50% more to farmers"
                stallBadge="Farm Direct"
                videoUrl={harvestVideoUrl}
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS - Redesigned with image at top and badge above image */}
        <section className="bg-secondary/20 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 text-center">
              <WoodSign>How It Works</WoodSign>
              <h2 className="mt-8 text-3xl font-bold font-headline sm:text-4xl">
                From listing to delivery
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple for users, powerful behind the scenes.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <StepCard
                number="01"
                icon={<Sprout className="h-6 w-6 text-primary" />}
                title="Farmers bring harvest to stall"
                description="Cooperatives list their fresh produce with transparent pricing — like setting up their market stall for the day."
                marketTag="Fresh Daily"
                imageUrl={farmerImageUrl}
                statusBadge="Harvest"
              />
              <StepCard
                number="02"
                icon={<Users className="h-6 w-6 text-primary" />}
                title="Buyers shop & pool together"
                description="Browse the digital market, combine orders with neighbors, and get better prices — just like buying together at the palengke."
                marketTag="Group Buying"
                imageUrl={buyerImageUrl}
                statusBadge="Shop"
              />
              <StepCard
                number="03"
                icon={<Truck className="h-6 w-6 text-primary" />}
                title="Delivery to your doorstep"
                description="Your order is packed fresh and delivered. Payment is released only when you're happy — no haggling, no stress."
                marketTag="Doorstep Delivery"
                imageUrl={deliveryImageUrl}
                statusBadge="SDeliver"
              />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <WoodSign className="mx-auto">Market Impact</WoodSign>
              <h2 className="mt-8 text-3xl font-bold font-headline sm:text-4xl">
                The value of trading more directly
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                See how Sibol is transforming farm-to-market trade with real results
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1 - Traditional Price */}
              <div className="rounded-[2rem] border-[3px] border-[#C89D57] bg-gradient-to-br from-[#FFF1C5] via-[#FFF8E8] to-[#F8E2AA] p-5 shadow-[0_20px_60px_rgba(88,61,31,0.16)] transition-all hover:scale-105 text-center">
                <div className="relative">
                  <div className="absolute -top-3 right-3 rotate-[4deg] rounded-full bg-[#2E6C3C] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow">
                    Before Sibol
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86591C] mb-3">
                    Traditional Price
                  </p>
                  <div className="mt-2">
                    <span className="text-4xl font-black text-[#7A4A14]">₱20</span>
                    <span className="text-sm text-[#7A6547]">/ kg</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-[#7A6547]">Farm gate price</span>
                  </div>
                  <div className="mt-3 h-px w-full bg-gradient-to-r from-[#D8C7A0] to-transparent" />
                  <p className="mt-3 text-[11px] text-[#694F33]">
                    Typical price farmers receive from middlemen
                  </p>
                </div>
              </div>

              {/* Card 2 - Direct Market Price */}
              <div className="rounded-[2rem] border-[3px] border-[#C89D57] bg-gradient-to-br from-[#FFF1C5] via-[#FFF8E8] to-[#F8E2AA] p-5 shadow-[0_20px_60px_rgba(88,61,31,0.16)] transition-all hover:scale-105 text-center">
                <div className="relative">
                  <div className="absolute -top-3 right-3 rotate-[4deg] rounded-full bg-[#2E6C3C] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow">
                    With Sibol
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86591C] mb-3">
                    Direct Market Price
                  </p>
                  <div className="mt-2">
                    <span className="text-4xl font-black text-[#7A4A14]">₱35</span>
                    <span className="text-sm text-[#7A6547]">/ kg+</span>
                  </div>
                  <div className="mt-2">
                    <Badge className="rounded-full bg-[#2E6C3C] text-white hover:bg-[#2E6C3C] text-[10px] px-2 py-0.5">
                      +75% for farmers
                    </Badge>
                  </div>
                  <div className="mt-3 h-px w-full bg-gradient-to-r from-[#D8C7A0] to-transparent" />
                  <p className="mt-3 text-[11px] text-[#694F33]">
                    Farmers earn more by selling directly to buyers
                  </p>
                </div>
              </div>

              {/* Card 3 - 100% Transparency */}
              <div className="rounded-[2rem] border-[3px] border-[#C89D57] bg-gradient-to-br from-[#FFF1C5] via-[#FFF8E8] to-[#F8E2AA] p-5 shadow-[0_20px_60px_rgba(88,61,31,0.16)] transition-all hover:scale-105 text-center">
                <div className="relative">
                  <div className="absolute -top-3 right-3 rotate-[4deg] rounded-full bg-[#2E6C3C] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow">
                    100% Trust
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86591C] mb-3">
                    Full Transparency
                  </p>
                  <div className="mt-2">
                    <span className="text-4xl font-black text-[#7A4A14]">100%</span>
                    <span className="text-sm text-[#7A6547]"> Trackable</span>
                  </div>
                  <div className="mt-2">
                    <Badge className="rounded-full bg-[#2E6C3C] text-white hover:bg-[#2E6C3C] text-[10px] px-2 py-0.5">
                      Blockchain Secured
                    </Badge>
                  </div>
                  <div className="mt-3 h-px w-full bg-gradient-to-r from-[#D8C7A0] to-transparent" />
                  <p className="mt-3 text-[11px] text-[#694F33]">
                    Every payment tracked on blockchain with full visibility
                  </p>
                </div>
              </div>
            </div>

            {/* Wooden divider */}
            <div className="mt-12 flex justify-center">
              <div className="h-1 w-24 rounded-full bg-white/30" />
            </div>
            
            <p className="mt-8 text-center text-sm text-primary-foreground/70">
              Join thousands of farmers and buyers already benefiting from direct trade
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="relative bg-white py-20 lg:py-24 overflow-hidden">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            
            {/* 🌿 KADIWA STYLE CANOPY - Above the card */}
            <div className="relative mx-auto max-w-4xl">
              
              {/* Green and White Striped Canopy */}
              <div className="w-full">
                <div className="h-16 w-full rounded-t-2xl overflow-hidden shadow-md flex">
                  <div className="flex-1 bg-[#2E6C3C]" />
                  <div className="flex-1 bg-[#F7EED8]" />
                  <div className="flex-1 bg-[#2E6C3C]" />
                  <div className="flex-1 bg-[#F7EED8]" />
                  <div className="flex-1 bg-[#2E6C3C]" />
                  <div className="flex-1 bg-[#F7EED8]" />
                </div>

                {/* Scalloped edge effect */}
                <div className="flex">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-5 bg-[#236B44] rounded-b-full opacity-90"
                    />
                  ))}
                </div>
              </div>

              {/* Card with border only - top border removed */}
              <div className="rounded-b-2xl rounded-t-none border-l-[3px] border-r-[3px] border-b-[3px] border-t-0 border-[#C89D57] bg-white p-8 text-center shadow-md">
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl font-headline">
                  Start trading directly today
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                  Join Sibol and help build a fairer, more transparent
                  agricultural marketplace.
                </p>

                {/* BUTTONS */}
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <Button 
                    asChild 
                    size="lg" 
                    className="h-14 rounded-2xl px-8 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                  >
                    <Link href="/market">
                      Browse Marketplace
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>

                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="h-14 rounded-2xl px-8 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-bold"
                  >
                    <Link href="/farmer">Start Selling as a Farmer</Link>
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Secure Escrow</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Pooled Buying</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Leaf className="h-4 w-4 text-primary" />
                    <span>Farmer Direct</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* FOOTER with Sibol Logo */}
      <footer className="border-t bg-secondary/20 py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-12 lg:px-8">
          <div className="space-y-4 md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                <Image
                  src={sibolLogoUrl}
                  alt="Sibol Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-primary font-headline">
                Sibol
              </span>
            </div>
            <p className="max-w-sm text-muted-foreground">
              Sibol is redefining farm-to-market trade through transparency,
              technology, and trust.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">Kadiwa Inspired</span>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">Farmers First</span>
            </div>
          </div>

          <div className="space-y-4 md:col-span-3">
            <h4 className="font-bold">Market</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/market" className="hover:text-primary transition-colors">Browse All Products</Link></li>
              <li><Link href="/market?type=rice" className="hover:text-primary transition-colors">Rice Selection</Link></li>
              <li><Link href="/market?pooled=true" className="hover:text-primary transition-colors">Pooled Orders</Link></li>
            </ul>
          </div>

          <div className="space-y-4 md:col-span-2">
            <h4 className="font-bold">Connect</h4>
            <div className="flex gap-4">
              <Link
                href="#"
                className="rounded-full border bg-white p-2 transition-colors hover:bg-secondary"
              >
                <Globe className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <h4 className="font-bold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/farmers" className="hover:text-primary transition-colors">For Farmers</Link></li>
              <li><Link href="/buyers" className="hover:text-primary transition-colors">For Buyers</Link></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t px-4 pt-8 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          © 2026 Sibol on Base. All rights reserved.
        </div>
      </footer>
    </div>
  );
}