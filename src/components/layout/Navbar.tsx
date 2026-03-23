'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Wallet, ShoppingBag, Leaf, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const handleConnect = () => {
    // Try the injected connector first (MetaMask, Coinbase, etc.)
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else if (connectors[0]) {
      // Fallback to first available connector
      connect({ connector: connectors[0] });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const navLinks = [
    { name: 'Marketplace', href: '/market', icon: ShoppingBag },
    { name: 'Farmer Portal', href: '/farmer', icon: LayoutDashboard },
    { name: 'About Sibol', href: '/#about', icon: Leaf },
    { name: 'My Orders', href: '/orders', icon: ShoppingBag }, // example
  ];

  const formattedAddress = address
    ? `${address.substring(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
                {/* Use next/image, make sure you have the image in public folder */}
                <img
                  src="/sibolLogo.png"
                  alt="Sibol logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary font-headline">
                SibolMarket
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              // If "My Orders" and not connected, show a button that triggers connect
              if (link.name === 'My Orders' && !isConnected) {
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
            {isConnected ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  {formattedAddress}
                </Button>
                {chainId && chainId !== 8453 && chainId !== 1 && (
                  <span className="text-xs text-yellow-600">
                    (Switch to Base)
                  </span>
                )}
              </div>
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
            if (link.name === 'My Orders' && !isConnected) {
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
          {isConnected ? (
            <Button
              className="w-full gap-2 justify-center"
              variant="outline"
              onClick={handleDisconnect}
            >
              <Wallet className="h-4 w-4" />
              {formattedAddress}
            </Button>
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
          {error && <p className="text-xs text-red-500">{error.message}</p>}
        </div>
      </div>
    </nav>
  );
}