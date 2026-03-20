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
  CheckCircle2,
  Sprout,
  HandCoins,
  Truck,
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-farm");

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[linear-gradient(to_bottom,rgba(34,197,94,0.08),rgba(255,255,255,0))]">
          {/* Decorative background */}
          <div className="absolute inset-0">
            <div className="absolute -top-24 left-[-120px] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute right-[-80px] top-32 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
            <div className="grid items-center gap-14 lg:grid-cols-12">
              {/* Left */}
              <motion.div
                className="text-center lg:col-span-6 lg:text-left"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={fadeUp}>
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 px-4 py-1 text-primary"
                  >
                    Decentralized Farm-to-Market on Base
                  </Badge>
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

                {/* Trust chips */}
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

              {/* Right */}
              <motion.div
                className="relative lg:col-span-6"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/60 shadow-[0_20px_80px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                  <div className="relative aspect-[4/3] w-full bg-secondary/20">
                    {heroImage?.imageUrl ? (
                      <Image
                        src={heroImage.imageUrl}
                        alt="Rice Farm Hero"
                        fill
                        priority
                        className="object-cover"
                        data-ai-hint="rice farm"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Leaf className="h-12 w-12 text-primary/20" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t bg-background/90 p-5 sm:p-6">
                    <div className="rounded-2xl bg-secondary/50 p-4">
                      <p className="text-sm text-muted-foreground">
                        Typical farm gate price
                      </p>
                      <p className="mt-1 text-2xl font-bold">₱20/kg</p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-4">
                      <p className="text-sm text-muted-foreground">
                        Estimated direct price
                      </p>
                      <p className="mt-1 text-2xl font-bold text-primary">
                        ₱35/kg+
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating card 1 */}
                <motion.div
                  className="absolute -left-3 top-8 hidden rounded-3xl border bg-background/95 p-4 shadow-xl backdrop-blur md:block"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Escrow Protected</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Funds released after confirmation
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card 2 */}
                <motion.div
                  className="absolute -bottom-6 right-4 hidden rounded-3xl border bg-background/95 p-4 shadow-xl backdrop-blur md:block"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-yellow-400/15 p-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Pooled Orders</p>
                      <p className="mt-1 text-xs text-muted-foreground">
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
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <Badge className="mb-4 rounded-full bg-primary/10 px-4 py-1 text-primary hover:bg-primary/10">
                Why Sibol
              </Badge>
              <h2 className="text-3xl font-bold font-headline sm:text-4xl">
                A smarter, fairer way to trade
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built for transparency, trust, and better outcomes for both
                farmers and buyers.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <FeatureCard
                icon={<ShieldCheck className="h-7 w-7 text-primary" />}
                label="Secure"
                title="Your Payment, Protected"
                description="Funds are securely held in escrow and released only once delivery is confirmed."
              />
              <FeatureCard
                icon={<Users className="h-7 w-7 text-primary" />}
                label="Collaborative"
                title="Buy Together, Save More"
                description="Join pooled orders with other buyers to unlock better pricing and meet bulk quantities."
              />
              <FeatureCard
                icon={<Zap className="h-7 w-7 text-primary" />}
                label="Direct"
                title="No Middlemen, Just Farmers"
                description="Trade directly with cooperatives to improve farmer earnings and reduce unnecessary markups."
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-secondary/20 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <Badge className="mb-4 rounded-full bg-white px-4 py-1 text-primary hover:bg-white">
                How it works
              </Badge>
              <h2 className="text-3xl font-bold font-headline sm:text-4xl">
                From listing to delivery
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Simple for users, powerful behind the scenes.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <StepCard
                number="01"
                icon={<Sprout className="h-6 w-6 text-primary" />}
                title="Farmers list harvests"
                description="Cooperatives post available produce with transparent pricing and clear quantities."
              />
              <StepCard
                number="02"
                icon={<Users className="h-6 w-6 text-primary" />}
                title="Buyers order or pool demand"
                description="Retailers and consumers can buy directly or combine orders for better pricing."
              />
              <StepCard
                number="03"
                icon={<Truck className="h-6 w-6 text-primary" />}
                title="Delivery is confirmed"
                description="Payment is held in escrow and released only after successful delivery verification."
              />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-12 text-3xl font-bold font-headline sm:text-4xl">
              The value of trading more directly
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <StatCard value="₱20/kg" label="Typical price farmers receive" />
              <StatCard value="₱35/kg+" label="Estimated direct market price" />
              <StatCard value="100%" label="Transparent and trackable payments" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border bg-[linear-gradient(135deg,rgba(34,197,94,0.08),rgba(250,250,249,1),rgba(250,204,21,0.08))] px-6 py-12 text-center shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:px-10">
              <h2 className="text-3xl font-bold font-headline sm:text-4xl">
                Start trading directly today
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Join Sibol and help build a fairer, more transparent
                agricultural marketplace.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-14 rounded-2xl px-8">
                  <Link href="/market">Browse Marketplace</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 rounded-2xl px-8">
                  <Link href="/farmer">Join as Farmer</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-secondary/20 py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-12 lg:px-8">
          <div className="space-y-4 md:col-span-5">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary font-headline">
                Sibol
              </span>
            </div>
            <p className="max-w-sm text-muted-foreground">
              Sibol is redefining farm-to-market trade through transparency,
              technology, and trust.
            </p>
          </div>

          <div className="space-y-4 md:col-span-3">
            <h4 className="font-bold">Market</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/market">Browse All Products</Link></li>
              <li><Link href="/market?type=rice">Rice Selection</Link></li>
              <li><Link href="/market?pooled=true">Pooled Orders</Link></li>
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
              <li><Link href="/about">About</Link></li>
              <li><Link href="/farmers">For Farmers</Link></li>
              <li><Link href="/buyers">For Buyers</Link></li>
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

function FeatureCard({
  icon,
  label,
  title,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-[2rem] border border-border/60 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="inline-flex rounded-2xl bg-primary/10 p-4">{icon}</div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] border border-border/50 bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-primary/10 p-3">{icon}</div>
        <span className="text-sm font-semibold tracking-wide text-primary/60">
          {number}
        </span>
      </div>
      <h3 className="mt-6 text-xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 px-6 py-8 backdrop-blur-sm">
      <p className="text-4xl font-bold sm:text-5xl">{value}</p>
      <p className="mt-3 text-primary-foreground/80">{label}</p>
    </div>
  );
}