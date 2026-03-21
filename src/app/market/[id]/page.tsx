"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Leaf
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [purchaseType, setPurchaseType] = useState<"individual" | "pooled">("individual");
  const [isEscrowProcessing, setIsEscrowProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const handlePurchase = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setIsEscrowProcessing(true);
    setTimeout(() => {
      setIsEscrowProcessing(false);
      toast({
        title: "Escrow Payment Initialized",
        description: "Funds are now safely locked in the smart contract on Base. Farmer has been notified.",
      });
      router.push(`/checkout?id=${params.id}`);
    }, 2000);
  };

  // Rest of your product detail code...
  
  return (
    <>
      <Navbar />
      {/* Your existing JSX */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}