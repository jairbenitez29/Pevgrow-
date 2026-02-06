'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  combinationId?: number;
  reference?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: number, combinationId?: number) => void;
  updateQuantity: (productId: number, quantity: number, combinationId?: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pevgrow_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        i => i.productId === item.productId && i.combinationId === item.combinationId
      );

      if (existingItemIndex > -1) {
        // Item ya existe, actualizar cantidad
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        // Nuevo item
        return [...currentItems, { ...item, quantity }];
      }
    });
  };

  const removeFromCart = (productId: number, combinationId?: number) => {
    setItems(currentItems =>
      currentItems.filter(
        item => !(item.productId === productId && item.combinationId === combinationId)
      )
    );
  };

  const updateQuantity = (productId: number, quantity: number, combinationId?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, combinationId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.productId === productId && item.combinationId === combinationId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = (): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const total = getCartTotal();

  const value: CartContextType = {
    items,
    itemCount,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
