"use client";

import { useMemo, useState } from "react";
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
  Leaf,
  Minus,
  Plus,
  CheckCircle2,
  Store,
  Package,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";

const CHECKOUT_PRODUCT_KEY = "sibol_checkout_product";

function WoodSign({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

const riceGalleryCollection = {
  polished: [
    "/images/rice/polished-1.jpg",
    "/images/rice/polished-2.jpg",
    "/images/rice/polished-3.jpg",
    "/images/rice/polished-4.jpg",
    "/images/rice/brown-1.jpg",
    "/images/rice/brown-2.jpg",
    "/images/rice/brown-3.jpg",
    "/images/rice/brown-4.jpg",
    "/images/rice/farm-1.jpg",
    "/images/rice/farm-2.jpg",
    "/images/rice/farm-3.jpg",
    "/images/rice/seeds-1.jpg",
    "/images/rice/seeds-2.jpg",
    "/images/rice/seeds-3.jpg",
    "/images/rice/seeds-4.jpg",
  ],
};

function getGalleryByCategory(category: string) {
  const images =
    riceGalleryCollection[category as keyof typeof riceGalleryCollection] ||
    riceGalleryCollection.polished;

  return images.slice(0, 4);
}


export default function ProductDetailPage() {
 
  const [purchaseType, setPurchaseType] = useState<"individual" | "pooled">(
    "individual"
  );
  
  const [quantity, setQuantity] = useState(10);
  const [selectedImage, setSelectedImage] = useState(0);
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const productId = routeParams.id;
  

  const handlePurchase = () => {
    const checkoutProduct = {
      ...product,
      selectedQuantity: quantity,
      selectedOrderType: purchaseType,
    };

    localStorage.setItem(CHECKOUT_PRODUCT_KEY, JSON.stringify(checkoutProduct));

    router.push("/checkout");
  };

  const productCategory = "polished";

  const product = {
    name: "Dinorado Rice Premium Grade A",
    price: 38,
    marketPrice: 45,
    quantity: 500,
    minPooled: 1000,
    currentPooled: 650,
    buyersJoined: 8,
    location: "Gapan City, Nueva Ecija",
    harvestDate: "Feb 12, 2026",
    rating: 4.8,
    reviews: 24,
    category: productCategory,
    description:
      "Mabango, malambot, at bahagyang malagkit kapag naluto. Direktang inani mula sa mga bukirin ng Nueva Ecija at maingat na minill upang mapanatili ang kalidad at natural na sustansya.",
    farmer: "Nueva Ecija Rice Producers Cooperative",
    gallery: getGalleryByCategory(productCategory),
  };

  const shippingPerKg = 2.5;
  const subtotal = quantity * product.price;
  const shippingTotal = quantity * shippingPerKg;
  const total = subtotal + shippingTotal;
  const savingsPerKg = product.marketPrice - product.price;
  const totalSavings = quantity * savingsPerKg;
  const pooledProgress = (product.currentPooled / product.minPooled) * 100;
  const pooledRemaining = product.minPooled - product.currentPooled;
  const pooledPrice = product.price - 2;

  const decreaseQty = () => setQuantity((prev) => Math.max(10, prev - 5));
  const increaseQty = () =>
    setQuantity((prev) => Math.min(product.quantity, prev + 5));

  const highlights = useMemo(
    () => [
      {
        title: "Mabango at Malinamnam",
        text: "Kilalang Dinorado na may natural na aroma at premium na lasa.",
      },
      {
        title: "Bagong Ani",
        text: "Mas sariwa at mas malapit sa tunay na kalidad ng bukid.",
      },
      {
        title: "Direkta sa Kooperatiba",
        text: "Mas malinaw ang presyo at mas patas ang kita ng magsasaka.",
      },
      {
        title: "Maingat na Milling",
        text: "Pinoproseso para mapanatili ang butil, texture, at amoy.",
      },
    ],
    []
  );

  const reviews = [
    {
      name: "Sari-Sari Store Juan",
      initial: "J",
      text: "Maganda ang quality at consistent ang butil. Ito na mismo ang hanap ng mga suki ko.",
      rating: 5,
    },
    {
      name: "Luna's Eatery",
      initial: "L",
      text: "Mas gusto ko ang direct sa coop. Klaro ang presyo at maganda ang amoy ng bigas.",
      rating: 5,
    },
  ];

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
          {/* Hanging market header */}
          <div className="mb-8 flex justify-center">
            <div className="relative inline-flex items-center gap-3 rounded-full border-2 border-[#B98B4A] bg-[#FFF4D1] px-6 py-3 shadow-md">
              <div className="absolute -top-4 left-6 h-4 w-0.5 bg-[#B98B4A]" />
              <div className="absolute -top-4 right-6 h-4 w-0.5 bg-[#B98B4A]" />
              <Store className="h-5 w-5 text-[#7A4A14]" />
              <span className="text-sm font-black uppercase tracking-[0.24em] text-[#7A4A14]">
                Digital Palengke Stall
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 xl:gap-14">
            {/* LEFT */}
            <div className="lg:col-span-7 space-y-8">
              {/* Hero media */}
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-[28px] border-[3px] border-[#D1B07D] bg-[#FFF9EC] shadow-[0_18px_50px_rgba(92,62,27,0.14)]">
                  <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
                    <span className="rotate-[-4deg] rounded-full border border-[#E5C97B] bg-[#FFF0BF] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#7A5618] shadow-sm">
                      Bagong Ani
                    </span>
                    <span className="rotate-[3deg] rounded-full border border-[#B8D6B3] bg-[#E9F6E5] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#2E6C3C] shadow-sm">
                      Verified Coop
                    </span>
                    <span className="rotate-[-2deg] rounded-full border border-[#E9BF8E] bg-[#FFE6CA] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#8B4D16] shadow-sm">
                      Suki Favorite
                    </span>
                  </div>

                  <div className="relative aspect-[4/3]">
                    <Image
                      src={product.gallery[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2B2117]/40 via-transparent to-transparent" />
                  </div>

                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="rounded-full border border-white/40 bg-white/90 px-3 py-2 text-sm font-bold text-[#3C2A18] shadow backdrop-blur">
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-[#E3A400] text-[#E3A400]" />
                        {product.rating} • {product.reviews} review
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {product.gallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border-[2px] bg-[#FFF9EC] shadow-sm transition ${
                        selectedImage === index
                          ? "border-[#2E6C3C] ring-2 ring-[#2E6C3C]/20"
                          : "border-[#D7C29B] hover:border-[#B98B4A]"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product title block */}
              <div className="rounded-[28px] border-[2px] border-[#D7C29B] bg-[#FFF9EC] p-6 shadow-sm">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="rounded-full border border-[#B8D6B3] bg-[#E9F6E5] text-[#2E6C3C] hover:bg-[#E9F6E5]">
                    Direkta sa Magsasaka
                  </Badge>
                  <Badge className="rounded-full border border-[#E5C97B] bg-[#FFF0BF] text-[#7A5618] hover:bg-[#FFF0BF]">
                    Presyong Tapat
                  </Badge>
                  <Badge className="rounded-full border border-[#C9D9F0] bg-[#EEF5FF] text-[#355A8A] hover:bg-[#EEF5FF]">
                    Escrow Protected
                  </Badge>
                </div>

                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8B6A45]">
                  Benta ng Kooperatiba
                </p>

                <h1 className="mt-3 text-4xl lg:text-5xl font-black leading-tight tracking-tight text-[#2F1F10]">
                  {product.name}
                </h1>

                <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#694F33]">
                  Bigas na may kalidad at presyong mas makatarungan, diretso mula
                  sa lokal na kooperatiba para mas sariwa, mas malinaw, at mas
                  mapagkakatiwalaan ang bawat order.
                </p>

                <div className="mt-5 grid sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border-2 border-dashed border-[#D8C7A0] bg-[#FFFCF3] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8B6A45]">
                      Pinagmulan
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#3C2A18]">
                      <MapPin className="h-4 w-4 text-[#2E6C3C]" />
                      {product.location}
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-dashed border-[#D8C7A0] bg-[#FFFCF3] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8B6A45]">
                      Ani
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#3C2A18]">
                      <Calendar className="h-4 w-4 text-[#2E6C3C]" />
                      {product.harvestDate}
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-dashed border-[#D8C7A0] bg-[#FFFCF3] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8B6A45]">
                      Delivery
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#3C2A18]">
                      <Truck className="h-4 w-4 text-[#2E6C3C]" />
                      ₱{shippingPerKg.toFixed(2)}/kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Description note */}
              <div className="relative rounded-[26px] border-[2px] border-[#D7C29B] bg-[#FFF9EC] p-5 shadow-sm">
                <div className="absolute -top-3 left-5 rotate-[-3deg] rounded-full bg-[#FFE7A3] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#7A5618] shadow-sm">
                  Tungkol sa Bigas
                </div>
                <p className="pt-4 text-base leading-relaxed text-[#5E472F]">
                  {product.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="grid sm:grid-cols-2 gap-4">
                {highlights.map((item, i) => (
                  <Card
                    key={item.title}
                    className={`rounded-[26px] border-[2px] shadow-sm ${
                      i % 2 === 0
                        ? "border-[#D7C29B] bg-[#FFF9EC]"
                        : "border-[#C9D9B8] bg-[#F4FAEE]"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E9F6E5]">
                          <Leaf className="h-5 w-5 text-[#2E6C3C]" />
                        </div>
                        <div>
                          <p className="font-black text-[#2F1F10]">{item.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-[#694F33]">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Why Sibol */}
              <Card className="rounded-[28px] border-[2px] border-[#D7C29B] bg-gradient-to-r from-[#FFF3D0] to-[#F8F1E3] shadow-sm">
                <CardContent className="p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF9EC] px-3 py-1 border border-[#E5C97B]">
                    <Sparkles className="h-4 w-4 text-[#7A5618]" />
                    <span className="text-xs font-black uppercase tracking-wide text-[#7A5618]">
                      Bakit sa Sibol?
                    </span>
                  </div>

                  <h3 className="mt-4 text-2xl font-black text-[#2F1F10]">
                    Modernong palengke, mas patas na bentahan
                  </h3>

                  <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    <div>
                      <p className="font-black text-[#2F1F10]">Mas patas sa magsasaka</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#694F33]">
                        Mas kaunti ang middlemen kaya mas may balik sa producer.
                      </p>
                    </div>
                    <div>
                      <p className="font-black text-[#2F1F10]">Mas klaro ang presyo</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#694F33]">
                        Kita ang presyo ng bigas, logistics, at posibleng tipid.
                      </p>
                    </div>
                    <div>
                      <p className="font-black text-[#2F1F10]">Mas ligtas ang bayad</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#694F33]">
                        Naka-escrow ang pondo hanggang makumpirma ang delivery.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <div className="border-t-2 border-dashed border-[#D8C7A0] pt-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-black text-[#2F1F10]">
                    Mga Suki Review
                  </h3>
                  <Badge className="rounded-full border border-[#D7C29B] bg-[#FFF9EC] text-[#694F33] hover:bg-[#FFF9EC]">
                    {product.reviews} total
                  </Badge>
                </div>

                <div className="grid gap-4">
                  {reviews.map((review, i) => (
                    <Card
                      key={i}
                      className="rounded-[26px] border-[2px] border-[#D7C29B] bg-[#FFF9EC] shadow-sm"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9F6E5] font-black text-[#2E6C3C]">
                              {review.initial}
                            </div>
                            <div>
                              <p className="font-black text-sm text-[#2F1F10]">
                                {review.name}
                              </p>
                              <p className="text-xs text-[#7A6547]">Verified Buyer</p>
                            </div>
                          </div>

                          <div className="rounded-full border border-[#E9CB84] bg-[#FFF4D3] px-2.5 py-1 text-sm font-black text-[#7A5618]">
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-[#E3A400] text-[#E3A400]" />
                              {review.rating}.0
                            </span>
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-[#5E472F]">
                          {review.text}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5">
              <Card className="sticky top-24 rounded-[30px] border-[3px] border-[#C89D57] bg-[#FFF9EC] shadow-[0_20px_60px_rgba(88,61,31,0.16)]">
                <CardContent className="p-6 lg:p-7 space-y-7">
                  {/* Price board */}
                  <div className="relative rounded-[28px] border-[3px] border-[#B98B4A] bg-gradient-to-br from-[#FFF1C5] via-[#FFF8E8] to-[#F8E2AA] p-5 shadow-sm">
                    <div className="absolute -top-3 right-4 rotate-[4deg] rounded-full bg-[#2E6C3C] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">
                      Direkta sa Coop
                    </div>

                    <WoodSign className="text-xs font-black uppercase tracking-[0.25em] text-[#86591C]">
                      Presyo Ngayon
                    </WoodSign>

                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-5xl font-black text-[#7A4A14]">
                        ₱{product.price}
                      </span>
                      <span className="mb-1 text-lg text-[#7A6547]">/ kg</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-sm line-through text-[#7A6547]">
                        Karaniwang retail: ₱{product.marketPrice}
                      </span>
                      <Badge className="rounded-full bg-[#2E6C3C] text-white hover:bg-[#2E6C3C]">
                        Tipid ₱{savingsPerKg}/kg
                      </Badge>
                    </div>
                  </div>

                  {/* Buy mode */}
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8B6A45]">
                      Paraan ng Bili
                    </p>

                    <div className="grid grid-cols-2 rounded-2xl border-[2px] border-[#D7C29B] bg-[#F1E6CF] p-1">
                      <button
                        onClick={() => setPurchaseType("individual")}
                        className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                          purchaseType === "individual"
                            ? "bg-[#FFF9EC] text-[#2E6C3C] shadow-sm"
                            : "text-[#7A6547]"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Tingi
                        </span>
                      </button>

                      <button
                        onClick={() => setPurchaseType("pooled")}
                        className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                          purchaseType === "pooled"
                            ? "bg-[#2E6C3C] text-white shadow-sm"
                            : "text-[#7A6547]"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Pinagsama
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Pool board */}
                  {purchaseType === "pooled" && (
                    <div className="rounded-[24px] border-[2px] border-dashed border-[#95BC90] bg-[#EEF8E8] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-[#2E6C3C]">
                          Community Order Board
                        </p>
                        <Badge className="bg-[#2E6C3C] text-white hover:bg-[#2E6C3C]">
                          {Math.round(pooledProgress)}%
                        </Badge>
                      </div>

                      <Progress
                        value={pooledProgress}
                        className="mt-4 h-2 bg-[#D6E9D0]"
                      />

                      <div className="mt-4 space-y-1">
                        <p className="text-sm font-bold text-[#2F1F10]">
                          {product.currentPooled}kg na ang naipon mula sa{" "}
                          {product.buyersJoined} buyers
                        </p>
                        <p className="text-sm leading-relaxed text-[#5E472F]">
                          Kulang pa ng {pooledRemaining}kg para ma-unlock ang{" "}
                          <span className="font-black text-[#2E6C3C]">
                            ₱{pooledPrice}/kg
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8B6A45]">
                      Dami
                    </p>

                    <div className="flex items-center justify-between rounded-[24px] border-[2px] border-[#D7C29B] bg-[#FFFDF7] px-3 py-3 shadow-sm">
                      <button
                        onClick={decreaseQty}
                        disabled={quantity <= 10}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D7C29B] bg-white transition hover:bg-[#F5EEDC] disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <div className="text-center">
                        <p className="text-xl font-black text-[#2F1F10]">
                          {quantity} kg
                        </p>
                        <p className="text-xs text-[#7A6547]">Minimum 10kg</p>
                      </div>

                      <button
                        onClick={increaseQty}
                        disabled={quantity >= product.quantity}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D7C29B] bg-white transition hover:bg-[#F5EEDC] disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-[24px] border-[2px] border-[#D7C29B] bg-[#FFFDF7] p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#8B6A45]">
                      Kwentahan
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7A6547]">Bigas</span>
                        <span className="font-bold text-[#2F1F10]">
                          ₱{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7A6547]">Padala</span>
                        <span className="font-bold text-[#2F1F10]">
                          ₱{shippingTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7A6547]">Tipid vs retail</span>
                        <span className="font-bold text-[#2E6C3C]">
                          ₱{totalSavings.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-dashed border-[#D8C7A0] pt-3">
                        <span className="font-black text-[#2F1F10]">Kabuuan</span>
                        <span className="text-lg font-black text-[#7A4A14]">
                          ₱{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="space-y-4">
                    <Button
                      className="h-14 w-full rounded-2xl bg-[#2E6C3C] text-base font-black text-white shadow-lg hover:bg-[#285D35]"
                      onClick={handlePurchase}
                  
                    >
                          Secure Payment (Escrow)
                          <Lock className="ml-2 h-5 w-5" />
                    
                    </Button>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl border border-[#D7C29B] bg-[#FFFDF7] p-3">
                        <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-[#2E6C3C]" />
                        <p className="text-[11px] font-bold text-[#5E472F]">
                          Ligtas Bayad
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#D7C29B] bg-[#FFFDF7] p-3">
                        <Leaf className="mx-auto mb-1 h-4 w-4 text-[#2E6C3C]" />
                        <p className="text-[11px] font-bold text-[#5E472F]">
                          Farmer Direct
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#D7C29B] bg-[#FFFDF7] p-3">
                        <Truck className="mx-auto mb-1 h-4 w-4 text-[#2E6C3C]" />
                        <p className="text-[11px] font-bold text-[#5E472F]">
                          May Delivery
                        </p>
                      </div>
                    </div>

                    <p className="flex items-center justify-center gap-1 text-center text-xs text-[#7A6547]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Secured ng Sibol smart contracts on Base.
                    </p>
                  </div>

                  {/* Seller placard */}
                  <div className="rounded-[24px] border-[2px] border-[#D7C29B] bg-[#FFFDF7] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E9F6E5]">
                        <Store className="h-6 w-6 text-[#2E6C3C]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-[#7A6547]">Galing sa Stall</p>
                        <p className="truncate font-black text-[#2F1F10]">
                          {product.farmer}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#2E6C3C]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified cooperative • 4.9 rating
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto shrink-0 rounded-full text-[#2E6C3C] hover:bg-[#E9F6E5]"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Note card */}
                  <div className="rounded-[24px] border-[2px] border-dashed border-[#D8C7A0] bg-[#FFF4E5] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F3E1B6]">
                        <Package className="h-5 w-5 text-[#86591C]" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#2F1F10]">
                          Fair-price local buying
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#694F33]">
                          Mas malapit sa farm price ang order mo habang mas
                          sinusuportahan ang lokal na kooperatiba at mas malinaw
                          ang bentahan.
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