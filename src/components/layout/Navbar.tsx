"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Wallet,
  ShoppingBag,
  Leaf,
  LayoutDashboard,
  LogOut,
  Truck,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";
import { useAuth } from "@/providers/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [chainName, setChainName] = useState("");
  const { user, logout } = useAuth();

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getNetworkName = (chainId: number) => {
    if (chainId === 8453) return "Base";
    if (chainId === 84532) return "Base Sepolia";
    if (chainId === 1) return "Ethereum";
    return `Chain ${chainId}`;
  };

  const updateWalletState = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length === 0) {
        setIsConnected(false);
        setAddress("");
        setChainName("");
        return;
      }

      const signer = await provider.getSigner();
      const connectedAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setAddress(formatAddress(connectedAddress));
      setChainName(getNetworkName(chainId));
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to update wallet state:", error);
    }
  };

  const switchToBase = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }], // 8453 = Base mainnet
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2105",
                chainName: "Base",
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Base network:", addError);
        }
      } else {
        console.error("Failed to switch to Base:", switchError);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined") return;

    if (!window.ethereum) {
      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        alert(
          "No wallet detected. On mobile, open this site inside the MetaMask app browser or another wallet app browser."
        );
      } else {
        alert(
          "No wallet detected. Please install MetaMask or another EVM wallet extension."
        );
        window.open("https://metamask.io/download/", "_blank");
      }
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const connectedAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setAddress(formatAddress(connectedAddress));
      setChainName(getNetworkName(chainId));
      setIsConnected(true);

      if (chainId !== 8453) {
        await switchToBase();
        await updateWalletState();
      }
    } catch (error) {
      console.error("Wallet connect failed:", error);
      alert("Wallet connection failed. Check the console for details.");
    }
  };

  useEffect(() => {
    updateWalletState();

    if (!window.ethereum) return;

    const handleAccountsChanged = () => updateWalletState();
    const handleChainChanged = () => updateWalletState();

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const navLinks = [
    { name: "Marketplace", href: "/market", icon: ShoppingBag },
    { name: "My Orders", href: "/orders", icon: Package },
    { name: "My Investments", href: "/investments", icon: Wallet },
    { name: "Farmer Portal", href: "/farmer", icon: LayoutDashboard },
    ...(user ? [{ name: "Logistics Portal", href: "/logistics", icon: Truck }] : []),
    { name: "About Sibol", href: "/#about", icon: Leaf },
  ];

  const getAvatarInitials = () => {
    if (!user) return "?";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src="/sibolLogo.png"
                  alt="Sibol logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary font-headline">
                Sibol
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
            const isMyOrders = link.name === "My Orders";

            if (isMyOrders && !isConnected) {
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={connectWallet}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.name}
                </button>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            );
          })}

            <div className="flex items-center gap-3">
              <Button
                variant={isConnected ? "outline" : "default"}
                size="sm"
                onClick={connectWallet}
                className="gap-2"
              >
                <Wallet className="h-4 w-4" />
                {isConnected ? address : "Connect Wallet"}
              </Button>

              {isConnected && (
                <span className="text-xs text-muted-foreground">{chainName}</span>
              )}
            </div>

            {!user ? (
              <Link href="/auth">
                <Button size="sm">Sign Up</Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getAvatarInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <div className={cn("md:hidden border-t bg-background", isOpen ? "block" : "hidden")}>
        <div className="container mx-auto px-4 py-4 space-y-4">
          {navLinks.map((link) => {
          const isMyOrders = link.name === "My Orders";

          if (isMyOrders && !isConnected) {
            return (
              <button
                key={link.name}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  connectWallet();
                }}
                className="flex w-full items-center gap-3 text-base font-medium text-muted-foreground p-2 hover:bg-secondary rounded-md"
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </button>
            );
          }

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-muted-foreground p-2 hover:bg-secondary rounded-md"
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}

          {!user ? (
            <div className="space-y-2 pt-2 border-t">
              <Link href="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-center">
                  Login
                </Button>
              </Link>
              <Link href="/auth" onClick={() => setIsOpen(false)}>
                <Button className="w-full justify-center">Sign Up</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <span className="text-sm">{user.name}</span>
              </div>

              <Button
                className="w-full gap-2 justify-center"
                onClick={connectWallet}
              >
                <Wallet className="h-4 w-4" />
                {isConnected ? address : "Connect Wallet"}
              </Button>

              {isConnected && (
                <p className="text-center text-xs text-muted-foreground">{chainName}</p>
              )}

              <Button
                variant="outline"
                className="w-full gap-2 justify-center"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}