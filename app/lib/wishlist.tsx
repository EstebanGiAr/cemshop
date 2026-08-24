import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type {Image, MoneyV2} from '@shopify/hydrogen/storefront-api-types';

const STORAGE_KEY = 'cemshop:wishlist';

export type WishlistItem = {
  id: string;
  handle: string;
  title: string;
  vendor?: string | null;
  image?: Pick<Image, 'url' | 'altText' | 'width' | 'height'> | null;
  price: Pick<MoneyV2, 'amount' | 'currencyCode'>;
};

type WishlistContextValue = {
  items: WishlistItem[];
  has: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({children}: {children: ReactNode}) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as WishlistItem[]);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const has = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((p) => p.id === item.id)
        ? prev.filter((p) => p.id !== item.id)
        : [...prev, item],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <WishlistContext.Provider value={{items, has, toggle, remove}}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
