"use client";

import { useState } from "react";
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
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function LogisticsDashboard() {
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [activeTab, setActiveTab] = useState<"available" | "active" | "completed">("available");
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [transportCost, setTransportCost] = useState("");
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleAcceptDelivery = (delivery: any) => {
    setSelectedDelivery(delivery);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Logistics Portal</h1>
                <p className="text-sm text-muted-foreground">Manage deliveries</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <Button 
                variant={activeTab === "available" ? "secondary" : "ghost"} 
                className="w-full justify-start gap-3"
                onClick={() => setActiveTab("available")}
              >
                <Package className="h-4 w-4" /> Available Deliveries
                <Badge variant="secondary" className="ml-auto">{deliveries.filter(d => d.status === "pending").length}</Badge>
              </Button>
              <Button 
                variant={activeTab === "active" ? "secondary" : "ghost"} 
                className="w-full justify-start gap-3"
                onClick={() => setActiveTab("active")}
              >
                <Truck className="h-4 w-4" /> Active Deliveries
                <Badge variant="secondary" className="ml-auto">{activeDeliveries.length}</Badge>
              </Button>
              <Button 
                variant={activeTab === "completed" ? "secondary" : "ghost"} 
                className="w-full justify-start gap-3"
                onClick={() => setActiveTab("completed")}
              >
                <CheckCircle className="h-4 w-4" /> Completed
              </Button>
            </nav>

            {/* Earnings Summary */}
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Today's Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">₱2,450</div>
                <p className="text-xs text-muted-foreground">+15% from yesterday</p>
                <div className="mt-3 pt-3 border-t">
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
                <h2 className="text-xl font-bold">Available Delivery Requests</h2>
                {deliveries.filter(d => d.status === "pending").map((delivery) => (
                  <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          <h3 className="text-lg font-bold mt-2">Delivery #{delivery.id}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Pickup Date</p>
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
                      
                      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-secondary/30 rounded-lg">
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
                        <Button onClick={() => handleAcceptDelivery(delivery)}>
                          Accept Delivery
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {deliveries.filter(d => d.status === "pending").length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No available deliveries at the moment</p>
                  </div>
                )}
              </div>
            )}

            {/* Active Deliveries */}
            {activeTab === "active" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Active Deliveries</h2>
                {activeDeliveries.map((delivery) => (
                  <Card key={delivery.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                          <h3 className="text-lg font-bold mt-2">Delivery #{delivery.id}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">ETA</p>
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
                        <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                          <Navigation className="h-4 w-4 text-primary" />
                          <span className="font-medium">{delivery.currentLocation}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => updateShipmentStatus(delivery.id, "in_transit")}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Update Status
                        </Button>
                        <Button 
                          className="flex-1 bg-primary"
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
                <h2 className="text-xl font-bold">Completed Deliveries</h2>
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                    <p className="text-muted-foreground">You have 12 completed deliveries</p>
                    <p className="text-sm text-muted-foreground mt-1">Total earnings: ₱18,500</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Accept Delivery Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Accept Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Your Transport Cost (₱/kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter your rate"
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Proposed: ₱{selectedDelivery.proposedCost}/kg
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedDelivery(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={confirmAcceptance}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}