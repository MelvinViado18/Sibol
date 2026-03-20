"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PriceSuggester } from "@/components/farmer/PriceSuggester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, History, TrendingUp, Settings } from "lucide-react";

export default function FarmerDashboard() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    location: "Nueva Ecija",
    description: ""
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <h1 className="text-2xl font-bold font-headline mb-6">Farmer Portal</h1>
            <nav className="space-y-1">
              <Button variant="secondary" className="w-full justify-start gap-3"><Plus className="h-4 w-4" /> Create Listing</Button>
              <Button variant="ghost" className="w-full justify-start gap-3"><Package className="h-4 w-4" /> Active Harvests</Button>
              <Button variant="ghost" className="w-full justify-start gap-3"><TrendingUp className="h-4 w-4" /> Sales Analytics</Button>
              <Button variant="ghost" className="w-full justify-start gap-3"><History className="h-4 w-4" /> Order History</Button>
              <Button variant="ghost" className="w-full justify-start gap-3"><Settings className="h-4 w-4" /> Settings</Button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">New Product Listing</h2>
            </div>

            <Card className="border-border/40">
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Premium Dinorado Rice" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₱/kg)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity (kg)</Label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        placeholder="0" 
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="Province, Municipality" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description & Harvest Details</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe your product, milling details, etc." 
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button className="w-full bg-primary h-12 text-lg">Create Listing on Base</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tools Panel */}
          <div className="lg:col-span-3 space-y-6">
            <PriceSuggester productName={formData.name} location={formData.location} />
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Active Listings</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pending Orders</span>
                  <span className="font-bold text-accent-foreground">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Earnings (MTD)</span>
                  <span className="font-bold text-primary">₱124,500</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}