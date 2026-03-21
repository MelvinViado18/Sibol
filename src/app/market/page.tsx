"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Package, 
  Star,
  TrendingUp,
  Truck,
  Shield,
  X,
  Grid3x3,
  List,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Default products (fallback when no products in storage)
const DEFAULT_PRODUCTS = [
  {
    id: "1",
    name: "Premium Dinorado Rice",
    price: 38,
    originalPrice: 45,
    quantity: 500,
    location: "Gapan City, Nueva Ecija",
    harvestDate: "Feb 2026",
    rating: 4.8,
    reviews: 124,
    imageUrl: "https://picsum.photos/seed/rice1/400/300",
    isPooled: true,
    category: "premium",
    sold: 1250,
    farmer: "Nueva Ecija Rice Producers Coop",
    farmerRating: 4.9,
    badge: "best-seller",
    description: "Premium quality Dinorado rice with distinct aroma and soft texture."
  },
  {
    id: "2",
    name: "Jasmine White Rice",
    price: 42,
    originalPrice: 52,
    quantity: 1200,
    location: "Isabela City",
    harvestDate: "Jan 2026",
    rating: 4.5,
    reviews: 89,
    imageUrl: "https://picsum.photos/seed/rice2/400/300",
    isPooled: false,
    category: "premium",
    sold: 2340,
    farmer: "Isabela Farmers Coop",
    farmerRating: 4.7,
    badge: "featured",
    description: "Fragrant jasmine rice, perfect for everyday meals."
  },
  {
    id: "3",
    name: "Angelica Special Rice",
    price: 36,
    originalPrice: 42,
    quantity: 250,
    location: "Tarlac Province",
    harvestDate: "Mar 2026",
    rating: 4.9,
    reviews: 56,
    imageUrl: "https://picsum.photos/seed/rice3/400/300",
    isPooled: true,
    category: "organic",
    sold: 890,
    farmer: "Tarlac Rice Growers",
    farmerRating: 4.8,
    badge: "new",
    description: "Organically grown rice with natural nutrients."
  },
  {
    id: "4",
    name: "Organic Brown Rice",
    price: 55,
    originalPrice: 65,
    quantity: 100,
    location: "Benguet",
    harvestDate: "Dec 2025",
    rating: 4.7,
    reviews: 42,
    imageUrl: "https://picsum.photos/seed/rice4/400/300",
    isPooled: false,
    category: "organic",
    sold: 450,
    farmer: "Benguet Organic Farmers",
    farmerRating: 4.9,
    badge: "organic",
    description: "Healthy brown rice, rich in fiber and nutrients."
  },
  {
    id: "5",
    name: "Sinandomeng Rice",
    price: 32,
    originalPrice: 38,
    quantity: 800,
    location: "Nueva Ecija",
    harvestDate: "Feb 2026",
    rating: 4.6,
    reviews: 78,
    imageUrl: "https://picsum.photos/seed/rice5/400/300",
    isPooled: true,
    category: "value",
    sold: 2100,
    farmer: "Nueva Ecija Farmers Coop",
    farmerRating: 4.6,
    badge: "value",
    description: "Affordable everyday rice, great value for money."
  },
  {
    id: "6",
    name: "Black Rice (Heirloom)",
    price: 85,
    originalPrice: 95,
    quantity: 50,
    location: "Ifugao",
    harvestDate: "Jan 2026",
    rating: 5.0,
    reviews: 23,
    imageUrl: "https://picsum.photos/seed/rice6/400/300",
    isPooled: false,
    category: "premium",
    sold: 120,
    farmer: "Ifugao Rice Terraces Coop",
    farmerRating: 5.0,
    badge: "limited",
    description: "Rare heirloom black rice from the rice terraces."
  },
];

const CATEGORIES = [
  { id: "all", name: "All Products", icon: Package },
  { id: "premium", name: "Premium Rice", icon: Star },
  { id: "organic", name: "Organic", icon: Shield },
  { id: "value", name: "Value Packs", icon: TrendingUp },
];

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function MarketplacePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [allProducts, setAllProducts] = useState(DEFAULT_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pooledOnly, setPooledOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load products from localStorage
  const loadProducts = () => {
    try {
      const storedProducts = localStorage.getItem("sibol_products");
      console.log("Raw stored products:", storedProducts);
      
      if (storedProducts) {
        const farmerProducts = JSON.parse(storedProducts);
        console.log("Parsed farmer products:", farmerProducts);
        
        if (farmerProducts && farmerProducts.length > 0) {
          // Combine farmer products with default products (avoid duplicates)
          const existingIds = new Set(farmerProducts.map((p: any) => p.id));
          const newDefaultProducts = DEFAULT_PRODUCTS.filter(p => !existingIds.has(p.id));
          const combined = [...farmerProducts, ...newDefaultProducts];
          console.log("Combined products:", combined);
          setAllProducts(combined);
        } else {
          setAllProducts(DEFAULT_PRODUCTS);
        }
      } else {
        console.log("No stored products, using defaults");
        setAllProducts(DEFAULT_PRODUCTS);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setAllProducts(DEFAULT_PRODUCTS);
    }
    setLoading(false);
    setRefreshing(false);
  };

  // Manual refresh function
  const refreshProducts = () => {
    setRefreshing(true);
    loadProducts();
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
    
    // Listen for storage changes (when new products are added from Farmer Portal)
    const handleStorageChange = (e: StorageEvent) => {
      console.log("Storage event detected:", e.key);
      if (e.key === "sibol_products") {
        console.log("Products updated, reloading...");
        loadProducts();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check for custom event from Farmer Portal
    const handleProductsUpdated = () => {
      console.log("Custom products updated event");
      loadProducts();
    };
    
    window.addEventListener("productsUpdated", handleProductsUpdated);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("productsUpdated", handleProductsUpdated);
    };
  }, []);

  // Check if user is logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth or loading products
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user, don't render the page (will redirect)
  if (!user) {
    return null;
  }

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.farmer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesPooled = !pooledOnly || product.isPooled;
    const matchesRating = product.rating >= minRating;
    const matchesStock = !inStockOnly || product.quantity > 0;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesPooled && matchesRating && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.price - b.price;
      case "price_high":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "popular":
        return (b.sold || 0) - (a.sold || 0);
      default:
        // Latest: use id or createdAt
        return (b.createdAt || b.id) - (a.createdAt || a.id);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Fresh from the Farm</h1>
              <p className="text-muted-foreground mt-1">Direct from farmers to your table</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshProducts}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Badge className="bg-primary text-white px-4 py-2">🚚 Free Shipping on ₱5,000+</Badge>
              <Badge variant="outline" className="px-4 py-2">✨ New Harvest Season</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex gap-2 mb-4">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                  <SheetDescription>
                    Narrow down your search
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <FilterSidebar 
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    pooledOnly={pooledOnly}
                    setPooledOnly={setPooledOnly}
                    minRating={minRating}
                    setMinRating={setMinRating}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-80 space-y-6">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => {
                  setPriceRange([0, 100]);
                  setPooledOnly(false);
                  setMinRating(0);
                  setInStockOnly(true);
                }}>
                  Reset
                </Button>
              </div>
              
              <FilterSidebar 
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                pooledOnly={pooledOnly}
                setPooledOnly={setPooledOnly}
                minRating={minRating}
                setMinRating={setMinRating}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="bg-white rounded-lg border p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by product, location, or farmer..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="hidden sm:flex gap-2">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "outline"} 
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "default" : "outline"} 
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="hidden sm:block w-48">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Categories Tabs */}
            <div className="mb-6 overflow-x-auto">
              <div className="flex gap-2">
                {CATEGORIES.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <cat.icon className="h-4 w-4" />
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Found {sortedProducts.length} products
              </p>
              {searchTerm && (
                <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
                  <X className="h-4 w-4 mr-1" />
                  Clear search
                </Button>
              )}
            </div>

            {/* Products Grid/List */}
            {sortedProducts.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-xl font-bold">No products found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or search term
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setPriceRange([0, 100]);
                    setPooledOnly(false);
                    setMinRating(0);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Sidebar Component
function FilterSidebar({ 
  priceRange, 
  setPriceRange, 
  pooledOnly, 
  setPooledOnly,
  minRating,
  setMinRating,
  inStockOnly = false,
  setInStockOnly = () => {}
}: any) {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={100}
            step={5}
            className="mb-4"
          />
          <div className="flex justify-between text-sm">
            <span>₱{priceRange[0]}</span>
            <span>₱{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Pooled Orders */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="pooled" 
          checked={pooledOnly}
          onCheckedChange={(checked) => setPooledOnly(checked as boolean)}
        />
        <Label htmlFor="pooled" className="cursor-pointer">
          Pooled Orders Only (Cheaper Prices)
        </Label>
      </div>

      {/* In Stock */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="instock" 
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
        />
        <Label htmlFor="instock" className="cursor-pointer">
          In Stock Only
        </Label>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="font-medium mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[0, 3, 4, 4.5].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox 
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={() => setMinRating(rating)}
              />
              <Label htmlFor={`rating-${rating}`} className="cursor-pointer flex items-center gap-1">
                {rating > 0 ? (
                  <>
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span>{rating}+ Stars</span>
                  </>
                ) : (
                  "All Ratings"
                )}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}