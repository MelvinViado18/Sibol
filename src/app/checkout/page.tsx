"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Truck, 
  Shield, 
  Lock, 
  ChevronRight, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Leaf,
  Users,
  CreditCard,
  Wallet,
  ArrowLeft,
  Minus,
  Plus,
  Loader2,
  User,
  Mail,
  Phone,
  Home,
  Building2,
  MessageSquare
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

// Storage keys
const ORDERS_STORAGE_KEY = "sibol_orders";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const productId = searchParams.get("id");
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(10);
  const [orderType, setOrderType] = useState<"individual" | "pooled">("individual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "confirmation">("cart");
  
  // SHIPPING DETAILS FORM STATE - This is where you fill your info!
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "Manila",
    barangay: "",
    postalCode: "",
    deliveryInstructions: "",
  });

  // Load product from localStorage
  useEffect(() => {
    const loadProduct = () => {
      const products = localStorage.getItem("sibol_products");
      if (products) {
        const allProducts = JSON.parse(products);
        const found = allProducts.find((p: any) => p.id === productId);
        if (found) {
          setProduct(found);
        }
      }
      setLoading(false);
    };
    
    if (productId) {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  // Calculate totals
  const subtotal = product ? product.price * quantity : 0;
  const shippingCost = 2.5;
  const shippingTotal = shippingCost * quantity;
  const discount = orderType === "pooled" && quantity >= 100 ? subtotal * 0.1 : 
                   orderType === "pooled" && quantity >= 50 ? subtotal * 0.05 : 0;
  const total = subtotal + shippingTotal - discount;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 10 && newQuantity <= (product?.quantity || 500)) {
      setQuantity(newQuantity);
    }
  };

  // Validate shipping details before proceeding to payment
  const validateShippingDetails = () => {
    if (!shippingDetails.fullName) {
      toast({ title: "Missing Name", description: "Please enter your full name", variant: "destructive" });
      return false;
    }
    if (!shippingDetails.email) {
      toast({ title: "Missing Email", description: "Please enter your email", variant: "destructive" });
      return false;
    }
    if (!shippingDetails.phone) {
      toast({ title: "Missing Phone", description: "Please enter your phone number", variant: "destructive" });
      return false;
    }
    if (!shippingDetails.address) {
      toast({ title: "Missing Address", description: "Please enter your street address", variant: "destructive" });
      return false;
    }
    if (!shippingDetails.city) {
      toast({ title: "Missing City", description: "Please enter your city", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (validateShippingDetails()) {
      setStep("payment");
    }
  };

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Create order with shipping details
      const newOrder = {
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        status: "pending",
        total: total,
        items: [{
          id: product.id,
          name: product.name,
          quantity: quantity,
          price: product.price,
          imageUrl: product.imageUrl,
        }],
        shipping: shippingDetails, // Save shipping details with order
        orderType: orderType,
        createdAt: new Date().toISOString(),
      };
      
      // Save order to localStorage
      const existingOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.push(newOrder);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      
      setIsProcessing(false);
      setStep("confirmation");
      toast({
        title: "Order Placed! 🎉",
        description: `Your order #${newOrder.id} has been placed successfully.`,
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Product not found</h1>
          <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist.</p>
          <Button asChild className="mt-6">
            <Link href="/market">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {["Cart", "Shipping", "Payment", "Confirmation"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${step === s.toLowerCase() ? "bg-primary text-white" : 
                    (i < ["cart", "shipping", "payment", "confirmation"].indexOf(step) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600")}
                `}>
                  {i < ["cart", "shipping", "payment", "confirmation"].indexOf(step) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs font-medium ml-2 hidden sm:inline">{s}</span>
                {i < 3 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Step */}
            {step === "cart" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Your Cart
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">by {product.farmer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">₱{product.price}/kg</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Quantity Selector */}
                  <div>
                    <Label>Quantity (kg)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(-10)}
                        disabled={quantity <= 10}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-2xl font-bold w-20 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(10)}
                        disabled={quantity >= (product.quantity || 500)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground ml-2">
                        Available: {product.quantity}kg
                      </span>
                    </div>
                  </div>

                  {/* Order Type Selection */}
                  <div>
                    <Label>Order Type</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        onClick={() => setOrderType("individual")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          orderType === "individual"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <ShoppingCart className="h-5 w-5 mb-2" />
                        <p className="font-medium">Individual Order</p>
                        <p className="text-xs text-muted-foreground">Buy for yourself</p>
                      </button>
                      <button
                        onClick={() => setOrderType("pooled")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          orderType === "pooled"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Users className="h-5 w-5 mb-2" />
                        <p className="font-medium">Pooled Order</p>
                        <p className="text-xs text-muted-foreground">Join group buying</p>
                      </button>
                    </div>
                  </div>

                  <Button onClick={() => setStep("shipping")} className="w-full h-12 text-lg">
                    Proceed to Shipping
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* SHIPPING STEP - FILL YOUR DETAILS HERE! */}
            {step === "shipping" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please fill in your delivery details
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Juan Dela Cruz"
                      value={shippingDetails.fullName}
                      onChange={(e) => setShippingDetails({...shippingDetails, fullName: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                  {/* Email and Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@example.com"
                        value={shippingDetails.email}
                        onChange={(e) => setShippingDetails({...shippingDetails, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        placeholder="09123456789"
                        value={shippingDetails.phone}
                        onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Street Address *
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Rizal St., Barangay"
                      value={shippingDetails.address}
                      onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                    />
                  </div>

                  {/* City and Barangay */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        City/Municipality *
                      </Label>
                      <select
                        id="city"
                        value={shippingDetails.city}
                        onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="Manila">Manila</option>
                        <option value="Quezon City">Quezon City</option>
                        <option value="Makati">Makati</option>
                        <option value="Pasig">Pasig</option>
                        <option value="Cebu">Cebu</option>
                        <option value="Davao">Davao</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barangay">Barangay/District</Label>
                      <Input
                        id="barangay"
                        placeholder="Barangay 123"
                        value={shippingDetails.barangay}
                        onChange={(e) => setShippingDetails({...shippingDetails, barangay: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="1000"
                      value={shippingDetails.postalCode}
                      onChange={(e) => setShippingDetails({...shippingDetails, postalCode: e.target.value})}
                    />
                  </div>

                  {/* Delivery Instructions */}
                  <div className="space-y-2">
                    <Label htmlFor="deliveryInstructions" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Delivery Instructions (Optional)
                    </Label>
                    <Input
                      id="deliveryInstructions"
                      placeholder="Landmark, gate code, etc."
                      value={shippingDetails.deliveryInstructions}
                      onChange={(e) => setShippingDetails({...shippingDetails, deliveryInstructions: e.target.value})}
                    />
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mt-4">
                    <p className="text-xs text-blue-800">
                      📦 Estimated delivery: 2-3 business days after order confirmation
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep("cart")} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Cart
                    </Button>
                    <Button onClick={handleContinueToPayment} className="flex-1">
                      Continue to Payment
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <p className="font-medium">Blockchain Escrow Payment</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your payment will be securely locked in a smart contract on Base blockchain.
                      Funds are only released to the farmer after you confirm delivery.
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Test Mode</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          This is a demo. No actual payment will be processed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep("shipping")} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      onClick={handlePayment} 
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Confirmation Step */}
            {step === "confirmation" && (
              <Card>
                <CardContent className="pt-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your order has been placed successfully.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                    <p className="font-medium mb-2">Shipping To:</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {shippingDetails.fullName}</p>
                      <p><span className="font-medium">Address:</span> {shippingDetails.address}, {shippingDetails.barangay}, {shippingDetails.city}</p>
                      <p><span className="font-medium">Phone:</span> {shippingDetails.phone}</p>
                    </div>
                    <Separator className="my-3" />
                    <p className="font-medium mb-2">Order Summary:</p>
                    <div className="space-y-1 text-sm">
                      <p>Product: {product.name} x {quantity}kg</p>
                      <p>Total: ₱{total.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/market">Continue Shopping</Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link href="/orders">View My Orders</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({quantity}kg)</span>
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₱{shippingTotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₱{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary text-xl">₱{total.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Escrow Protected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Trackable Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    <span>Direct from Farmer</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}