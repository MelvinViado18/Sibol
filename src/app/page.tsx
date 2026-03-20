import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck, Zap, Users, Leaf, Globe } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-farm");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-secondary/30">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5">
                  Decentralized Agriculture on Base
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground font-headline leading-tight">
                  From Farm to Market, <span className="text-primary italic">Directly</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  Empowering local farmers with transparent pricing, blockchain escrow payments, and pooled buying power. Modernizing the supply chain for a better future.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="px-8 bg-primary hover:bg-primary/90 h-14 text-lg">
                    <Link href="/market">
                      Browse Marketplace <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="px-8 h-14 text-lg">
                    <Link href="/farmer">Are you a Farmer?</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-secondary/20 flex items-center justify-center">
                  {heroImage?.imageUrl ? (
                    <Image
                      src={heroImage.imageUrl}
                      alt="Rice Farm Hero"
                      fill
                      className="object-cover"
                      data-ai-hint="rice farm"
                    />
                  ) : (
                    <Leaf className="h-12 w-12 text-primary/20" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold font-headline">Why SibolMarket?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built on Base to ensure every transaction is secure, transparent, and beneficial for both farmers and buyers.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<ShieldCheck className="h-8 w-8 text-primary" />}
                title="Blockchain Escrow"
                description="Payments are securely locked in smart contracts and only released upon verified delivery confirmation."
              />
              <FeatureCard 
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Pooled Purchasing"
                description="Combine demand with other buyers to access bulk farm-direct pricing and meet minimum quantities."
              />
              <FeatureCard 
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Direct Trade"
                description="Eliminate unnecessary intermediaries to increase farmer earnings and reduce consumer costs."
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <div className="grid sm:grid-cols-3 gap-12">
              <div className="space-y-2">
                <p className="text-4xl font-bold">₱20/kg</p>
                <p className="text-primary-foreground/80">Traditional Farm Gate Price</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold">₱35/kg+</p>
                <p className="text-primary-foreground/80">Sibol Market Direct Price</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold">100%</p>
                <p className="text-primary-foreground/80">Payment Transparency</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/20 py-12 border-t">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary font-headline">SibolMarket</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              The next generation of farm-to-market trading. Sustainable, decentralized, and empowering.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Market</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/market">All Products</Link></li>
              <li><Link href="/market?type=rice">Rice Selection</Link></li>
              <li><Link href="/market?pooled=true">Pooled Orders</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Connect</h4>
            <div className="flex gap-4">
              <Link href="#" className="p-2 bg-white rounded-full border hover:bg-secondary"><Globe className="h-5 w-5" /></Link>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 SibolMarket on Base. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-border/50 bg-secondary/10 space-y-4 transition-all hover:bg-secondary/20 hover:-translate-y-1">
      <div className="p-3 bg-white rounded-xl shadow-sm inline-block">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
