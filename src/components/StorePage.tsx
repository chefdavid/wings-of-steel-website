import React, { useCallback, useState } from 'react';
import Navigation from './Navigation';
import { Store } from './Store';
import { Cart } from './Cart';
import { Checkout } from './Checkout';
import Footer from './Footer';
import { useCart } from '../hooks/useCart';

const StorePage: React.FC = () => {
  const [storeAvailable, setStoreAvailable] = useState(false);
  const { items, clearCart, setIsCartOpen } = useCart();

  const handleStoreAvailabilityChange = useCallback((available: boolean) => {
    setStoreAvailable(available);

    if (!available && items.length > 0) {
      clearCart();
      setIsCartOpen(false);
    }
  }, [clearCart, items.length, setIsCartOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-steel to-black">
      <Navigation />
      {storeAvailable && <Cart />}
      <div className="pt-20">
        <Store onAvailabilityChange={handleStoreAvailabilityChange} />
        {storeAvailable && <Checkout />}
        <Footer />
      </div>
    </div>
  );
};

export default StorePage;
