import React, { createContext, useState, useEffect } from 'react';
import type { CartItem, ProductVariant, PrintifyProduct } from '../services/printify';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: PrintifyProduct, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: number) => void;
  updateQuantity: (productId: string, variantId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('wingsCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('wingsCart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: PrintifyProduct, variant: ProductVariant, quantity = 1) => {
    setItems(current => {
      const existingItem = current.find(
        item => item.product.id === product.id && item.variant.id === variant.id
      );

      if (existingItem) {
        return current.map(item =>
          item.product.id === product.id && item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { product, variant, quantity }];
    });
  };

  const removeFromCart = (productId: string, variantId: number) => {
    setItems(current =>
      current.filter(
        item => !(item.product.id === productId && item.variant.id === variantId)
      )
    );
  };

  const updateQuantity = (productId: string, variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems(current =>
      current.map(item =>
        item.product.id === productId && item.variant.id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.variant.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

