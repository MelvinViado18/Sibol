"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, SlidersHorizontal, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Dinorado Rice Premium",
    price: 38,
    quantity: 500,
    location: "Bayan, Nueva Ecija",
    harvestDate: "Feb 2026",
    rating: 4.8,
    imageUrl: "https://picsum.photos/seed/rice1/400/300",
    isPooled: true,
  },
  {
    id: "2",
    name: "Jasmine White Rice",
    price: 42,
    quantity: 1200,
    location: "Isabela City",
    harvestDate: "Jan 2026",
    rating: 4.5,
    imageUrl: "https://picsum.photos/seed/rice2/400/300",
    isPooled: false,
  },
  {
    id: "3",
    name: "Angelica Special Variety",
    price: 36,
    quantity: 250,
    location: "Tarlac Province",
    harvestDate: "Mar 2026",
    rating: 4.9,
    imageUrl: "https://picsum.photos/seed/rice3/400/300",
    isPooled: true,
  },
  {
    id: "4",
    name: "Organic Brown Rice",
    price: 55,
    quantity: 100,
    location: "Benguet",
    harvestDate: "Dec 2025",
    rating: 4.7,
    imageUrl: "https://picsum.photos/seed/rice4/400/300",
    isPooled: false,
  }
];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = SAMPLE_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || (activeTab === "pooled" && product.isPooled) || (activeTab === "direct" && !product.isPooled);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <header className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold font-headline">Agricultural Marketplace</h1>
              <p className="text-muted-foreground">Direct trade from cooperative farmers to your business.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products or locations..." 
                className="pl-10 h-11 bg-secondary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><Filter className="h-4 w-4" /> Categories</h3>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-md bg-primary/10 text-primary font-medium text-sm">All Grains</button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm">Polished Rice</button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm">Unpolished Rice</button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm">Seeds & Seedlings</button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold">Price Range</h3>
              <div className="space-y-2">
                <Input type="range" className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₱10</span>
                  <span>₱200</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-secondary/40">
                  <TabsTrigger value="all">All Listings</TabsTrigger>
                  <TabsTrigger value="pooled">Pooled Orders</TabsTrigger>
                  <TabsTrigger value="direct">Direct Sale</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sort by: Latest</span>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
                <div className="p-4 rounded-full bg-secondary">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">No products found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
                </div>
                <Button variant="outline" onClick={() => {setSearchTerm(""); setActiveTab("all");}}>Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}