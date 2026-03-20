"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PriceSuggester } from "@/components/farmer/PriceSuggester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Package, 
  History, 
  TrendingUp, 
  Settings, 
  Upload, 
  X, 
  Image as ImageIcon,
  Leaf,
  CheckCircle
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

// Storage key for products
const PRODUCTS_STORAGE_KEY = "sibol_products";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    location: "Nueva Ecija",
    description: "",
    harvestDate: new Date().toISOString().split('T')[0],
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get existing products
  const getProducts = () => {
    const products = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return products ? JSON.parse(products) : [];
  };

  // Save product to localStorage
  const saveProduct = (product: any) => {
    const products = getProducts();
    products.push(product);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    
    // Trigger storage event for marketplace to update
    window.dispatchEvent(new StorageEvent('storage', {
      key: PRODUCTS_STORAGE_KEY,
      newValue: JSON.stringify(products)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 5 images",
        variant: "destructive",
      });
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
        setImages(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.quantity) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create new product
    const newProduct = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      originalPrice: parseFloat(formData.price) + 5,
      quantity: parseInt(formData.quantity),
      location: formData.location,
      harvestDate: formData.harvestDate,
      rating: 0,
      reviews: 0,
      imageUrl: imagePreviews[0] || "https://picsum.photos/seed/rice-new/400/300",
      images: imagePreviews,
      isPooled: parseInt(formData.quantity) >= 100,
      category: parseInt(formData.quantity) >= 500 ? "premium" : "value",
      sold: 0,
      farmer: user?.name || "Local Farmer",
      farmerRating: 5.0,
      description: formData.description,
      createdAt: new Date().toISOString(),
      status: "active",
    };
    
    // Save to localStorage
    saveProduct(newProduct);
    
    setSuccess(true);
    toast({
      title: "Listing Created! 🎉",
      description: `${formData.name} has been listed on the marketplace.`,
    });
    
    // Reset form
    setTimeout(() => {
      setFormData({
        name: "",
        price: "",
        quantity: "",
        location: "Nueva Ecija",
        description: "",
        harvestDate: new Date().toISOString().split('T')[0],
      });
      setImages([]);
      setImagePreviews([]);
      setSuccess(false);
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <h1 className="text-2xl font-bold mb-6">Farmer Portal</h1>
            <nav className="space-y-1">
              <Button variant="secondary" className="w-full justify-start gap-3">
                <Plus className="h-4 w-4" /> Create Listing
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Package className="h-4 w-4" /> Active Harvests
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <TrendingUp className="h-4 w-4" /> Sales Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <History className="h-4 w-4" /> Order History
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Settings className="h-4 w-4" /> Settings
              </Button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">New Product Listing</h2>
              {success && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Listed on Marketplace!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="border-border/40">
                <CardContent className="p-6 space-y-6">
                  {/* Product Images Upload */}
                  <div className="space-y-3">
                    <Label>Product Photos</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      
                      {imagePreviews.length === 0 ? (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="cursor-pointer"
                        >
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Click to upload photos of your rice
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG or GIF (max 5 images)
                          </p>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Select Images
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border border-border bg-secondary/20">
                                  <Image
                                    src={preview}
                                    alt={`Product preview ${index + 1}`}
                                    width={150}
                                    height={150}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            {imagePreviews.length < 5 && (
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                              >
                                <Plus className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Add More Photos
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload clear photos of your rice to attract more buyers
                    </p>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g. Premium Dinorado Rice" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₱/kg) *</Label>
                        <Input 
                          id="price" 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity (kg) *</Label>
                        <Input 
                          id="quantity" 
                          type="number" 
                          placeholder="0" 
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input 
                          id="location" 
                          placeholder="Province, Municipality" 
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="harvestDate">Harvest Date</Label>
                        <Input 
                          id="harvestDate" 
                          type="date"
                          value={formData.harvestDate}
                          onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description & Harvest Details</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe your product, milling details, quality grade, etc." 
                        className="min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary h-12 text-lg"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Creating Listing...
                        </div>
                      ) : (
                        "Create Listing on Base"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
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

            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  Tips for Better Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>✅ Take photos in natural lighting</p>
                <p>✅ Show the grain quality up close</p>
                <p>✅ Include a photo of your harvest/farm</p>
                <p>✅ Use clear, well-lit backgrounds</p>
                <p>✅ Show packaging if available</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}