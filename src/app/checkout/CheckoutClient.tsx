"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
  ShieldCheck,
  Lock,
  ChevronRight,
  MapPin,
  Calendar,
  CheckCircle2,
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
  MessageSquare,
  Store,
  Package,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

const ORDERS_STORAGE_KEY = "sibol_orders";
const CHECKOUT_PRODUCT_KEY = "sibol_checkout_product";

type Step = "cart" | "shipping" | "payment" | "confirmation";
type OrderType = "individual" | "pooled";

type ShippingDetails = {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  barangay: string;
  addressLine: string;
  landmark: string;
  postalCode: string;
  deliveryInstructions: string;
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const productId = searchParams.get("id");
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(10);
  const [orderType, setOrderType] = useState<OrderType>("individual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<Step>("cart");
  const [placedOrderId, setPlacedOrderId] = useState("");

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    province: "Metro Manila",
    city: "",
    barangay: "",
    addressLine: "",
    landmark: "",
    postalCode: "",
    deliveryInstructions: "",
  });

  useEffect(() => {
    setShippingDetails((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName,
      email: user?.email || prev.email,
    }));
  }, [user]);

  useEffect(() => {
    const loadCheckoutProduct = () => {
      try {
        const savedProduct = localStorage.getItem(CHECKOUT_PRODUCT_KEY);

        if (savedProduct) {
          const parsedProduct = JSON.parse(savedProduct);
          setProduct(parsedProduct);

          if (parsedProduct.selectedQuantity) {
            setQuantity(parsedProduct.selectedQuantity);
          }

          if (
            parsedProduct.selectedOrderType === "individual" ||
            parsedProduct.selectedOrderType === "pooled"
          ) {
            setOrderType(parsedProduct.selectedOrderType);
          }
        }
      } catch (error) {
        console.error("Failed to load checkout product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutProduct();
  }, []);

  const shippingPerKg = 2.5;

  const subtotal = useMemo(() => {
    return product ? product.price * quantity : 0;
  }, [product, quantity]);

  const shippingTotal = useMemo(() => {
    return quantity * shippingPerKg;
  }, [quantity]);

  const discount = useMemo(() => {
    if (orderType !== "pooled") return 0;
    if (quantity >= 100) return subtotal * 0.1;
    if (quantity >= 50) return subtotal * 0.05;
    return 0;
  }, [orderType, quantity, subtotal]);

  const total = subtotal + shippingTotal - discount;
  const marketPrice = product?.marketPrice || (product?.price ? product.price + 7 : 0);
  const savingsPerKg = Math.max(0, marketPrice - (product?.price || 0));
  const totalSavings = savingsPerKg * quantity;

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const progressSteps = ["cart", "shipping", "payment", "confirmation"];
  const currentStepIndex = progressSteps.indexOf(step);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 10 && newQuantity <= (product?.quantity || 500)) {
      setQuantity(newQuantity);
    }
  };

  const updateShipping = (field: keyof ShippingDetails, value: string) => {
    setShippingDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateShippingDetails = () => {
    if (!shippingDetails.fullName.trim()) {
      toast({
        title: "Missing full name",
        description: "Please enter the recipient’s full name.",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingDetails.email.trim()) {
      toast({
        title: "Missing email",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingDetails.phone.trim()) {
      toast({
        title: "Missing phone number",
        description: "Please enter your contact number.",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingDetails.city.trim()) {
      toast({
        title: "Missing city",
        description: "Please enter your city or municipality.",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingDetails.barangay.trim()) {
      toast({
        title: "Missing barangay",
        description: "Please enter your barangay or district.",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingDetails.addressLine.trim()) {
      toast({
        title: "Missing address",
        description: "Please enter your street address, house number, or building.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask or another compatible wallet.",
          variant: "destructive",
        });
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts?.[0]) {
        setIsWalletConnected(true);
        setWalletAddress(accounts[0]);

        toast({
          title: "Wallet connected",
          description: "You can now continue with escrow payment.",
        });
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Could not connect your wallet.",
        variant: "destructive",
      });
    }
  };

  const handleContinueToPayment = () => {
    if (!validateShippingDetails()) return;
    setStep("payment");
  };

  const handlePayment = () => {
    if (!product) return;

    setIsProcessing(true);

    setTimeout(() => {
      const orderId = `ORD-${Date.now()}`;

      const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "paid_escrow",
        paymentStatus: "escrow_secured",
        fulfillmentStatus: "awaiting_farmer_confirmation",
        total,
        subtotal,
        shippingFee: shippingTotal,
        discount,
        orderType,
        quantity,
        savings: totalSavings,
        item: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          farmer: product.farmer,
          location: product.location,
          harvestDate: product.harvestDate,
        },
        shipping: {
          ...shippingDetails,
        },
        timeline: [
          {
            label: "Order placed",
            status: "completed",
            date: new Date().toISOString(),
          },
          {
            label: "Payment secured in escrow",
            status: "completed",
            date: new Date().toISOString(),
          },
          {
            label: "Waiting for cooperative confirmation",
            status: "current",
            date: new Date().toISOString(),
          },
        ],
      };

      try {
        const existingOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
        const orders = existingOrders ? JSON.parse(existingOrders) : [];
        orders.push(newOrder);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

        setPlacedOrderId(orderId);
        setStep("confirmation");

        toast({
          title: "Escrow secured",
          description:
            "Your payment is now safely held until the cooperative prepares and delivers your order.",
        });
      } catch (error) {
        toast({
          title: "Something went wrong",
          description: "We couldn’t save your order. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }, 1800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6EEDC] text-[#3C2A18]">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2E6C3C]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F6EEDC] text-[#3C2A18]">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-[#8B6A45]" />
          <h1 className="text-2xl font-black">Product not found</h1>
          <p className="mt-2 text-[#7A6547]">
            The product you’re looking for doesn’t exist or is no longer available.
          </p>
          <Button asChild className="mt-6 bg-[#2E6C3C] hover:bg-[#285D35]">
            <Link href="/market">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#F6EEDC] text-[#3C2A18]">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-16 h-72 w-72 rounded-full bg-[#E5C97B]/20 blur-3xl" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#9EC49A]/20 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-[#D4A56A]/15 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-10 relative">
          <div className="mb-8 flex justify-center">
            <div className="relative inline-flex items-center gap-3 rounded-full border-2 border-[#B98B4A] bg-[#FFF4D1] px-6 py-3 shadow-md">
              <div className="absolute -top-4 left-6 h-4 w-0.5 bg-[#B98B4A]" />
              <div className="absolute -top-4 right-6 h-4 w-0.5 bg-[#B98B4A]" />
              <Lock className="h-5 w-5 text-[#7A4A14]" />
              <span className="text-sm font-black uppercase tracking-[0.24em] text-[#7A4A14]">
                Secure Sibol Checkout
              </span>
            </div>
          </div>

          <div className="mx-auto mb-8 max-w-4xl">
            <div className="flex items-center justify-between gap-2 overflow-x-auto">
              {["Cart", "Shipping", "Payment", "Confirmation"].map((label, i) => (
                <div key={label} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black ${
                      i < currentStepIndex
                        ? "border-[#2E6C3C] bg-[#2E6C3C] text-white"
                        : i === currentStepIndex
                        ? "border-[#B98B4A] bg-[#FFF4D1] text-[#7A4A14]"
                        : "border-[#D7C29B] bg-[#FFF9EC] text-[#8B6A45]"
                    }`}
                  >
                    {i < currentStepIndex ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </div>

                  <div className="ml-2 min-w-[70px]">
                    <p className="text-xs font-black uppercase tracking-wide text-[#7A6547]">
                      {label}
                    </p>
                  </div>

                  {i < 3 && <ChevronRight className="mx-2 h-4 w-4 text-[#B99970]" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              {step === "cart" && (
                <Card className="rounded-[28px] border-[2px] border-[#D7C29B] bg-[#FFF9EC] shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#2F1F10]">
                      <ShoppingCart className="h-5 w-5 text-[#2E6C3C]" />
                      Review Your Order
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-[#D7C29B] bg-[#FFFDF7]">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <Badge className="rounded-full border border-[#B8D6B3] bg-[#E9F6E5] text-[#2E6C3C] hover:bg-[#E9F6E5]">
                            Direct from Farmer
                          </Badge>
                          <Badge className="rounded-full border border-[#C9D9F0] bg-[#EEF5FF] text-[#355A8A] hover:bg-[#EEF5FF]">
                            Escrow Protected
                          </Badge>
                        </div>

                        <h3 className="text-lg font-black text-[#2F1F10]">{product.name}</h3>
                        <p className="mt-1 text-sm text-[#7A6547]">by {product.farmer}</p>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#694F33]">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-[#2E6C3C]" />
                            {product.location || "Nueva Ecija"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-[#2E6C3C]" />
                            {product.harvestDate || "Fresh harvest"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-black text-[#7A4A14]">₱{product.price}/kg</p>
                      </div>
                    </div>

                    <Separator className="bg-[#E4D3B1]" />

                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-[0.22em] text-[#8B6A45]">
                        Quantity
                      </Label>

                      <div className="flex items-center justify-between rounded-[24px] border-[2px] border-[#D7C29B] bg-[#FFFDF7] px-3 py-3 shadow-sm">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(-5)}
                          disabled={quantity <= 10}
                          className="rounded-xl border-[#D7C29B] bg-white hover:bg-[#F5EEDC]"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <div className="text-center">
                          <p className="text-2xl font-black text-[#2F1F10]">{quantity} kg</p>
                          <p className="text-xs text-[#7A6547]">
                            Available: {product.quantity || 500}kg
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(5)}
                          disabled={quantity >= (product.quantity || 500)}
                          className="rounded-xl border-[#D7C29B] bg-white hover:bg-[#F5EEDC]"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-[0.22em] text-[#8B6A45]">
                        Buying Mode
                      </Label>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setOrderType("individual")}
                          className={`rounded-2xl border-2 p-4 text-left transition ${
                            orderType === "individual"
                              ? "border-[#B98B4A] bg-[#FFF4D1]"
                              : "border-[#D7C29B] bg-[#FFFDF7] hover:border-[#B98B4A]"
                          }`}
                        >
                          <ShoppingCart className="mb-2 h-5 w-5 text-[#7A4A14]" />
                          <p className="font-black text-[#2F1F10]">Individual</p>
                          <p className="text-xs text-[#7A6547]">Buy for your own order</p>
                        </button>

                        <button
                          onClick={() => setOrderType("pooled")}
                          className={`rounded-2xl border-2 p-4 text-left transition ${
                            orderType === "pooled"
                              ? "border-[#2E6C3C] bg-[#EEF8E8]"
                              : "border-[#D7C29B] bg-[#FFFDF7] hover:border-[#2E6C3C]"
                          }`}
                        >
                          <Users className="mb-2 h-5 w-5 text-[#2E6C3C]" />
                          <p className="font-black text-[#2F1F10]">Pooled</p>
                          <p className="text-xs text-[#7A6547]">Join group buying for discounts</p>
                        </button>
                      </div>

                      {orderType === "pooled" && (
                        <div className="rounded-2xl border border-dashed border-[#95BC90] bg-[#EEF8E8] p-4 text-sm text-[#355B32]">
                          Bulk savings unlock at 50kg and 100kg pooled orders.
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => setStep("shipping")}
                      className="h-12 w-full rounded-2xl bg-[#2E6C3C] text-base font-black text-white hover:bg-[#285D35]"
                    >
                      Continue to Delivery Details
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {step === "shipping" && (
                <Card className="rounded-[28px] border-[2px] border-[#D7C29B] bg-[#FFF9EC] shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#2F1F10]">
                      <Truck className="h-5 w-5 text-[#2E6C3C]" />
                      Delivery Information
                    </CardTitle>
                    <p className="text-sm text-[#7A6547]">
                      Enter the full delivery details for this order.
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Juan Dela Cruz"
                          value={shippingDetails.fullName}
                          onChange={(e) => updateShipping("fullName", e.target.value)}
                          className="border-[#D7C29B] bg-white"
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
                          onChange={(e) => updateShipping("phone", e.target.value)}
                          className="border-[#D7C29B] bg-white"
                        />
                      </div>
                    </div>

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
                        onChange={(e) => updateShipping("email", e.target.value)}
                        className="border-[#D7C29B] bg-white"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="province" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Province / Region *
                        </Label>
                        <Input
                          id="province"
                          placeholder="Metro Manila"
                          value={shippingDetails.province}
                          onChange={(e) => updateShipping("province", e.target.value)}
                          className="border-[#D7C29B] bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          City / Municipality *
                        </Label>
                        <Input
                          id="city"
                          placeholder="Quezon City"
                          value={shippingDetails.city}
                          onChange={(e) => updateShipping("city", e.target.value)}
                          className="border-[#D7C29B] bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="barangay">Barangay / District *</Label>
                        <Input
                          id="barangay"
                          placeholder="Barangay 123"
                          value={shippingDetails.barangay}
                          onChange={(e) => updateShipping("barangay", e.target.value)}
                          className="border-[#D7C29B] bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          placeholder="1100"
                          value={shippingDetails.postalCode}
                          onChange={(e) => updateShipping("postalCode", e.target.value)}
                          className="border-[#D7C29B] bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Street Address / Building / House No. *
                      </Label>
                      <Input
                        id="addressLine"
                        placeholder="Blk 3 Lot 8 Rizal St."
                        value={shippingDetails.addressLine}
                        onChange={(e) => updateShipping("addressLine", e.target.value)}
                        className="border-[#D7C29B] bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="landmark">Landmark</Label>
                      <Input
                        id="landmark"
                        placeholder="Near barangay hall, beside bakery"
                        value={shippingDetails.landmark}
                        onChange={(e) => updateShipping("landmark", e.target.value)}
                        className="border-[#D7C29B] bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryInstructions" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Delivery Instructions
                      </Label>
                      <Input
                        id="deliveryInstructions"
                        placeholder="Call first before arrival, leave at gate, etc."
                        value={shippingDetails.deliveryInstructions}
                        onChange={(e) => updateShipping("deliveryInstructions", e.target.value)}
                        className="border-[#D7C29B] bg-white"
                      />
                    </div>

                    <div className="rounded-2xl border border-[#C9D9F0] bg-[#EEF5FF] p-4 text-sm text-[#355A8A]">
                      Delivery address is part of your order record. The cooperative will use this
                      only to prepare and fulfill your shipment.
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep("cart")}
                        className="flex-1 rounded-2xl border-[#D7C29B] bg-white hover:bg-[#F5EEDC]"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cart
                      </Button>

                      <Button
                        onClick={handleContinueToPayment}
                        className="flex-1 rounded-2xl bg-[#2E6C3C] font-black text-white hover:bg-[#285D35]"
                      >
                        Continue to Secure Payment
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "payment" && (
                <Card className="rounded-[28px] border-[2px] border-[#D7C29B] bg-[#FFF9EC] shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#2F1F10]">
                      <CreditCard className="h-5 w-5 text-[#2E6C3C]" />
                      Secure Payment
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="rounded-[24px] border-[2px] border-[#C9D9F0] bg-[#EEF5FF] p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#355A8A]" />
                        <p className="font-black text-[#2F1F10]">Escrow Payment on Base</p>
                      </div>
                      <p className="text-sm leading-relaxed text-[#355A8A]">
                        Your payment will be held securely in escrow first. The cooperative will
                        only receive the funds after delivery is confirmed.
                      </p>
                    </div>

                    <div className="rounded-[24px] border-[2px] border-[#E5C97B] bg-[#FFF4D3] p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 text-[#7A5618]" />
                        <div>
                          <p className="font-black text-[#2F1F10]">Demo payment mode</p>
                          <p className="mt-1 text-sm leading-relaxed text-[#7A6547]">
                            This is a prototype checkout. No real wallet charge will happen yet,
                            but the order will be saved as <span className="font-black">paid in escrow</span>.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border-[2px] border-[#D7C29B] bg-[#FFFDF7] p-5">
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#8B6A45]">
                        Delivery To
                      </p>

                      <div className="space-y-1 text-sm text-[#5E472F]">
                        <p className="font-bold text-[#2F1F10]">{shippingDetails.fullName}</p>
                        <p>{shippingDetails.phone}</p>
                        <p>{shippingDetails.email}</p>
                        <p>
                          {shippingDetails.addressLine}, {shippingDetails.barangay},{" "}
                          {shippingDetails.city}, {shippingDetails.province}
                        </p>
                        {shippingDetails.landmark && <p>Landmark: {shippingDetails.landmark}</p>}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep("shipping")}
                        className="flex-1 rounded-2xl border-[#D7C29B] bg-white hover:bg-[#F5EEDC]"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>

                      {!isWalletConnected ? (
                        <Button
                          onClick={handleConnectWallet}
                          className="flex-1 rounded-2xl bg-[#2E6C3C] font-black text-white hover:bg-[#285D35]"
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          Connect Wallet
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePayment}
                          disabled={isProcessing}
                          className="flex-1 rounded-2xl bg-[#2E6C3C] font-black text-white hover:bg-[#285D35]"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Securing Payment...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Pay with Escrow
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "confirmation" && (
                <Card className="rounded-[28px] border-[2px] border-[#B8D6B3] bg-[#F9FFF5] shadow-sm">
                  <CardContent className="pt-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#E9F6E5]">
                      <CheckCircle2 className="h-10 w-10 text-[#2E6C3C]" />
                    </div>

                    <h2 className="text-3xl font-black text-[#2F1F10]">Escrow Secured</h2>
                    <p className="mx-auto mt-2 max-w-xl text-[#6A5438]">
                      Your order has been placed and your payment is now safely held until the
                      cooperative prepares and delivers your rice.
                    </p>

                    <div className="mt-6 rounded-[24px] border-[2px] border-[#D7C29B] bg-white p-5 text-left">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8B6A45]">
                            Order ID
                          </p>
                          <p className="mt-1 font-black text-[#2F1F10]">{placedOrderId}</p>
                        </div>

                        <Badge className="rounded-full bg-[#2E6C3C] text-white hover:bg-[#2E6C3C]">
                          Paid in Escrow
                        </Badge>
                      </div>

                      <Separator className="my-4 bg-[#E4D3B1]" />

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <p className="mb-2 text-sm font-black text-[#2F1F10]">Shipping To</p>
                          <div className="space-y-1 text-sm text-[#5E472F]">
                            <p>{shippingDetails.fullName}</p>
                            <p>{shippingDetails.phone}</p>
                            <p>
                              {shippingDetails.addressLine}, {shippingDetails.barangay},{" "}
                              {shippingDetails.city}, {shippingDetails.province}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-sm font-black text-[#2F1F10]">Order Summary</p>
                          <div className="space-y-1 text-sm text-[#5E472F]">
                            <p>{product.name}</p>
                            <p>{quantity}kg</p>
                            <p>Total: ₱{total.toLocaleString()}</p>
                            <p>Mode: {orderType === "pooled" ? "Pooled order" : "Individual order"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-[#C9D9F0] bg-[#EEF5FF] p-4 text-sm text-[#355A8A]">
                        Next step: the cooperative reviews your order, prepares the stock, and
                        updates the delivery status. Payment stays protected until confirmation.
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 rounded-2xl border-[#D7C29B] bg-white hover:bg-[#F5EEDC]"
                      >
                        <Link href="/market">Continue Shopping</Link>
                      </Button>

                      <Button
                        asChild
                        className="flex-1 rounded-2xl bg-[#2E6C3C] font-black text-white hover:bg-[#285D35]"
                      >
                        <Link href="/orders">View My Orders</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-5">
              <Card className="sticky top-24 rounded-[30px] border-[3px] border-[#C89D57] bg-[#FFF9EC] shadow-[0_20px_60px_rgba(88,61,31,0.16)]">
                <CardContent className="space-y-6 p-6 lg:p-7">
                  <div className="rounded-[24px] border-[3px] border-[#B98B4A] bg-gradient-to-br from-[#FFF1C5] via-[#FFF8E8] to-[#F8E2AA] p-5">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FFF9EC] px-3 py-1 border border-[#E5C97B]">
                      <Sparkles className="h-4 w-4 text-[#7A5618]" />
                      <span className="text-[11px] font-black uppercase tracking-wide text-[#7A5618]">
                        Checkout Summary
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-[#7A4A14]">₱{total.toLocaleString()}</h3>
                    <p className="mt-1 text-sm text-[#7A6547]">
                      Protected payment for {quantity}kg of rice
                    </p>
                  </div>

                  <div className="rounded-[24px] border-[2px] border-[#D7C29B] bg-[#FFFDF7] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-[#D7C29B]">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-black text-[#2F1F10]">{product.name}</p>
                        <p className="text-sm text-[#7A6547]">{product.farmer}</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#7A6547]">Rice ({quantity}kg)</span>
                        <span className="font-bold text-[#2F1F10]">₱{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7A6547]">Shipping</span>
                        <span className="font-bold text-[#2F1F10]">₱{shippingTotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-[#2E6C3C]">
                          <span>Pooled discount</span>
                          <span className="font-bold">-₱{discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#2E6C3C]">
                        <span>Estimated savings</span>
                        <span className="font-bold">₱{totalSavings.toLocaleString()}</span>
                      </div>

                      <Separator className="bg-[#E4D3B1]" />

                      <div className="flex justify-between">
                        <span className="font-black text-[#2F1F10]">Total</span>
                        <span className="text-xl font-black text-[#7A4A14]">
                          ₱{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-[#D7C29B] bg-[#FFFDF7] p-4">
                      <p className="flex items-center gap-2 text-sm font-black text-[#2F1F10]">
                        <ShieldCheck className="h-4 w-4 text-[#2E6C3C]" />
                        Escrow Protected
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#694F33]">
                        Funds are held safely until delivery is confirmed.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#D7C29B] bg-[#FFFDF7] p-4">
                      <p className="flex items-center gap-2 text-sm font-black text-[#2F1F10]">
                        <Truck className="h-4 w-4 text-[#2E6C3C]" />
                        Trackable Delivery
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#694F33]">
                        Your shipping details are saved with the order for fulfillment.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#D7C29B] bg-[#FFFDF7] p-4">
                      <p className="flex items-center gap-2 text-sm font-black text-[#2F1F10]">
                        <Leaf className="h-4 w-4 text-[#2E6C3C]" />
                        Direct from Cooperative
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#694F33]">
                        Fewer middlemen, fairer pricing, better returns for farmers.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border-[2px] border-dashed border-[#D8C7A0] bg-[#FFF4E5] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F3E1B6]">
                        <Store className="h-5 w-5 text-[#86591C]" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#2F1F10]">How payment works</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#694F33]">
                          Buyer pays first, funds go into escrow, the cooperative ships, and payment
                          is released after delivery confirmation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border-[2px] border-dashed border-[#D7C29B] bg-[#FFFDF7] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E9F6E5]">
                        <Package className="h-5 w-5 text-[#2E6C3C]" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#2F1F10]">Delivery estimate</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#694F33]">
                          Expected within 2–3 business days after cooperative confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}