import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { printifyService } from '../services/printify';

export function Cart() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={() => setIsCartOpen(false)}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-dark-steel shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-steel-gray/30">
              <h2 className="text-2xl font-bebas text-white flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Shopping Cart
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-steel-gray hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <ShoppingBag className="w-24 h-24 text-steel-gray/30 mb-4" />
                <p className="text-steel-gray text-lg">Your cart is empty</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 bg-steel-blue text-white px-6 py-2 rounded hover:bg-ice-blue transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.variant.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 mb-6 pb-6 border-b border-steel-gray/30 last:border-0"
                    >
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0].src}
                          alt={item.product.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-oswald text-white mb-1">
                          {item.product.title}
                        </h3>
                        <p className="text-steel-gray text-sm mb-2">
                          {item.variant.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant.id,
                                item.quantity - 1
                              )
                            }
                            className="w-8 h-8 rounded bg-steel-gray/20 text-white hover:bg-steel-gray/40 transition-colors flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant.id,
                                item.quantity + 1
                              )
                            }
                            className="w-8 h-8 rounded bg-steel-gray/20 text-white hover:bg-steel-gray/40 transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-ice-blue font-bold">
                          {printifyService.formatPrice(item.variant.price * item.quantity)}
                        </p>
                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.variant.id)
                          }
                          className="text-red-500 text-sm hover:text-red-400 transition-colors mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-steel-gray/30 p-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-white font-oswald text-lg">Total:</span>
                    <span className="text-ice-blue font-bold text-xl">
                      {printifyService.formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      window.location.hash = '#checkout';
                    }}
                    className="w-full bg-steel-blue text-white py-3 rounded font-oswald hover:bg-ice-blue transition-colors mb-2"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full text-steel-gray hover:text-white transition-colors text-sm"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}