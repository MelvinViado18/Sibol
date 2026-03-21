export const WALLETS_STORAGE_KEY = "sibol_wallets";

type Wallet = {
  userId: string;
  name: string;
  balance: number;
};

function getWallets(): Wallet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WALLETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWallets(wallets: Wallet[]) {
  localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));

  window.dispatchEvent(
    new StorageEvent("storage", {
      key: WALLETS_STORAGE_KEY,
      newValue: JSON.stringify(wallets),
    })
  );
}

export function getWallet(userId: string, name: string): Wallet {
  const wallets = getWallets();

  let wallet = wallets.find((w) => w.userId === userId);

  if (!wallet) {
    wallet = {
      userId,
      name,
      balance: 10000, // 🔥 give demo money
    };

    wallets.push(wallet);
    saveWallets(wallets);
  }

  return wallet;
}

export function updateWalletBalance(userId: string, amount: number) {
  const wallets = getWallets();

  const updated = wallets.map((wallet) => {
    if (wallet.userId !== userId) return wallet;

    return {
      ...wallet,
      balance: wallet.balance + amount,
    };
  });

  saveWallets(updated);
}

export function setWalletBalance(userId: string, balance: number) {
  const wallets = getWallets();

  const updated = wallets.map((wallet) => {
    if (wallet.userId !== userId) return wallet;

    return {
      ...wallet,
      balance,
    };
  });

  saveWallets(updated);
}