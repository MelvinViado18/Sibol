"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users, 
  Leaf, 
  Globe, 
  Star, 
  Truck, 
  ShoppingBag,
  CheckCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-farm");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Navbar for Landing Page */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Leaf className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold tracking-tight text-primary">SibolMarket</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                How It Works
              </Link>
              <Link href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                About
              </Link>
              <Button asChild variant="default" size="sm" className="gap-2">
                <Link href="/auth">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile menu button - simplified for landing */}
            <div className="md:hidden">
              <Button asChild variant="default" size="sm">
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <Badge variant="outline" className="px-4 py-2 text-primary border-primary/20 bg-primary/5 animate-pulse">
                  🚀 Revolutionizing Philippine Agriculture
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
                  From Farm to Market,{" "}
                  <span className="text-primary bg-gradient-to-r from-primary/20 to-primary/10 px-2 rounded-lg">Directly</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  Empowering local farmers with transparent pricing, blockchain escrow payments, 
                  and pooled buying power. No middlemen, just fair trade.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="px-8 bg-primary hover:bg-primary/90 h-14 text-lg shadow-lg hover:shadow-xl transition-all">
                    <Link href="/auth">
                      Start Trading Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="px-8 h-14 text-lg">
                    <Link href="#how-it-works">Watch Demo</Link>
                  </Button>
                </div>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Blockchain Secured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">No Hidden Fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">24/7 Support</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-gradient-to-br from-primary/10 to-secondary/20">
                  {heroImage?.imageUrl ? (
                    <Image
                      src={heroImage.imageUrl}
                      alt="Rice Farm Hero"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Leaf className="h-24 w-24 text-primary/30" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold">₱20/kg</p>
                <p className="text-sm opacity-80">Traditional Price</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold">₱35/kg+</p>
                <p className="text-sm opacity-80">SibolMarket Price</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold">50%+</p>
                <p className="text-sm opacity-80">More for Farmers</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold">30%+</p>
                <p className="text-sm opacity-80">Less for Buyers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="outline" className="px-4 py-2 text-primary">Why Choose Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Revolutionizing Farm-to-Market</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built on Base blockchain to ensure every transaction is secure, transparent, 
                and beneficial for both farmers and buyers.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<ShieldCheck className="h-8 w-8 text-primary" />}
                title="Blockchain Escrow"
                description="Payments are securely locked in smart contracts and only released upon verified delivery confirmation. No more payment disputes!"
              />
              <FeatureCard 
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Pooled Purchasing"
                description="Combine demand with other buyers to access bulk farm-direct pricing and meet minimum quantities. Save up to 30%!"
              />
              <FeatureCard 
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Direct Trade"
                description="Eliminate unnecessary intermediaries to increase farmer earnings and reduce consumer costs. Everyone wins!"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="outline" className="px-4 py-2 text-primary">Simple Process</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">How SibolMarket Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to transform the way you trade agricultural products
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <StepCard 
                number="1"
                icon={<ShoppingBag className="h-8 w-8" />}
                title="Farmers List Products"
                description="Farmers and cooperatives list their harvest with transparent pricing, photos, and harvest details."
              />
              <StepCard 
                number="2"
                icon={<Users className="h-8 w-8" />}
                title="Buyers Place Orders"
                description="Buyers browse products, join pooled orders for better prices, and deposit to escrow."
              />
              <StepCard 
                number="3"
                icon={<Truck className="h-8 w-8" />}
                title="Track & Receive"
                description="Logistics partners handle delivery, buyers confirm receipt, and payments are released."
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4">Benefits</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Farmers and Buyers Love SibolMarket</h2>
                <div className="space-y-4">
                  <BenefitItem 
                    icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                    text="Farmers earn 50% more compared to traditional trading"
                  />
                  <BenefitItem 
                    icon={<ShoppingBag className="h-5 w-5 text-green-500" />}
                    text="Buyers save up to 30% by cutting out middlemen"
                  />
                  <BenefitItem 
                    icon={<ShieldCheck className="h-5 w-5 text-green-500" />}
                    text="Secure escrow payments protect both parties"
                  />
                  <BenefitItem 
                    icon={<Truck className="h-5 w-5 text-green-500" />}
                    text="Real-time tracking and transparent shipping costs"
                  />
                  <BenefitItem 
                    icon={<Star className="h-5 w-5 text-green-500" />}
                    text="Reputation system builds trust in the community"
                  />
                </div>
                <Button asChild className="mt-8" size="lg">
                  <Link href="/auth">
                    Join SibolMarket Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/20 rounded-2xl p-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold">Maria Santos</p>
                        <p className="text-xs text-muted-foreground">Rice Farmer, Nueva Ecija</p>
                      </div>
                    </div>
                    <p className="text-sm italic">
                      "Before SibolMarket, I only got ₱20/kg. Now I earn ₱35/kg directly from buyers. 
                      My income has increased by 75%!"
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold">Juan Reyes</p>
                        <p className="text-xs text-muted-foreground">Sari-Sari Store Owner, Manila</p>
                      </div>
                    </div>
                    <p className="text-sm italic">
                      "I used to pay ₱50/kg from resellers. Now I buy directly from farmers at ₱35/kg. 
                      That's ₱15,000 savings per month!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Agriculture?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Join thousands of farmers and buyers who are already using SibolMarket.
            </p>
            <Button asChild variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/auth">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/20 py-12 border-t">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">SibolMarket</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              The next generation of farm-to-market trading. Sustainable, decentralized, and empowering.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth" className="hover:text-primary">Get Started</Link></li>
              <li><Link href="#features" className="hover:text-primary">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-primary">How It Works</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Connect</h4>
            <div className="flex gap-4">
              <Link href="#" className="p-2 bg-white rounded-full border hover:bg-secondary">
                <Globe className="h-5 w-5" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 SibolMarket on Base.<br />All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-border/50 bg-secondary/10 space-y-4 transition-all hover:bg-secondary/20 hover:-translate-y-1 hover:shadow-lg">
      <div className="p-3 bg-white rounded-xl shadow-sm inline-block">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center space-y-4">
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}