import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./authContext";

export type CartItem = {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  imgUrl: string;
  category?: string[];
  quantity: number;
};

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const GUEST_STORAGE_KEY = "dustedbooks-cart-guest";

const getStorageKey = (userId?: string) =>
  userId ? `dustedbooks-cart-${userId}` : GUEST_STORAGE_KEY;

const readCart = (key: string): CartItem[] => {
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      // Guests keep a cart too, under a shared guest key
      setCartItems(readCart(GUEST_STORAGE_KEY));
      setIsLoaded(true);
      return;
    }

    // On login, merge any guest cart into the user's cart
    const userCart = readCart(getStorageKey(user.id));
    const guestCart = readCart(GUEST_STORAGE_KEY);
    const merged = [
      ...userCart,
      ...guestCart.filter(
        (guestItem) => !userCart.some((item) => item._id === guestItem._id),
      ),
    ];

    if (guestCart.length > 0) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(merged));
    }

    setCartItems(merged);
    setIsLoaded(true);
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(getStorageKey(user?.id), JSON.stringify(cartItems));
  }, [cartItems, user, isLoaded]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const exists = prev.some((cartItem) => cartItem._id === item._id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, addToCart, removeFromCart, clearCart, isLoaded }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
