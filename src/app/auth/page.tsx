"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Shield, 
  ArrowRight, 
  ArrowLeft, 
  TrendingUp,
  Award,
  Sparkles,
  Truck,
  Users,
  CreditCard,
  ShieldCheck,
  Leaf
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

// WoodSign component
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

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, user } = useAuth();
  const { toast } = useToast();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(loginEmail, loginPassword);
    
    if (success) {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (signupPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const success = await signup(signupName, signupEmail, signupPassword, "user");
    
    if (success) {
      toast({
        title: "Account created!",
        description: `Welcome to SibolMarket, ${signupName}!`,
      });
    } else {
      toast({
        title: "Signup failed",
        description: "Email already exists. Please use a different email.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const features = [
    { icon: Shield, title: "Secure Escrow", description: "Blockchain payments" },
    { icon: Truck, title: "Smart Logistics", description: "Real-time tracking" },
    { icon: Users, title: "Direct Trade", description: "Farm-to-consumer" },
    { icon: Award, title: "Quality", description: "Certified products" },
  ];

  const stats = [
    { value: "1K+", label: "Users" },
    { value: "500+", label: "Farmers" },
    { value: "50+", label: "Cities" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      {/* Header with Back Navigation */}
      <div className="container mx-auto px-4 py-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Go Back</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* Left Side - Branding */}
          <div className="flex-1">
            <div className="sticky top-8 space-y-5">
              {/* Logo */}
              <div className="inline-flex items-center gap-3">
                <div className="relative h-12 w-12">
                  <Image
                    src="/sibolLogo.png"
                    alt="SibolMarket Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-2xl font-bold text-primary">Sibol</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                  Grow with
                  <span className="text-primary block mt-2">Sibol</span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                The complete agricultural ecosystem connecting farmers, buyers, and logistics partners in one seamless platform.
              </p>

              {/* Stats Section */}
              <div className="flex justify-between gap-4 py-4 border-y border-primary/10">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center flex-1">
                    <div className="text-xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-all duration-300 group cursor-default"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs">{feature.title}</h3>
                      <p className="text-[10px] text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Offer Banner */}
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-3 border border-primary/20">
                <Sparkles className="absolute top-2 right-2 h-3 w-3 text-primary/30" />
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Welcome Offer</p>
                    <p className="text-[10px] text-muted-foreground">
                      New users get <span className="font-bold text-primary">10% off</span> first purchase
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form with Canopy */}
          <div className="flex-1 w-full max-w-md">
            <div className="min-h-[600px]">
              {/* Canopy Container */}
              <div className="relative mx-auto w-full">
                {/* Green and White Striped Canopy */}
                <div className="w-full">
                  <div className="h-12 w-full rounded-t-2xl overflow-hidden shadow-md flex">
                    <div className="flex-1 bg-[#2E6C3C]" />
                    <div className="flex-1 bg-[#F7EED8]" />
                    <div className="flex-1 bg-[#2E6C3C]" />
                    <div className="flex-1 bg-[#F7EED8]" />
                    <div className="flex-1 bg-[#2E6C3C]" />
                    <div className="flex-1 bg-[#F7EED8]" />
                  </div>

                  {/* Scalloped edge effect */}
                  <div className="flex">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-4 bg-[#236B44] rounded-b-full opacity-90"
                      />
                    ))}
                  </div>
                </div>

                {/* Card with border only - top border removed */}
                <Card className="rounded-t-none border-l-[3px] border-r-[3px] border-b-[3px] border-t-0 border-[#C89D57] shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <CardHeader className="space-y-3 pb-4 pt-6">
                    {/* WoodSign Title based on active tab */}
                    <div className="flex justify-center">
                      <WoodSign>
                        {activeTab === "login" ? "Welcome Back" : "Create Account"}
                      </WoodSign>
                    </div>
                    <CardDescription className="text-center text-sm">
                      {activeTab === "login" 
                        ? "Sign in to continue your agricultural journey" 
                        : "Join the agricultural revolution today"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 gap-2 bg-muted/50 p-1 mb-6">
                        <TabsTrigger 
                          value="login" 
                          className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 rounded-md text-sm"
                        >
                          Sign In
                        </TabsTrigger>
                        <TabsTrigger 
                          value="signup"
                          className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 rounded-md text-sm"
                        >
                          Sign Up
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Login Tab */}
                      <TabsContent value="login" className="mt-0">
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10 h-10 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all duration-300 text-sm"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                              <button type="button" className="text-xs text-primary hover:underline">
                                Forgot?
                              </button>
                            </div>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="login-password"
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10 h-10 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all duration-300 text-sm"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full h-10 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                              </>
                            ) : (
                              <>
                                Sign In
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </form>
                        
                        <div className="mt-6 pt-4 text-center border-t border-muted-foreground/10">
                          <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <button
                              onClick={() => setActiveTab("signup")}
                              className="text-primary hover:underline font-semibold"
                            >
                              Sign Up now
                            </button>
                          </p>
                        </div>
                      </TabsContent>
                      
                      {/* Signup Tab */}
                      <TabsContent value="signup" className="mt-0">
                        <form onSubmit={handleSignup} className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                            <div className="relative group">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-name"
                                placeholder="Juan Dela Cruz"
                                className="pl-10 h-10 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all duration-300 text-sm"
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10 h-10 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all duration-300 text-sm"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-password"
                                type="password"
                                placeholder="Minimum 6 characters"
                                className="pl-10 h-10 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all duration-300 text-sm"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground">At least 6 characters</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signup-confirm" className="text-sm font-medium">Confirm Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-confirm"
                                type="password"
                                placeholder="Confirm your password"
                                className="pl-10 h-10 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all duration-300 text-sm"
                                value={signupConfirmPassword}
                                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full h-10 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                Create Account
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </form>
                        
                        <div className="mt-6 pt-4 text-center border-t border-muted-foreground/10">
                          <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <button
                              onClick={() => setActiveTab("login")}
                              className="text-primary hover:underline font-semibold"
                            >
                              Sign in here
                            </button>
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Demo Credentials */}
              <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Demo Access
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <p className="text-[10px] font-mono text-muted-foreground">user@example.com</p>
                  <p className="text-[10px] font-mono text-muted-foreground">user123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}