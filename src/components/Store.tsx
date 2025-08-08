import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { printifyService } from '../services/printify';
import type { PrintifyProduct, ProductVariant } from '../services/printify';
import { useCart } from '../hooks/useCart';
import { ShoppingCart, Search, Filter, X, ChevronDown, Heart, Star, Check } from 'lucide-react';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest' | 'oldest';

export function Store() {
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<PrintifyProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart, setIsCartOpen, getTotalItems } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await printifyService.getProducts(50); // Printify max is 50
      console.log('Fetched products:', fetchedProducts);
      
      // Ensure fetchedProducts is an array
      if (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
        // If products don't have a visible property, show all
        const visibleProducts = fetchedProducts.filter(p => p.visible !== false);
        console.log('Visible products:', visibleProducts);
        setProducts(visibleProducts);
      } else {
        console.log('No products fetched or invalid response');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  // Extract categories based on product titles
  const categories = useMemo(() => {
    const productTypes = new Set<string>();
    
    products.forEach(product => {
      const title = product.title.toLowerCase();
      
      // Identify product type from title
      if (title.includes('t-shirt') || title.includes('tshirt') || title.includes('tee')) {
        productTypes.add('T-Shirt');
      } else if (title.includes('hoodie') || title.includes('sweatshirt')) {
        productTypes.add('Hoodie');
      } else if (title.includes('mug') || title.includes('cup')) {
        productTypes.add('Mug');
      } else if (title.includes('hat') || title.includes('cap')) {
        productTypes.add('Hat');
      } else if (title.includes('tank')) {
        productTypes.add('Tank Top');
      } else if (title.includes('long sleeve')) {
        productTypes.add('Long Sleeve');
      } else if (title.includes('sticker')) {
        productTypes.add('Sticker');
      } else if (title.includes('poster') || title.includes('print')) {
        productTypes.add('Poster');
      } else if (title.includes('bag') || title.includes('tote')) {
        productTypes.add('Bag');
      } else if (title.includes('bottle')) {
        productTypes.add('Water Bottle');
      } else if (title.includes('blanket')) {
        productTypes.add('Blanket');
      } else if (title.includes('jacket')) {
        productTypes.add('Jacket');
      }
    });
    
    const sortedTypes = Array.from(productTypes).sort();
    return ['all', ...sortedTypes];
  }, [products]);

  // Helper function to get product type
  const getProductType = (product: PrintifyProduct): string | null => {
    const title = product.title.toLowerCase();
    
    if (title.includes('t-shirt') || title.includes('tshirt') || title.includes('tee')) {
      return 'T-Shirt';
    } else if (title.includes('hoodie') || title.includes('sweatshirt')) {
      return 'Hoodie';
    } else if (title.includes('mug') || title.includes('cup')) {
      return 'Mug';
    } else if (title.includes('hat') || title.includes('cap')) {
      return 'Hat';
    } else if (title.includes('tank')) {
      return 'Tank Top';
    } else if (title.includes('long sleeve')) {
      return 'Long Sleeve';
    } else if (title.includes('sticker')) {
      return 'Sticker';
    } else if (title.includes('poster') || title.includes('print')) {
      return 'Poster';
    } else if (title.includes('bag') || title.includes('tote')) {
      return 'Bag';
    } else if (title.includes('bottle')) {
      return 'Water Bottle';
    } else if (title.includes('blanket')) {
      return 'Blanket';
    } else if (title.includes('jacket')) {
      return 'Jacket';
    }
    return null;
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => getProductType(p) === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0);
        case 'price-desc':
          return (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, selectedCategory, searchQuery, sortBy]);


  return (
    <section id="store" className="py-20 px-6 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-7xl font-bebas text-gray-900 mb-4">
            Team Store
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Premium merchandise to support Wings of Steel.
            Every purchase helps make sled hockey accessible to all.
          </p>
        </motion.div>

        {/* Cart Button */}
        <div className="fixed top-24 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-gray-900 p-4 rounded-2xl shadow-2xl hover:bg-gray-800 hover:scale-110 transition-all relative"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-steel-blue text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 placeholder-gray-400 rounded-2xl shadow-sm border border-gray-200 focus:border-steel-blue focus:shadow-md outline-none transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white text-gray-900 px-6 py-4 pr-12 rounded-2xl shadow-sm border border-gray-200 focus:border-steel-blue focus:shadow-md outline-none cursor-pointer font-medium transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 bg-steel-gray/20 backdrop-blur-sm text-white px-4 py-3 rounded-lg border border-steel-gray/30 hover:bg-steel-gray/30 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters {categories.length > 1 && `(${categories.length - 1})`}
            </button>
          </div>

          {/* Category Filters - Desktop */}
          <div className="hidden md:flex flex-wrap gap-3">
            {categories.map(category => {
              const count = category === 'all' ? products.length : products.filter(p => getProductType(p) === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Products' : category}
                  <span className="ml-2 text-sm opacity-70">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Filters - Mobile */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden flex flex-wrap gap-2"
            >
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowFilters(false);
                  }}
                  className={`px-4 py-2 rounded-full font-oswald transition-all ${
                    selectedCategory === category
                      ? 'bg-steel-blue text-white'
                      : 'bg-steel-gray/20 text-steel-gray hover:bg-steel-gray/30 hover:text-white'
                  }`}
                >
                  {category === 'all' ? 'All Products' : category}
                  {category === 'all' && ` (${products.length})`}
                  {category !== 'all' && ` (${products.filter(p => getProductType(p) === category).length})`}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-8 text-gray-600 font-medium">
            Showing <span className="text-gray-900 font-bold">{filteredAndSortedProducts.length}</span> of {products.length} products
            {searchQuery && <span className="text-gray-900"> for "{searchQuery}"</span>}
            {selectedCategory !== 'all' && <span className="text-gray-900"> in {selectedCategory}</span>}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-steel-blue border-t-transparent"></div>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center text-steel-gray py-12">
            <p className="text-xl">No products found.</p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 text-steel-blue hover:text-ice-blue transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProducts.map((product) => {
              const lowestPrice = Math.min(...product.variants.map(v => v.price));
              const highestPrice = Math.max(...product.variants.map(v => v.price));
              const hasMultiplePrices = lowestPrice !== highestPrice;
              
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={() => setSelectedProduct(product)}
                  onAddToCart={(variant) => {
                    addToCart(product, variant);
                    setIsCartOpen(true);
                  }}
                  getProductType={getProductType}
                />
              );
            })}
          </div>
        )}

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            getProductType={getProductType}
          />
        )}
      </div>
    </section>
  );
}

function ProductCard({ product, onSelect, onAddToCart, getProductType }: {
  product: PrintifyProduct;
  onSelect: () => void;
  onAddToCart: (variant: ProductVariant) => void;
  getProductType: (product: PrintifyProduct) => string | null;
}) {
  const [hoveredColorId, setHoveredColorId] = useState<number | null>(null);
  const [currentImageSrc, setCurrentImageSrc] = useState(product.images[0]?.src || '');
  
  // Find color and size options
  const colorOption = product.options.find(opt => 
    opt.type === 'color' || opt.name.toLowerCase().includes('color')
  );
  const sizeOption = product.options.find(opt => 
    opt.type === 'size' || opt.name.toLowerCase().includes('size')
  );
  
  // Check if product has multiple variants that need selection
  const hasMultipleOptions = product.variants.length > 1 && (colorOption || sizeOption);
  
  // Get unique colors with their associated images
  const colorVariants = useMemo(() => {
    if (!colorOption) return [];
    
    return colorOption.values.map(colorValue => {
      // Find variants with this color
      const variantsWithColor = product.variants.filter(v => 
        v.options.includes(colorValue.id)
      );
      
      // Find the FIRST available variant with this color (preferring default size if available)
      const representativeVariant = variantsWithColor.find(v => v.is_default && v.is_available) || 
                                   variantsWithColor.find(v => v.is_available) ||
                                   variantsWithColor[0];
      
      // Find image specifically for this variant
      let variantImage = null;
      if (representativeVariant) {
        variantImage = product.images.find(img => 
          img.variant_ids.includes(representativeVariant.id)
        );
      }
      
      // If no specific image found, try to find any image for this color's variants
      if (!variantImage) {
        variantImage = product.images.find(img => 
          variantsWithColor.some(v => img.variant_ids.includes(v.id))
        );
      }
      
      return {
        colorId: colorValue.id,
        title: colorValue.title,
        hexColors: colorValue.colors || [],
        image: variantImage?.src || product.images[0]?.src,
        variants: variantsWithColor,
        representativeVariantId: representativeVariant?.id
      };
    }).filter(cv => cv.variants.length > 0); // Only show colors with available variants
  }, [product, colorOption]);
  
  const handleColorHover = useCallback((colorId: number) => {
    setHoveredColorId(colorId);
    const colorVariant = colorVariants.find(cv => cv.colorId === colorId);
    if (colorVariant?.image) {
      setCurrentImageSrc(colorVariant.image);
    }
  }, [colorVariants]);
  
  const handleColorLeave = useCallback(() => {
    setHoveredColorId(null);
    setCurrentImageSrc(product.images[0]?.src || '');
  }, [product.images]);
  
  const lowestPrice = Math.min(...product.variants.map(v => v.price));
  const highestPrice = Math.max(...product.variants.map(v => v.price));
  const hasMultiplePrices = lowestPrice !== highestPrice;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
    >
      <div className="relative flex-shrink-0">
        {currentImageSrc && (
          <div 
            className="relative overflow-hidden bg-gray-100 cursor-pointer"
            onClick={onSelect}
          >
            <img
              src={currentImageSrc}
              alt={product.title}
              className="w-full h-80 object-cover group-hover:scale-105 transition-all duration-500"
            />
            {/* Favorite button */}
            <button
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                // Add to favorites logic here
              }}
            >
              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
            </button>
            
            {/* Product type badge */}
            {getProductType(product) && (
              <div className="absolute top-4 left-4">
                <span className="bg-gray-900/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {getProductType(product)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col h-full">
        {/* Title - fixed height */}
        <h3 
          className="text-gray-900 font-bold text-xl mb-3 line-clamp-2 cursor-pointer hover:text-steel-blue transition-colors min-h-[3.5rem]"
          onClick={onSelect}
        >
          {product.title}
        </h3>
        
        {/* Color swatches - fixed height container */}
        <div className="mb-4 min-h-[4rem]">
          {colorVariants.length > 1 ? (
            <>
              <p className="text-sm text-gray-600 mb-2">Available Colors:</p>
              <div className="flex gap-2 items-center">
                {colorVariants.slice(0, 5).map((colorVariant) => (
                  <div
                    key={colorVariant.colorId}
                    onMouseEnter={() => handleColorHover(colorVariant.colorId)}
                    onMouseLeave={handleColorLeave}
                    className="relative group/color"
                    title={colorVariant.title}
                  >
                    {colorVariant.hexColors.length > 0 ? (
                      <div className="flex">
                        {colorVariant.hexColors.length === 1 ? (
                          <div
                            className={`w-7 h-7 rounded-full border-2 ${
                              hoveredColorId === colorVariant.colorId ? 'border-steel-blue shadow-md' : 'border-gray-300'
                            } transition-all`}
                            style={{ backgroundColor: colorVariant.hexColors[0] }}
                          />
                        ) : (
                          <div className={`w-7 h-7 rounded-full border-2 ${
                            hoveredColorId === colorVariant.colorId ? 'border-steel-blue shadow-md' : 'border-gray-300'
                          } overflow-hidden transition-all`}>
                            <div className="flex h-full">
                              {colorVariant.hexColors.slice(0, 2).map((hex, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-7 h-7 rounded-full border-2 ${
                        hoveredColorId === colorVariant.colorId ? 'border-steel-blue shadow-md' : 'border-gray-300'
                      } bg-gray-200 flex items-center justify-center text-xs font-medium transition-all`}>
                        {colorVariant.title.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {colorVariants.length > 5 && (
                  <button
                    onClick={onSelect}
                    className="text-sm text-steel-blue hover:text-ice-blue font-medium transition-colors"
                  >
                    +{colorVariants.length - 5} more
                  </button>
                )}
              </div>
            </>
          ) : colorVariants.length === 1 ? (
            <>
              <p className="text-sm text-gray-600 mb-2">Color:</p>
              <p className="text-sm text-gray-800 font-medium">{colorVariants[0].title}</p>
            </>
          ) : (
            <div className="text-sm text-gray-500">Single Option</div>
          )}
        </div>
        
        {/* Rating - consistent placement */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-gray-500 text-sm">(4.8)</span>
        </div>
        
        {/* Options indicator - fixed height */}
        <div className="mb-4 min-h-[1.5rem]">
          {sizeOption && (
            <p className="text-sm text-gray-500">
              {sizeOption.values.length} sizes available
            </p>
          )}
          {!sizeOption && hasMultipleOptions && (
            <p className="text-sm text-gray-500">
              {product.variants.length} options available
            </p>
          )}
        </div>
        
        {/* Spacer to push price and button to bottom */}
        <div className="flex-grow"></div>
        
        {/* Price - consistent placement */}
        <div className="mb-4">
          {hasMultiplePrices ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {printifyService.formatPrice(lowestPrice)}
              </span>
              <span className="text-gray-500">-</span>
              <span className="text-2xl font-bold text-gray-900">
                {printifyService.formatPrice(highestPrice)}
              </span>
            </div>
          ) : (
            <span className="text-3xl font-bold text-gray-900">
              {printifyService.formatPrice(lowestPrice)}
            </span>
          )}
        </div>
        
        {/* Add to cart button - consistent placement */}
        <button
          onClick={() => {
            // Always open modal for products with multiple options
            // Only add directly to cart for single variant products
            if (hasMultipleOptions || product.variants.length > 1) {
              onSelect();
            } else if (product.variants[0] && product.variants[0].is_available) {
              onAddToCart(product.variants[0]);
            } else {
              onSelect();
            }
          }}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-medium hover:bg-gray-800 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          {hasMultipleOptions ? (
            <>
              <span>Select Options</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function ProductModal({ product, onClose, getProductType }: {
  product: PrintifyProduct;
  onClose: () => void;
  getProductType: (product: PrintifyProduct) => string | null;
}) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find(v => v.is_default) || product.variants[0]
  );
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, setIsCartOpen } = useCart();
  
  // Find color and size options
  const colorOption = product.options.find(opt => 
    opt.type === 'color' || opt.name.toLowerCase().includes('color')
  );
  const sizeOption = product.options.find(opt => 
    opt.type === 'size' || opt.name.toLowerCase().includes('size')
  );
  
  // Initialize selected color and size
  useEffect(() => {
    if (selectedVariant && colorOption) {
      const colorId = selectedVariant.options.find(optId => 
        colorOption.values.some(v => v.id === optId)
      );
      if (colorId) setSelectedColorId(colorId);
    }
    if (selectedVariant && sizeOption) {
      const sizeId = selectedVariant.options.find(optId => 
        sizeOption.values.some(v => v.id === optId)
      );
      if (sizeId) setSelectedSizeId(sizeId);
    }
  }, [selectedVariant, colorOption, sizeOption]);
  
  // Get image for current selection
  const currentImage = useMemo(() => {
    if (selectedVariant) {
      // First try to find an image specifically for this variant
      const variantImage = product.images.find(img => 
        img.variant_ids.includes(selectedVariant.id)
      );
      if (variantImage) return variantImage.src;
      
      // If no specific image, try to find an image for any variant with the same color
      if (selectedColorId && colorOption) {
        const variantsWithSameColor = product.variants.filter(v => 
          v.options.includes(selectedColorId)
        );
        const colorImage = product.images.find(img => 
          variantsWithSameColor.some(v => img.variant_ids.includes(v.id))
        );
        if (colorImage) return colorImage.src;
      }
    }
    
    // Default to first image or default image
    const defaultImage = product.images.find(img => img.is_default);
    return defaultImage?.src || product.images[0]?.src || '';
  }, [selectedVariant, selectedColorId, product.images, product.variants, colorOption]);
  
  // Handle color selection
  const handleColorSelect = (colorId: number) => {
    setSelectedColorId(colorId);
    
    // Find variant with this color and current size (if applicable)
    const newVariant = product.variants.find(v => {
      const hasColor = v.options.includes(colorId);
      const hasSize = !selectedSizeId || v.options.includes(selectedSizeId);
      return hasColor && hasSize && v.is_available;
    });
    
    if (newVariant) {
      setSelectedVariant(newVariant);
    }
  };
  
  // Handle size selection
  const handleSizeSelect = (sizeId: number) => {
    setSelectedSizeId(sizeId);
    
    // Find variant with this size and current color (if applicable)
    const newVariant = product.variants.find(v => {
      const hasSize = v.options.includes(sizeId);
      const hasColor = !selectedColorId || v.options.includes(selectedColorId);
      return hasSize && hasColor && v.is_available;
    });
    
    if (newVariant) {
      setSelectedVariant(newVariant);
    }
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

  // Parse HTML description safely
  const parseDescription = (html: string) => {
    // Remove dangerous tags and attributes but keep basic formatting
    const cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
    
    // Convert to plain text with line breaks
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleaned;
    return tempDiv.innerText || tempDiv.textContent || '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gray-900 border border-steel-gray/40 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900 border-b border-steel-gray/40 p-4 flex justify-between items-center">
          <h2 className="text-3xl font-bebas text-white">{product.title}</h2>
          <button
            onClick={onClose}
            className="text-steel-gray hover:text-white transition-colors p-2 hover:bg-steel-gray/20 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            {currentImage && (
              <img
                src={currentImage}
                alt={product.title}
                className="w-full rounded-lg mb-4 bg-white"
              />
            )}
            {product.images.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 uppercase">More Views</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => {
                    // Find which color this image represents
                    const imageVariants = product.variants.filter(v => 
                      image.variant_ids.includes(v.id)
                    );
                    
                    // Get color for this image if applicable
                    let imageColorName = '';
                    if (colorOption && imageVariants.length > 0) {
                      const colorId = imageVariants[0].options.find(optId => 
                        colorOption.values.some(v => v.id === optId)
                      );
                      const color = colorOption.values.find(v => v.id === colorId);
                      imageColorName = color?.title || '';
                    }
                    
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={image.src}
                          alt={imageColorName || `View ${index + 1}`}
                          className={`w-20 h-20 object-cover rounded cursor-pointer bg-white transition-all ${
                            currentImage === image.src ? 'ring-2 ring-steel-blue scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                          onClick={() => {
                            // Find first available variant for this image
                            const variant = product.variants.find(v => 
                              image.variant_ids.includes(v.id) && v.is_available
                            ) || product.variants.find(v => 
                              image.variant_ids.includes(v.id)
                            );
                            if (variant) setSelectedVariant(variant);
                          }}
                        />
                        {imageColorName && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 rounded-b opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {imageColorName}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-6 p-4 bg-black/30 rounded-lg">
              <h3 className="text-ice-blue font-oswald text-sm uppercase mb-2">Description</h3>
              <p className="text-white whitespace-pre-wrap leading-relaxed">
                {parseDescription(product.description)}
              </p>
            </div>

            {getProductType(product) && (
              <div className="mb-6">
                <span className="text-ice-blue font-oswald text-sm uppercase">Product Type:</span>
                <div className="mt-2">
                  <span className="bg-steel-blue/20 text-ice-blue border border-steel-blue/40 text-sm px-3 py-1 rounded-full">
                    {getProductType(product)}
                  </span>
                </div>
              </div>
            )}

            {/* Color Selection */}
            {colorOption && (
              <div className="mb-6">
                <label className="text-ice-blue font-oswald block mb-3 uppercase text-sm">
                  Select Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOption.values.map((colorValue) => {
                    const isSelected = selectedColorId === colorValue.id;
                    const hasAvailableVariants = product.variants.some(v => 
                      v.options.includes(colorValue.id) && v.is_available
                    );
                    
                    return (
                      <button
                        key={colorValue.id}
                        onClick={() => handleColorSelect(colorValue.id)}
                        disabled={!hasAvailableVariants}
                        className={`relative group transition-all ${
                          !hasAvailableVariants ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title={colorValue.title}
                      >
                        {colorValue.colors && colorValue.colors.length > 0 ? (
                          <div className={`relative ${isSelected ? 'scale-110' : ''} transition-transform`}>
                            {colorValue.colors.length === 1 ? (
                              <div
                                className={`w-12 h-12 rounded-lg border-2 ${
                                  isSelected ? 'border-steel-blue shadow-lg' : 'border-gray-600 hover:border-gray-400'
                                } transition-all`}
                                style={{ backgroundColor: colorValue.colors[0] }}
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded-lg border-2 ${
                                isSelected ? 'border-steel-blue shadow-lg' : 'border-gray-600 hover:border-gray-400'
                              } overflow-hidden transition-all`}>
                                <div className="flex h-full">
                                  {colorValue.colors.slice(0, 2).map((hex, idx) => (
                                    <div
                                      key={idx}
                                      className="flex-1"
                                      style={{ backgroundColor: hex }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {isSelected && (
                              <Check className="absolute -top-1 -right-1 w-5 h-5 text-white bg-steel-blue rounded-full p-0.5" />
                            )}
                          </div>
                        ) : (
                          <div className={`relative ${isSelected ? 'scale-110' : ''} transition-transform`}>
                            <div className={`w-12 h-12 rounded-lg border-2 ${
                              isSelected ? 'border-steel-blue shadow-lg bg-gray-700' : 'border-gray-600 bg-gray-800 hover:border-gray-400'
                            } flex items-center justify-center text-xs font-medium text-white transition-all`}>
                              {colorValue.title.substring(0, 3).toUpperCase()}
                            </div>
                            {isSelected && (
                              <Check className="absolute -top-1 -right-1 w-5 h-5 text-white bg-steel-blue rounded-full p-0.5" />
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1 text-center truncate">
                          {colorValue.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Size Selection */}
            {sizeOption && (
              <div className="mb-6">
                <label className="text-ice-blue font-oswald block mb-3 uppercase text-sm">
                  Select Size
                </label>
                <div className="flex gap-2 flex-wrap">
                  {sizeOption.values.map((sizeValue) => {
                    const isSelected = selectedSizeId === sizeValue.id;
                    const hasAvailableVariants = product.variants.some(v => 
                      v.options.includes(sizeValue.id) && v.is_available
                    );
                    
                    return (
                      <button
                        key={sizeValue.id}
                        onClick={() => handleSizeSelect(sizeValue.id)}
                        disabled={!hasAvailableVariants}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                          isSelected 
                            ? 'border-steel-blue bg-steel-blue/20 text-white' 
                            : 'border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
                        } ${!hasAvailableVariants ? 'opacity-50 cursor-not-allowed line-through' : ''}`}
                      >
                        {sizeValue.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Other options (if any) */}
            {product.options
              .filter(opt => 
                opt !== colorOption && opt !== sizeOption
              )
              .map((option) => (
                <div key={option.name} className="mb-4">
                  <label className="text-ice-blue font-oswald block mb-2 uppercase text-sm">
                    {option.name}
                  </label>
                  <select
                    className="w-full bg-black/50 text-white p-3 rounded border border-steel-gray/40 focus:border-steel-blue focus:bg-black/70 outline-none transition-all"
                    onChange={(e) => {
                      const valueId = parseInt(e.target.value);
                      const newVariant = product.variants.find(v => 
                        v.options.includes(valueId) && v.is_available
                      );
                      if (newVariant) setSelectedVariant(newVariant);
                    }}
                    value={selectedVariant?.options.find(optId => 
                      option.values.some(v => v.id === optId)
                    )}
                  >
                    {option.values.map((value) => {
                      const hasAvailableVariants = product.variants.some(v => 
                        v.options.includes(value.id) && v.is_available
                      );
                      return (
                        <option 
                          key={value.id} 
                          value={value.id}
                          disabled={!hasAvailableVariants}
                        >
                          {value.title} {!hasAvailableVariants && '(Out of Stock)'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ))}

            <div className="mb-6">
              <label className="text-ice-blue font-oswald block mb-2 uppercase text-sm">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded bg-black/50 text-white hover:bg-steel-blue/20 border border-steel-gray/40 transition-all font-bold text-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-black/50 text-white text-center p-2 rounded border border-steel-gray/40 focus:border-steel-blue outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded bg-black/50 text-white hover:bg-steel-blue/20 border border-steel-gray/40 transition-all font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 p-4 bg-black/30 rounded-lg">
              <div>
                <span className="text-steel-gray text-sm block">Total Price</span>
                <span className="text-3xl font-bold text-white">
                  {selectedVariant && printifyService.formatPrice(selectedVariant.price * quantity)}
                </span>
              </div>
              {selectedVariant && !selectedVariant.is_available && (
                <span className="text-red-400 font-semibold">Out of Stock</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.is_available}
              className="w-full bg-steel-blue text-white py-4 rounded-lg font-oswald text-lg hover:bg-ice-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}