import React from 'react';
import Navigation from './Navigation';
import { Store } from './Store';
import { Cart } from './Cart';
import { Checkout } from './Checkout';
import Footer from './Footer';

const StorePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-steel to-black">
      <Navigation />
      <Cart />
      <div className="pt-20">
        <Store />
        <Checkout />
        <Footer />
      </div>
    </div>
  );
};

export default StorePage;