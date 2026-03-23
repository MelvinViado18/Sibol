'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Menu,
  X,
  Wallet,
  ShoppingBag,
  Leaf,
  LayoutDashboard,
  Package,
  Truck,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useAuth } from '@/providers/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { user, logout } = useAuth();

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getNetworkName = (chainId: number) => {
    if (chainId === 8453) return 'Base';
    if (chainId === 84532) return 'Base Sepolia';
    if (chainId === 1) return 'Ethereum';
    return `Chain ${chainId}`;
  };

  const handleConnect = () => {
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  const handleDisconnect = () => disconnect();

  const handleSwitchToBase = async () => {
    try {
      await switchChain({ chainId: 8453 });
    } catch (error) {
      console.error('Failed to switch to Base:', error);
    }
  };

  // Complete navLinks with all items (including the new ones)
  const navLinks = [
    { name: 'Marketplace', href: '/market', icon: ShoppingBag },
    { name: 'My Orders', href: '/orders', icon: Package },
    { name: 'My Investments', href: '/investments', icon: Wallet },
    { name: 'Farmer Portal', href: '/farmer', icon: LayoutDashboard },
    ...(user ? [{ name: 'Logistics Portal', href: '/logistics', icon: Truck }] : []),
    { name: 'About Sibol', href: '/#about', icon: Leaf },
  ];

  const getAvatarInitials = () => {
    if (!user) return '?';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formattedAddress = address ? formatAddress(address) : '';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              // For wallet‑dependent links (My Orders, My Investments) we show a connect button when not connected
              const requiresWallet = link.name === 'My Orders' || link.name === 'My Investments';
              if (requiresWallet && !isConnected) {
                return (
                  <button
                    key={link.name}
                    type="button"
                    onClick={handleConnect}
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

            {/* Wallet Connection */}
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    {formattedAddress}
                  </Button>
                  {chainId && chainId !== 8453 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSwitchToBase}
                      className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                    >
                      Switch to Base
                    </Button>
                  )}
                  {chainId && (
                    <span className="text-xs text-muted-foreground">
                      {getNetworkName(chainId)}
                    </span>
                  )}
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleConnect}
                  disabled={isPending}
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  {isPending ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
              {error && <p className="text-xs text-red-500">{error.message}</p>}
            </div>

            {/* User Authentication */}
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
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={cn('md:hidden border-t bg-background', isOpen ? 'block' : 'hidden')}>
        <div className="container mx-auto px-4 py-4 space-y-4">
          {navLinks.map((link) => {
            const requiresWallet = link.name === 'My Orders' || link.name === 'My Investments';
            if (requiresWallet && !isConnected) {
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    handleConnect();
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

          {/* Mobile Wallet Connection */}
          {isConnected ? (
            <>
              <Button
                className="w-full gap-2 justify-center"
                variant="outline"
                onClick={handleDisconnect}
              >
                <Wallet className="h-4 w-4" />
                {formattedAddress}
              </Button>
              {chainId && chainId !== 8453 && (
                <Button
                  className="w-full gap-2 justify-center"
                  variant="outline"
                  onClick={handleSwitchToBase}
                >
                  Switch to Base
                </Button>
              )}
              {chainId && (
                <p className="text-center text-xs text-muted-foreground">
                  {getNetworkName(chainId)}
                </p>
              )}
            </>
          ) : (
            <Button
              className="w-full gap-2 justify-center"
              onClick={handleConnect}
              disabled={isPending}
            >
              <Wallet className="h-4 w-4" />
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
          {error && <p className="text-xs text-red-500 text-center">{error.message}</p>}

          {/* Mobile User Authentication */}
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