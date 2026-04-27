import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingCart, X } from 'lucide-react';
import { printifyService } from '../../services/printify';
import type { PrintifyProduct } from '../../services/printify';
import { useCart } from '../../hooks/useCart';
import { getCategory } from './categories';
import { getPrimaryImage, getVariantImage } from './imageSelection';

interface ProductModalProps {
  product: PrintifyProduct;
  onClose: () => void;
}

function parseDescription(html: string): string {
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleaned;
  return tempDiv.innerText || tempDiv.textContent || '';
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find((v) => v.is_default) ?? product.variants[0],
  );
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [imageOverride, setImageOverride] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const colorOption = product.options.find(
    (opt) => opt.type === 'color' || opt.name.toLowerCase().includes('color'),
  );
  const sizeOption = product.options.find(
    (opt) => opt.type === 'size' || opt.name.toLowerCase().includes('size'),
  );
  const otherOptions = product.options.filter(
    (opt) => opt !== colorOption && opt !== sizeOption,
  );

  useEffect(() => {
    if (selectedVariant && colorOption) {
      const colorId = selectedVariant.options.find((optId) =>
        colorOption.values.some((v) => v.id === optId),
      );
      if (colorId) setSelectedColorId(colorId);
    }
    if (selectedVariant && sizeOption) {
      const sizeId = selectedVariant.options.find((optId) =>
        sizeOption.values.some((v) => v.id === optId),
      );
      if (sizeId) setSelectedSizeId(sizeId);
    }
  }, [selectedVariant, colorOption, sizeOption]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const variantDrivenImage = useMemo(() => {
    // Color selection is the strongest signal for which mockup to show.
    // Prefer an image from any variant of the chosen color, even if the
    // current size isn't available in that color.
    if (selectedColorId) {
      const colorVariants = product.variants.filter((v) =>
        v.options.includes(selectedColorId),
      );
      // If the currently selected variant matches the chosen color, use it.
      if (
        selectedVariant &&
        colorVariants.some((v) => v.id === selectedVariant.id)
      ) {
        const img = getVariantImage(product, selectedVariant.id);
        if (img) return img;
      }
      // Otherwise pick the best representative variant for that color.
      const fallback =
        colorVariants.find((v) => v.is_available) ?? colorVariants[0];
      if (fallback) {
        const img = getVariantImage(product, fallback.id);
        if (img) return img;
      }
    }
    if (selectedVariant) {
      const direct = getVariantImage(product, selectedVariant.id);
      if (direct) return direct;
    }
    return getPrimaryImage(product);
  }, [selectedVariant, selectedColorId, product]);

  // Manual thumbnail clicks win over variant-driven inference. Variant changes
  // clear the override so picking a new color/size shows that variant's image.
  const currentImage = imageOverride ?? variantDrivenImage;

  const handleColorSelect = (colorId: number) => {
    setSelectedColorId(colorId);
    setImageOverride(null);
    // Always update selectedVariant to one matching the new color, falling
    // back through preferences. This guarantees the image swaps even when
    // the current size isn't available in the new color.
    const newVariant =
      product.variants.find(
        (v) =>
          v.options.includes(colorId) &&
          (!selectedSizeId || v.options.includes(selectedSizeId)) &&
          v.is_available,
      ) ??
      product.variants.find(
        (v) => v.options.includes(colorId) && v.is_available,
      ) ??
      product.variants.find((v) => v.options.includes(colorId));
    if (newVariant) setSelectedVariant(newVariant);
  };

  const handleSizeSelect = (sizeId: number) => {
    setSelectedSizeId(sizeId);
    setImageOverride(null);
    const newVariant = product.variants.find((v) => {
      const hasSize = v.options.includes(sizeId);
      const hasColor = !selectedColorId || v.options.includes(selectedColorId);
      return hasSize && hasColor && v.is_available;
    });
    if (newVariant) setSelectedVariant(newVariant);
  };

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.is_available) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product, selectedVariant);
      }
      setIsCartOpen(true);
      onClose();
    }
  };

  const description = useMemo(
    () => parseDescription(product.description ?? ''),
    [product.description],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-dark-steel/70 backdrop-blur-sm"
    >
      <div className="flex min-h-full items-start justify-center p-3 sm:items-center sm:p-6">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative my-4 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-oswald uppercase tracking-wider text-steel-blue">
              {getCategory(product)}
            </p>
            <h2 className="font-bebas text-2xl leading-tight tracking-wide text-dark-steel sm:text-3xl">
              {product.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-dark-steel"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
          <div>
            {currentImage && (
              <img
                src={currentImage}
                alt={product.title}
                className="mb-4 w-full rounded-xl bg-slate-100 object-cover"
              />
            )}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    type="button"
                    onClick={() => {
                      setImageOverride(image.src);
                      const variant = product.variants.find(
                        (v) =>
                          image.variant_ids.includes(v.id) && v.is_available,
                      );
                      if (variant) setSelectedVariant(variant);
                    }}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      currentImage === image.src
                        ? 'border-steel-blue'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={`View ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="font-bebas text-4xl leading-none text-dark-steel">
                {selectedVariant
                  ? printifyService.formatPrice(selectedVariant.price * quantity)
                  : ''}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-steel-blue">
                100% supports Wings of Steel
              </p>
            </div>

            {description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            )}

            {colorOption && (
              <div>
                <p className="mb-3 text-xs font-oswald uppercase tracking-wider text-dark-steel">
                  Color
                  {selectedColorId && colorOption.values.find(
                    (v) => v.id === selectedColorId,
                  ) && (
                    <span className="ml-2 text-slate-500 normal-case">
                      {colorOption.values.find((v) => v.id === selectedColorId)?.title}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {colorOption.values.map((colorValue) => {
                    const isSelected = selectedColorId === colorValue.id;
                    const hasAvailable = product.variants.some(
                      (v) => v.options.includes(colorValue.id) && v.is_available,
                    );
                    return (
                      <button
                        key={colorValue.id}
                        type="button"
                        title={colorValue.title}
                        disabled={!hasAvailable}
                        onClick={() => handleColorSelect(colorValue.id)}
                        className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-steel-blue scale-105 shadow-md'
                            : 'border-slate-200 hover:border-slate-400'
                        } ${!hasAvailable ? 'cursor-not-allowed opacity-40' : ''}`}
                      >
                        {colorValue.colors && colorValue.colors.length > 0 ? (
                          colorValue.colors.length === 1 ? (
                            <span
                              className="block h-full w-full"
                              style={{ backgroundColor: colorValue.colors[0] }}
                            />
                          ) : (
                            <span className="flex h-full w-full">
                              {colorValue.colors.slice(0, 2).map((hex, idx) => (
                                <span
                                  key={idx}
                                  className="flex-1"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-semibold uppercase text-slate-700">
                            {colorValue.title.slice(0, 3)}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-steel-blue p-0.5 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizeOption && (
              <div>
                <p className="mb-3 text-xs font-oswald uppercase tracking-wider text-dark-steel">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizeOption.values.map((sizeValue) => {
                    const isSelected = selectedSizeId === sizeValue.id;
                    const hasAvailable = product.variants.some(
                      (v) => v.options.includes(sizeValue.id) && v.is_available,
                    );
                    return (
                      <button
                        key={sizeValue.id}
                        type="button"
                        disabled={!hasAvailable}
                        onClick={() => handleSizeSelect(sizeValue.id)}
                        className={`min-w-[3rem] rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
                          isSelected
                            ? 'border-steel-blue bg-steel-blue text-white'
                            : 'border-slate-200 text-dark-steel hover:border-slate-400'
                        } ${
                          !hasAvailable
                            ? 'cursor-not-allowed line-through opacity-40'
                            : ''
                        }`}
                      >
                        {sizeValue.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {otherOptions.map((option) => (
              <div key={option.name}>
                <p className="mb-2 text-xs font-oswald uppercase tracking-wider text-dark-steel">
                  {option.name}
                </p>
                <select
                  className="w-full rounded-lg border-2 border-slate-200 bg-white p-3 text-dark-steel focus:border-steel-blue focus:outline-none"
                  value={
                    selectedVariant?.options.find((optId) =>
                      option.values.some((v) => v.id === optId),
                    ) ?? ''
                  }
                  onChange={(e) => {
                    const valueId = parseInt(e.target.value, 10);
                    const newVariant = product.variants.find(
                      (v) => v.options.includes(valueId) && v.is_available,
                    );
                    if (newVariant) setSelectedVariant(newVariant);
                  }}
                >
                  {option.values.map((value) => {
                    const hasAvailable = product.variants.some(
                      (v) => v.options.includes(value.id) && v.is_available,
                    );
                    return (
                      <option
                        key={value.id}
                        value={value.id}
                        disabled={!hasAvailable}
                      >
                        {value.title}
                        {!hasAvailable ? ' (Out of Stock)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            ))}

            <div>
              <p className="mb-2 text-xs font-oswald uppercase tracking-wider text-dark-steel">
                Quantity
              </p>
              <div className="inline-flex items-center rounded-lg border-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-lg font-semibold text-dark-steel hover:bg-slate-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-14 border-x border-slate-200 bg-white py-2 text-center text-dark-steel focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-lg font-semibold text-dark-steel hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            {selectedVariant && !selectedVariant.is_available && (
              <p className="text-sm font-semibold text-red-500">
                Currently out of stock
              </p>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedVariant?.is_available}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-dark-steel py-4 font-oswald text-base uppercase tracking-wider text-white transition-colors hover:bg-steel-blue disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to cart
            </button>
          </div>
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
}
