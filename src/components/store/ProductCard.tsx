import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { printifyService } from '../../services/printify';
import type { PrintifyProduct, ProductVariant } from '../../services/printify';
import { getCategory } from './categories';
import { getPrimaryImage, getVariantImage } from './imageSelection';

interface ProductCardProps {
  product: PrintifyProduct;
  onSelect: () => void;
  onAddToCart: (variant: ProductVariant) => void;
}

export function ProductCard({ product, onSelect, onAddToCart }: ProductCardProps) {
  const colorOption = product.options.find(
    (opt) => opt.type === 'color' || opt.name.toLowerCase().includes('color'),
  );
  const sizeOption = product.options.find(
    (opt) => opt.type === 'size' || opt.name.toLowerCase().includes('size'),
  );

  const [hoverImage, setHoverImage] = useState<string | null>(null);

  const colorVariants = useMemo(() => {
    if (!colorOption) return [];
    return colorOption.values
      .map((colorValue) => {
        const variantsForColor = product.variants.filter((v) =>
          v.options.includes(colorValue.id),
        );
        if (variantsForColor.length === 0) return null;
        const representative =
          variantsForColor.find((v) => v.is_default && v.is_available) ??
          variantsForColor.find((v) => v.is_available) ??
          variantsForColor[0];
        return {
          colorId: colorValue.id,
          title: colorValue.title,
          hexColors: colorValue.colors ?? [],
          image: getVariantImage(product, representative.id),
        };
      })
      .filter((cv): cv is NonNullable<typeof cv> => cv !== null);
  }, [colorOption, product]);

  const baseImage = getPrimaryImage(product);
  const currentImage = hoverImage ?? baseImage;

  const onColorEnter = useCallback((image: string | undefined) => {
    if (image) setHoverImage(image);
  }, []);
  const onColorLeave = useCallback(() => setHoverImage(null), []);

  const enabledVariants = product.variants.filter((v) => v.is_enabled);
  const prices = enabledVariants.length > 0 ? enabledVariants : product.variants;
  const lowest = Math.min(...prices.map((v) => v.price));
  const highest = Math.max(...prices.map((v) => v.price));
  const hasRange = lowest !== highest;

  const hasMultipleOptions =
    product.variants.length > 1 && (colorOption || sizeOption);

  const category = getCategory(product);

  const handlePrimaryAction = () => {
    if (hasMultipleOptions) {
      onSelect();
      return;
    }
    const firstAvailable =
      product.variants.find((v) => v.is_available) ?? product.variants[0];
    if (firstAvailable) {
      onAddToCart(firstAvailable);
    } else {
      onSelect();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      viewport={{ once: true }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 hover:border-steel-blue/40 hover:shadow-xl transition-all"
    >
      <button
        type="button"
        onClick={onSelect}
        className="relative block aspect-square overflow-hidden bg-slate-100"
        aria-label={`View ${product.title}`}
      >
        {currentImage && (
          <img
            src={currentImage}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-dark-steel/90 px-3 py-1 text-[11px] font-oswald uppercase tracking-wider text-white">
          {category}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <h3
          onClick={onSelect}
          className="mb-2 cursor-pointer font-bebas text-2xl leading-tight tracking-wide text-dark-steel line-clamp-2 transition-colors hover:text-steel-blue"
        >
          {product.title}
        </h3>

        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-steel-blue">
          Funds the Wings
        </p>

        {colorVariants.length > 1 ? (
          <div className="mb-4 flex items-center gap-2">
            {colorVariants.slice(0, 6).map((cv) => (
              <button
                key={cv.colorId}
                type="button"
                onMouseEnter={() => onColorEnter(cv.image)}
                onMouseLeave={onColorLeave}
                onFocus={() => onColorEnter(cv.image)}
                onBlur={onColorLeave}
                onClick={onSelect}
                title={cv.title}
                className="h-6 w-6 overflow-hidden rounded-full border border-slate-300 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-steel-blue"
              >
                {cv.hexColors.length === 1 ? (
                  <span
                    className="block h-full w-full"
                    style={{ backgroundColor: cv.hexColors[0] }}
                  />
                ) : cv.hexColors.length > 1 ? (
                  <span className="flex h-full w-full">
                    {cv.hexColors.slice(0, 2).map((hex, idx) => (
                      <span
                        key={idx}
                        className="flex-1"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </span>
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-slate-200 text-[10px] font-semibold uppercase text-slate-700">
                    {cv.title.slice(0, 2)}
                  </span>
                )}
              </button>
            ))}
            {colorVariants.length > 6 && (
              <span className="text-xs text-slate-500">
                +{colorVariants.length - 6}
              </span>
            )}
          </div>
        ) : sizeOption ? (
          <p className="mb-4 text-xs text-slate-500">
            {sizeOption.values.length} sizes available
          </p>
        ) : (
          <div className="mb-4 h-4" />
        )}

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="font-bebas text-3xl leading-none text-dark-steel">
              {hasRange
                ? `${printifyService.formatPrice(lowest)}–${printifyService.formatPrice(highest)}`
                : printifyService.formatPrice(lowest)}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="inline-flex items-center gap-2 rounded-full bg-dark-steel px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-steel-blue"
          >
            {hasMultipleOptions ? (
              'Choose'
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
