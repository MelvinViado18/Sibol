"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ShoppingBag, 
  ShieldCheck, 
  MapPin,
  Calendar, 
  Star, 
  Truck, 
  Lock,
  Users,
  MessageCircle,
  ChevronRight,
  Leaf
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [purchaseType, setPurchaseType] = useState<"individual" | "pooled">("individual");
  const [isEscrowProcessing, setIsEscrowProcessing] = useState(false);
  const { toast } = useToast();

  const handlePurchase = () => {
    setIsEscrowProcessing(true);
    setTimeout(() => {
      setIsEscrowProcessing(false);
      toast({
        title: "Escrow Payment Initialized",
        description: "Funds are now safely locked in the smart contract on Base. Farmer has been notified.",
      });
    }, 2000);
  };

  // Mock product data
  const product = {
    name: "Dinorado Rice Premium Grade A",
    price: 38,
    quantity: 500,
    minPooled: 1000,
    currentPooled: 650,
    location: "Gapan City, Nueva Ecija",
    harvestDate: "Feb 12, 2026",
    rating: 4.8,
    reviews: 24,
    description: "Our Premium Dinorado is characterized by its distinct aroma and soft, slightly sticky texture when cooked. Harvested directly from the fertile plains of Nueva Ecija, it undergoes specialized milling to preserve its natural nutrients.",
    farmer: "Nueva Ecija Rice Producers Cooperative",
    imageUrl: "https://picsum.photos/seed/rice-detail/800/600"
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Product Media */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border">
              <Image 
                src={product.imageUrl} 
                alt={product.name} 
                fill 
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur shadow-sm">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" /> {product.rating} ({product.reviews} reviews)
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold font-headline">{product.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-primary" /> {product.location}</span>
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-primary" /> Harvested: {product.harvestDate}</span>
                <span className="flex items-center"><Truck className="h-4 w-4 mr-1 text-primary" /> Est. Shipping: ₱2.50/kg</span>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-xl font-bold mb-6">Recent Reviews</h3>
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex-shrink-0" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">Sari-Sari Store Juan</span>
                        <div className="flex"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /></div>
                      </div>
                      <p className="text-sm text-muted-foreground">Excellent quality rice. My customers keep coming back for this specific Dinorado.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 border-primary/20 shadow-xl sticky top-24">
              <CardContent className="p-6 space-y-8">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-primary">₱{product.price}</span>
                    <span className="text-xl text-muted-foreground">/ kg</span>
                  </div>
                </div>

                <div className="flex p-1 bg-secondary rounded-xl">
                  <button 
                    onClick={() => setPurchaseType("individual")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${purchaseType === "individual" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"}`}
                  >
                    <ShoppingBag className="h-4 w-4" /> Individual
                  </button>
                  <button 
                    onClick={() => setPurchaseType("pooled")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${purchaseType === "pooled" ? "bg-accent shadow-sm text-accent-foreground" : "text-muted-foreground"}`}
                  >
                    <Users className="h-4 w-4" /> Pooled Buy
                  </button>
                </div>

                {purchaseType === "pooled" && (
                  <div className="space-y-3 p-4 bg-accent/10 rounded-xl border border-accent/20">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Pool Progress</span>
                      <span>{Math.round((product.currentPooled / product.minPooled) * 100)}%</span>
                    </div>
                    <Progress value={(product.currentPooled / product.minPooled) * 100} className="h-2 bg-accent/20" />
                    <p className="text-xs text-muted-foreground italic">
                      Need {product.minPooled - product.currentPooled}kg more to unlock ₱{product.price - 2}/kg pricing!
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-bold">Minimum 10kg</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-muted-foreground">Total (incl. logistics)</span>
                    <span className="font-bold">₱{(product.price + 2.5) * 10}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90 gap-2"
                    onClick={handlePurchase}
                    disabled={isEscrowProcessing}
                  >
                    {isEscrowProcessing ? (
                      "Confirming on Base..."
                    ) : (
                      <>Initialize Escrow <Lock className="h-5 w-5" /></>
                    )}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Payments secured by Sibol Smart Contracts on Base.
                  </p>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sold by</p>
                      <p className="text-sm font-bold">{product.farmer}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto"><MessageCircle className="h-5 w-5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}