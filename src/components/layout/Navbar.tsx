"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Wallet, ShoppingBag, Leaf, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [chainName, setChainName] = useState("");

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("No Web3 wallet found. Install MetaMask to connect.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const connectedAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const networkName = chainId === 8453 ? "Base" : chainId === 1 ? "Ethereum" : `Chain ${chainId}`;

      setAddress(`${connectedAddress.substring(0, 6)}...${connectedAddress.slice(-4)}`);
      setChainName(networkName);
      setIsConnected(true);

      if (chainId !== 8453 && chainId !== 1) {
        alert(`Connected to ${networkName} (${network.chainId}). For Base switch network to chainId 8453.`);
      }
    } catch (error) {
      console.error("Wallet connect failed", error);
      alert("Wallet connection failed. Check console for details.");
    }
  };

  const navLinks = [
    { name: "Marketplace", href: "/market", icon: ShoppingBag },
    { name: "Farmer Portal", href: "/farmer", icon: LayoutDashboard },
    { name: "About Sibol", href: "/#about", icon: Leaf },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary font-headline">SibolMarket</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
            <Button
              variant={isConnected ? "outline" : "default"}
              size="sm"
              onClick={connectWallet}
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              {isConnected ? address : "Connect Wallet"}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn("md:hidden border-t bg-background", isOpen ? "block" : "hidden")}>
        <div className="container mx-auto px-4 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-muted-foreground p-2 hover:bg-secondary rounded-md"
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          ))}
          <Button className="w-full gap-2 justify-center" onClick={connectWallet}>
            <Wallet className="h-4 w-4" />
            {isConnected ? address : "Connect Wallet"}
          </Button>
        </div>
      </div>
    </nav>
  );
}