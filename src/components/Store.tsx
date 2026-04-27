import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Search,
  ShoppingCart,
  Trophy,
  Heart,
  Truck,
} from 'lucide-react';
import { printifyService } from '../services/printify';
import type { PrintifyProduct, ProductVariant } from '../services/printify';
import { useCart } from '../hooks/useCart';
import { ProductCard } from './store/ProductCard';
import { ProductModal } from './store/ProductModal';
import { buildCategoryBuckets, getCategory } from './store/categories';
import { getPrimaryImage } from './store/imageSelection';

type SortOption =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
  'price-asc': 'Price low → high',
  'price-desc': 'Price high → low',
};

interface StoreProps {
  onAvailabilityChange?: (available: boolean) => void;
}

function getLowestPrice(product: PrintifyProduct): number {
  const enabled = product.variants.filter((v) => v.is_enabled);
  const pool = enabled.length > 0 ? enabled : product.variants;
  return Math.min(...pool.map((v) => v.price));
}

function StoreHero({
  featured,
  loading,
  onShop,
  onSelectFeatured,
}: {
  featured: PrintifyProduct | null;
  loading: boolean;
  onShop: () => void;
  onSelectFeatured: () => void;
}) {
  const featuredImage = featured ? getPrimaryImage(featured) : null;
  const featuredPrice = featured ? getLowestPrice(featured) : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-ice-blue/10 px-4 pt-20 pb-12 sm:px-6 md:pt-32 md:pb-24">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-steel-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-ice-blue/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-12">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-steel-blue/10 px-3 py-1.5 text-[11px] font-display font-bold uppercase tracking-[0.18em] text-steel-blue sm:px-4 sm:py-2 sm:text-xs">
            <Trophy className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Official team gear · </span>2026 season
          </p>
          <h1 className="font-display font-bold uppercase leading-[0.85] text-dark-steel">
            <span className="block text-2xl tracking-[0.2em] text-slate-500 sm:text-3xl md:text-4xl">
              Rep the
            </span>
            <span className="block text-6xl tracking-tight sm:text-7xl md:text-[8rem] lg:text-[10rem]">
              Wings.
            </span>
            <span className="mt-2 block text-4xl tracking-tight text-steel-blue sm:text-5xl md:text-7xl">
              Fund the ice.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-slate-600 sm:text-lg">
            Official Wings of Steel gear. Every order helps keep sled hockey
            free for kids — no child pays to play.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onShop}
              className="inline-flex items-center gap-2 rounded-full bg-dark-steel px-6 py-3 text-sm font-oswald uppercase tracking-wider text-white transition-colors hover:bg-steel-blue"
            >
              Shop the store
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 rounded-full border-2 border-dark-steel px-6 py-3 text-sm font-oswald uppercase tracking-wider text-dark-steel transition-colors hover:bg-dark-steel hover:text-white"
            >
              <Heart className="h-4 w-4" />
              Or donate directly
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -rotate-3 rounded-3xl bg-steel-blue" aria-hidden />
          {loading || !featured || !featuredImage ? (
            <div className="relative aspect-[4/5] w-full animate-pulse rounded-3xl bg-slate-200 shadow-2xl" />
          ) : (
            <button
              type="button"
              onClick={onSelectFeatured}
              className="relative block aspect-[4/5] w-full overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
              aria-label={`View ${featured.title}`}
            >
              <img
                src={featuredImage}
                alt={featured.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-steel/95 via-dark-steel/60 to-transparent p-6 text-left">
                <p className="mb-1 text-[11px] font-display font-bold uppercase tracking-[0.18em] text-ice-blue">
                  Featured drop
                </p>
                <p className="font-display text-xl font-bold uppercase leading-tight tracking-tight text-white sm:text-2xl">
                  {featured.title}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-2xl font-bold text-white">
                    {featuredPrice !== null
                      ? `From ${printifyService.formatPrice(featuredPrice)}`
                      : ''}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-oswald uppercase tracking-wider text-ice-blue">
                    Shop this drop <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ImpactBar() {
  return (
    <section className="bg-dark-steel py-6 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center md:flex-row md:justify-between md:text-left">
        <p className="font-bebas text-2xl tracking-wide md:text-3xl">
          100% of proceeds support the team.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm font-oswald uppercase tracking-wider text-ice-blue md:gap-10">
          <span className="inline-flex items-center gap-2">
            <Truck className="h-4 w-4" /> Equipment
          </span>
          <span>Ice time</span>
          <span>Travel</span>
          <span>Tournaments</span>
        </div>
      </div>
    </section>
  );
}

function CategoryTiles({
  buckets,
  selected,
  onSelect,
}: {
  buckets: { name: string; count: number }[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  if (buckets.length <= 1) return null;
  return (
    <section className="bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-bebas text-4xl tracking-wide text-dark-steel md:text-5xl">
            Shop by category
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {buckets.map((bucket) => {
            const isActive = selected === bucket.name;
            return (
              <button
                key={bucket.name}
                type="button"
                onClick={() => onSelect(bucket.name)}
                className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all ${
                  isActive
                    ? 'border-steel-blue bg-white shadow-lg'
                    : 'border-slate-200 bg-white hover:border-steel-blue/40 hover:shadow-md'
                }`}
              >
                <p className="font-bebas text-3xl tracking-wide text-dark-steel">
                  {bucket.name}
                </p>
                <p className="mt-1 text-xs font-oswald uppercase tracking-wider text-slate-500">
                  {bucket.count} {bucket.count === 1 ? 'item' : 'items'}
                </p>
                <ArrowRight
                  className={`absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-transform ${
                    isActive ? 'text-steel-blue translate-x-0' : 'text-slate-400 group-hover:translate-x-1'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-square animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="flex gap-1.5 pt-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-5 w-5 animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
        <div className="flex items-end justify-between pt-3">
          <div className="h-7 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-9 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function MissionFooterBand() {
  return (
    <section className="relative overflow-hidden bg-dark-steel px-6 py-20 text-white">
      <div className="absolute inset-0 opacity-30">
        <img
          src="/images/hero champion.jpg"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          aria-hidden
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-dark-steel via-dark-steel/85 to-transparent" />
      <div className="relative mx-auto max-w-7xl">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-oswald uppercase tracking-[0.18em] text-ice-blue">
          The mission
        </p>
        <h2 className="max-w-3xl font-bebas text-5xl leading-[1] tracking-wide md:text-7xl">
          No child pays to play.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-slate-200">
          Sled hockey gear, ice time, tournament travel — none of it is cheap.
          Every shirt, every hoodie, every mug puts a kid back on the ice.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-oswald text-sm uppercase tracking-wider text-dark-steel transition-colors hover:bg-ice-blue hover:text-dark-steel"
          >
            <Heart className="h-4 w-4" />
            Donate
          </Link>
          <Link
            to="/join-team"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-6 py-3 font-oswald text-sm uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-dark-steel"
          >
            Join the team
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Store({ onAvailabilityChange }: StoreProps = {}) {
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] =
    useState<PrintifyProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { addToCart, setIsCartOpen, getTotalItems } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const fetched = await printifyService.getProducts(50);
        if (cancelled) return;
        const visible = Array.isArray(fetched)
          ? fetched.filter((p) => p.visible !== false)
          : [];
        setProducts(visible);
      } catch (err) {
        console.error('Failed to load Printify products:', err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading) onAvailabilityChange?.(products.length > 0);
  }, [loading, products.length, onAvailabilityChange]);

  const buckets = useMemo(() => buildCategoryBuckets(products), [products]);
  const categoryButtons = useMemo(
    () => [
      { name: 'All', count: products.length },
      ...buckets.map((b) => ({ name: b.name, count: b.count })),
    ],
    [buckets, products.length],
  );

  const filtered = useMemo(() => {
    let pool = products;
    if (selectedCategory !== 'All') {
      pool = pool.filter((p) => getCategory(p) === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
      );
    }
    return [...pool].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return getLowestPrice(a) - getLowestPrice(b);
        case 'price-desc':
          return getLowestPrice(b) - getLowestPrice(a);
        case 'oldest':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case 'newest':
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const featured = useMemo(() => {
    if (products.length === 0) return null;
    return [...products].sort((a, b) => getLowestPrice(b) - getLowestPrice(a))[0];
  }, [products]);

  const handleAddToCart = (product: PrintifyProduct, variant: ProductVariant) => {
    addToCart(product, variant);
    setIsCartOpen(true);
  };

  const scrollToGrid = () => {
    document.getElementById('store-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!loading && products.length === 0) {
    return (
      <div className="bg-white">
        <StoreHero
          featured={null}
          loading={false}
          onShop={scrollToGrid}
          onSelectFeatured={() => undefined}
        />
        <ImpactBar />
        <section className="px-6 py-24 text-center">
          <h2 className="font-bebas text-4xl tracking-wide text-dark-steel">
            New gear is on the way.
          </h2>
          <p className="mt-4 text-slate-600">
            The Printify catalog is empty right now — check back soon, or
            support the team directly.
          </p>
          <Link
            to="/donate"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-dark-steel px-6 py-3 font-oswald text-sm uppercase tracking-wider text-white transition-colors hover:bg-steel-blue"
          >
            <Heart className="h-4 w-4" />
            Donate
          </Link>
        </section>
        <MissionFooterBand />
      </div>
    );
  }

  return (
    <div className="bg-white text-dark-steel">
      <StoreHero
        featured={featured}
        loading={loading}
        onShop={scrollToGrid}
        onSelectFeatured={() => featured && setSelectedProduct(featured)}
      />
      <ImpactBar />

      <CategoryTiles
        buckets={categoryButtons}
        selected={selectedCategory}
        onSelect={(name) => {
          setSelectedCategory(name);
          scrollToGrid();
        }}
      />

      <section id="store-grid" className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-bebas text-4xl tracking-wide text-dark-steel md:text-5xl">
                The full collection
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {loading
                  ? 'Loading the lineup…'
                  : `${filtered.length} of ${products.length} ${
                      products.length === 1 ? 'item' : 'items'
                    }`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gear"
                  className="w-full rounded-full border-2 border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-dark-steel placeholder-slate-400 focus:border-steel-blue focus:outline-none sm:w-64"
                />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none rounded-full border-2 border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-dark-steel focus:border-steel-blue focus:outline-none"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <option key={key} value={key}>
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters((s) => !s)}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-dark-steel md:hidden"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <aside
              className={`md:sticky md:top-24 md:self-start ${
                showMobileFilters ? 'block' : 'hidden md:block'
              }`}
            >
              <p className="mb-3 text-xs font-oswald uppercase tracking-wider text-slate-500">
                Categories
              </p>
              <div className="flex flex-wrap gap-2 md:flex-col md:gap-1">
                {categoryButtons.map((cat) => {
                  const active = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setShowMobileFilters(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-full px-4 py-2 text-sm transition-colors md:rounded-lg md:px-3 ${
                        active
                          ? 'bg-dark-steel text-white'
                          : 'bg-white text-dark-steel hover:bg-slate-100 md:bg-transparent'
                      }`}
                    >
                      <span className="font-medium">{cat.name}</span>
                      <span
                        className={`ml-3 text-xs ${
                          active ? 'text-ice-blue' : 'text-slate-400'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div>
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
                  <p className="font-bebas text-2xl text-dark-steel">
                    No matches found.
                  </p>
                  {(searchQuery || selectedCategory !== 'All') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="mt-4 text-sm font-semibold text-steel-blue hover:text-dark-steel"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={() => setSelectedProduct(product)}
                      onAddToCart={(variant) => handleAddToCart(product, variant)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <MissionFooterBand />

      {/* Floating cart button */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-dark-steel px-5 py-3 text-sm font-semibold text-white shadow-2xl transition-transform hover:scale-105 hover:bg-steel-blue"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="hidden sm:inline">Cart</span>
        {getTotalItems() > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ice-blue text-xs font-bold text-dark-steel">
            {getTotalItems()}
          </span>
        )}
      </button>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
