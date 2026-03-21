"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Navigation,
  Phone,
  User,
  Loader2,
  Leaf,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

// Mock delivery requests
const mockDeliveries = [
  {
    id: "D001",
    farmer: "Nueva Ecija Rice Producers Coop",
    farmerLocation: "Gapan City, Nueva Ecija",
    buyer: "Sari-Sari Store Juan",
    buyerLocation: "Quezon City, Manila",
    product: "Dinorado Rice",
    quantity: 500,
    weight: 500,
    distance: 120,
    proposedCost: 2.5,
    status: "pending",
    pickupDate: "2026-03-20",
  },
  {
    id: "D002",
    farmer: "Isabela Farmers Coop",
    farmerLocation: "Isabela City",
    buyer: "Manila Restaurant Association",
    buyerLocation: "Makati City",
    product: "Jasmine Rice",
    quantity: 1200,
    weight: 1200,
    distance: 350,
    proposedCost: 3.2,
    status: "pending",
    pickupDate: "2026-03-21",
  },
  {
    id: "D003",
    farmer: "Tarlac Rice Growers",
    farmerLocation: "Tarlac Province",
    buyer: "Green Grocery Chain",
    buyerLocation: "Pasig City",
    product: "Angelica Rice",
    quantity: 250,
    weight: 250,
    distance: 95,
    proposedCost: 2.0,
    status: "in_transit",
    pickupDate: "2026-03-18",
    eta: "2026-03-19",
  },
];

// Active deliveries for logistics partner
const activeDeliveries = [
  {
    id: "A001",
    farmer: "Benguet Farmers",
    buyer: "Organic Market Manila",
    status: "in_transit",
    currentLocation: "Bulacan",
    eta: "2 hours",
  },
];

// Helper function for className merging
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// WoodSign component for rustic header
function WoodSign({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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

// AI Suggestion function - calculates optimal transport cost based on distance and weight
const getAISuggestion = (delivery: any) => {
  const baseRate = 1.8; // base rate per kg
  const distanceFactor = delivery.distance / 100; // 1.2 for 120km
  const weightFactor = delivery.weight / 1000; // 0.5 for 500kg
  
  // Formula: base rate + (distance premium) + (bulk discount)
  let suggestedRate = baseRate + (distanceFactor * 0.5) - (weightFactor * 0.3);
  
  // Ensure rate is within reasonable bounds
  suggestedRate = Math.max(1.5, Math.min(5.0, suggestedRate));
  
  // Round to 2 decimal places
  return Math.round(suggestedRate * 100) / 100;
};

// Get AI reasoning text
const getAIReasoning = (delivery: any, suggestedRate: number) => {
  const reasons = [];
  if (delivery.distance > 100) {
    reasons.push(`📏 ${delivery.distance}km distance adds ₱${((delivery.distance / 100) * 0.5).toFixed(2)} premium`);
  }
  if (delivery.weight > 500) {
    reasons.push(`📦 Bulk discount: -₱${((delivery.weight / 1000) * 0.3).toFixed(2)}/kg for ${delivery.weight}kg`);
  }
  if (delivery.proposedCost && delivery.proposedCost < suggestedRate) {
    reasons.push(`💰 Farmer's rate (₱${delivery.proposedCost}) is below market - opportunity!`);
  }
  if (reasons.length === 0) {
    reasons.push(`✨ Optimal rate based on market trends`);
  }
  return reasons;
};

export default function LogisticsDashboard() {
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [activeTab, setActiveTab] = useState<"available" | "active" | "completed">("available");
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [transportCost, setTransportCost] = useState("");
  const [updating, setUpdating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<number | null>(null);
  const { toast } = useToast();

  const handleAcceptDelivery = (delivery: any) => {
    setSelectedDelivery(delivery);
    // Calculate AI suggestion when modal opens
    const suggestion = getAISuggestion(delivery);
    setAiSuggestion(suggestion);
    // Pre-fill with AI suggestion
    setTransportCost(suggestion.toString());
  };

  const handleUseAISuggestion = () => {
    if (aiSuggestion) {
      setTransportCost(aiSuggestion.toString());
      toast({
        title: "AI Suggestion Applied",
        description: `Rate set to ₱${aiSuggestion}/kg based on distance and weight analysis`,
      });
    }
  };

  const confirmAcceptance = () => {
    if (!transportCost) {
      toast({
        title: "Please set transport cost",
        description: "Enter your transport cost per kg",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    setTimeout(() => {
      toast({
        title: "Delivery Accepted!",
        description: `You've accepted delivery #${selectedDelivery.id} at ₱${transportCost}/kg`,
      });
      // Move to active deliveries
      setDeliveries(deliveries.filter(d => d.id !== selectedDelivery.id));
      setSelectedDelivery(null);
      setTransportCost("");
      setAiSuggestion(null);
      setUpdating(false);
    }, 1500);
  };

  const updateShipmentStatus = (deliveryId: string, newStatus: string) => {
    setUpdating(true);
    setTimeout(() => {
      toast({
        title: "Status Updated",
        description: `Delivery #${deliveryId} is now ${newStatus}`,
      });
      setUpdating(false);
    }, 1000);
  };

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (!user) return null;

  const pendingCount = deliveries.filter(d => d.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#F7F1E3] flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-5">
            {/* Logistics Portal Header with Truck Graphic */}
            <div className="relative overflow-hidden rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
              {/* Farm truck graphic background */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                  <path fill="#3B5E2B" d="M25,55 L35,40 L60,40 L70,55 L25,55 Z M70,40 L85,40 L95,55 L70,55 L70,40 Z" />
                  <rect x="40" y="55" width="90" height="18" fill="#865D2E" />
                  <circle cx="55" cy="73" r="12" fill="#333333" />
                  <circle cx="115" cy="73" r="12" fill="#333333" />
                  <rect x="30" y="48" width="120" height="12" fill="#C09C6C" />
                </svg>
              </div>
              
              <div className="h-20 bg-[repeating-linear-gradient(90deg,#2E6C3C_0px,#2E6C3C_28px,#F7EED8_28px,#F7EED8_56px)]" />
              <div className="p-5 relative">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 relative">
                    <Truck className="h-8 w-8 text-primary" />
                    <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-1">
                      <Leaf className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Logistics Portal</h1>
                    <p className="text-sm text-muted-foreground">Manage deliveries</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>Farm-to-Market Hauler</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
              <CardContent className="p-4 space-y-2">
                <button
                  onClick={() => setActiveTab("available")}
                  className={cn(
                    "w-full h-12 rounded-2xl px-4 border transition-all text-left flex items-center justify-between",
                    activeTab === "available"
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-[#E8D7B5] hover:bg-[#FFF8E8] text-foreground"
                  )}
                >
                  <span className="flex items-center gap-3 font-medium text-sm">
                    <Package className="h-4 w-4" />
                    Available Deliveries
                  </span>
                  <span
                    className={cn(
                      "min-w-7 h-7 rounded-full text-xs px-2 flex items-center justify-center",
                      activeTab === "available"
                        ? "bg-white/20 text-white"
                        : "bg-[#FFF8E8] text-foreground"
                    )}
                  >
                    {pendingCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("active")}
                  className={cn(
                    "w-full h-12 rounded-2xl px-4 border transition-all text-left flex items-center justify-between",
                    activeTab === "active"
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-[#E8D7B5] hover:bg-[#FFF8E8] text-foreground"
                  )}
                >
                  <span className="flex items-center gap-3 font-medium text-sm">
                    <Truck className="h-4 w-4" />
                    Active Deliveries
                  </span>
                  <span
                    className={cn(
                      "min-w-7 h-7 rounded-full text-xs px-2 flex items-center justify-center",
                      activeTab === "active"
                        ? "bg-white/20 text-white"
                        : "bg-[#FFF8E8] text-foreground"
                    )}
                  >
                    {activeDeliveries.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("completed")}
                  className={cn(
                    "w-full h-12 rounded-2xl px-4 border transition-all text-left flex items-center justify-between",
                    activeTab === "completed"
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-[#E8D7B5] hover:bg-[#FFF8E8] text-foreground"
                  )}
                >
                  <span className="flex items-center gap-3 font-medium text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </span>
                </button>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Today's Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">₱2,450</div>
                <p className="text-xs text-muted-foreground">+15% from yesterday</p>
                <div className="mt-3 pt-3 border-t border-[#E8D7B5]">
                  <div className="flex justify-between text-xs">
                    <span>Total Deliveries:</span>
                    <span className="font-bold">8</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Distance Traveled:</span>
                    <span className="font-bold">245 km</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Available Deliveries */}
            {activeTab === "available" && (
              <div className="space-y-4">
                <div>
                  <WoodSign className="mb-3">Available Hauls</WoodSign>
                  <p className="text-sm text-muted-foreground">Browse and accept new delivery requests from farmers.</p>
                </div>
                {deliveries.filter(d => d.status === "pending").map((delivery) => (
                  <Card key={delivery.id} className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge className="bg-yellow-100 text-yellow-800 border-none px-3 py-1">Pending</Badge>
                          {/* Bold chalk-style font for delivery ID */}
                          <h3 
                            className="text-2xl font-bold mt-2 tracking-wide"
                            style={{ 
                              fontFamily: "'Gaegu', 'Comic Neue', 'Chalkboard SE', 'Segoe UI', cursive",
                              fontWeight: 700,
                              color: '#2C2418',
                              textShadow: '1px 1px 0 rgba(210, 180, 140, 0.5), 2px 2px 0 rgba(0,0,0,0.03)',
                              letterSpacing: '0.02em'
                            }}
                          >
                            Delivery #{delivery.id}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Pickup Date</p>
                          <p className="font-medium">{delivery.pickupDate}</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground">From</p>
                            <p className="font-medium">{delivery.farmerLocation}</p>
                            <p className="text-sm">{delivery.farmer}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Navigation className="h-4 w-4 text-primary mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground">To</p>
                            <p className="font-medium">{delivery.buyerLocation}</p>
                            <p className="text-sm">{delivery.buyer}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-[#FFF8E8] rounded-2xl">
                        <div>
                          <p className="text-xs text-muted-foreground">Product</p>
                          <p className="font-medium">{delivery.product}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="font-medium">{delivery.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="font-medium">{delivery.distance} km</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Proposed Cost</p>
                          <p className="text-lg font-bold text-primary">₱{delivery.proposedCost}/kg</p>
                          <p className="text-xs">Total: ₱{delivery.proposedCost * delivery.weight}</p>
                        </div>
                        <Button onClick={() => handleAcceptDelivery(delivery)} className="bg-primary hover:bg-primary/90">
                          Accept Delivery
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {deliveries.filter(d => d.status === "pending").length === 0 && (
                  <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                    <CardContent className="p-12 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No available deliveries at the moment</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Active Deliveries */}
            {activeTab === "active" && (
              <div className="space-y-4">
                <div>
                  <WoodSign className="mb-3">On the Road</WoodSign>
                  <p className="text-sm text-muted-foreground">Track your ongoing shipments and update status.</p>
                </div>
                {activeDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge className="bg-blue-100 text-blue-800 border-none px-3 py-1">In Transit</Badge>
                          {/* Bold chalk-style font for active delivery ID */}
                          <h3 
                            className="text-2xl font-bold mt-2 tracking-wide"
                            style={{ 
                              fontFamily: "'Gaegu', 'Comic Neue', 'Chalkboard SE', 'Segoe UI', cursive",
                              fontWeight: 700,
                              color: '#2C2418',
                              textShadow: '1px 1px 0 rgba(210, 180, 140, 0.5), 2px 2px 0 rgba(0,0,0,0.03)',
                              letterSpacing: '0.02em'
                            }}
                          >
                            Delivery #{delivery.id}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">ETA</p>
                          <p className="font-medium text-primary">{delivery.eta}</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-primary mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground">From</p>
                            <p className="font-medium">{delivery.farmer}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-primary mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground">To</p>
                            <p className="font-medium">{delivery.buyer}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Current Location</p>
                        <div className="flex items-center gap-2 p-2 bg-[#FFF8E8] rounded-2xl">
                          <Navigation className="h-4 w-4 text-primary" />
                          <span className="font-medium">{delivery.currentLocation}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 border-[#E8D7B5] hover:bg-[#FFF8E8]"
                          onClick={() => updateShipmentStatus(delivery.id, "in_transit")}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Update Status
                        </Button>
                        <Button 
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => updateShipmentStatus(delivery.id, "delivered")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Delivered
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Completed Deliveries */}
            {activeTab === "completed" && (
              <div className="space-y-4">
                <div>
                  <WoodSign className="mb-3">Delivery History</WoodSign>
                  <p className="text-sm text-muted-foreground">Review completed deliveries and earnings.</p>
                </div>
                <Card className="rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-md">
                  <CardContent className="p-8 text-center">
                    <div className="w-24 h-24 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4 border-2 border-amber-200">
                      <Truck className="h-12 w-12 text-amber-600" strokeWidth={1.5} />
                    </div>
                    <p className="text-xl font-bold mb-2">12 completed deliveries</p>
                    <p className="text-muted-foreground">Total earnings: ₱18,500</p>
                    <div className="mt-4 pt-4 border-t border-[#E8D7B5]">
                      <p className="text-xs text-muted-foreground">✓ All shipments delivered successfully</p>
                      <p className="text-xs text-muted-foreground mt-1">✓ Payments processed to your wallet</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Accept Delivery Modal with AI Suggestion - Using ₱ Peso Sign */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <Card className="w-full max-w-md rounded-[28px] border-[3px] border-[#C89D57] bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Accept Delivery
              </CardTitle>
              <p className="text-sm text-muted-foreground">Set your competitive rate for this haul</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Suggestion Card */}
              {aiSuggestion && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 rounded-full p-2">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        AI Smart Suggestion
                      </p>
                      <p className="text-2xl font-bold text-amber-900 mt-1">
                        ₱{aiSuggestion}/kg
                      </p>
                      <div className="mt-2 space-y-1">
                        {getAIReasoning(selectedDelivery, aiSuggestion).map((reason, idx) => (
                          <p key={idx} className="text-xs text-amber-700">{reason}</p>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 text-amber-700 border-amber-300 hover:bg-amber-100"
                        onClick={handleUseAISuggestion}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Use AI Suggestion
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-base font-semibold">Your Transport Cost (₱/kg)</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₱</span>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.00"
                    value={transportCost}
                    onChange={(e) => setTransportCost(e.target.value)}
                    className="pl-8 border-[#E8D7B5] focus:border-primary text-lg font-medium"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    Farmer's proposal: ₱{selectedDelivery.proposedCost}/kg
                  </p>
                  <p className="text-xs font-medium text-primary">
                    Total: ₱{((parseFloat(transportCost) || 0) * selectedDelivery.weight).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-[#FFF8E8] rounded-2xl p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Pickup: {selectedDelivery.pickupDate}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedDelivery.distance} km journey • {selectedDelivery.weight} kg load
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#E8D7B5]"
                  onClick={() => setSelectedDelivery(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={confirmAcceptance}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Accept"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}