import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Plus, 
  Minus,
  Check, 
  Eye, 
  X, 
  Coins,
  ArrowRight
} from 'lucide-react';
import { BarberProduct, CurrencyCode } from '../types';
import { storeService } from '../services/store';
import { CURRENCIES, formatPriceBs } from '../services/currency';

interface ProductsSectionProps {
  onOpenCart: () => void;
  cartCount: number;
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onCartUpdated: () => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  onOpenCart,
  cartCount,
  selectedCurrency,
  onCurrencyChange,
  onCartUpdated,
}) => {
  const [products] = useState<BarberProduct[]>(storeService.getProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductDetails, setSelectedProductDetails] = useState<BarberProduct | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos (Hombre)' },
    { id: 'hair_cream', label: 'Crema de Cabello' },
    { id: 'beard_care', label: 'Barba & Bigote' },
    { id: 'body_care', label: 'Crema Corporal' },
    { id: 'shaving', label: 'Crema de Afeitar & After-Shave' },
    { id: 'shavers', label: 'Navajas & Máquinas' },
    { id: 'shampoo', label: 'Shampoos Hombre' },
    { id: 'combs', label: 'Peines & Cepillos' },
  ];

  const filteredProducts = products.filter((prod) => {
    const matchesCat =
      selectedCategory === 'all' ||
      prod.category === selectedCategory ||
      (selectedCategory === 'hair_cream' && prod.category === 'styling');
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (product: BarberProduct) => {
    storeService.addToCart(product, 1);
    onCartUpdated();
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1200);
  };

  const handleUpdateQty = (productId: string, nextQty: number) => {
    storeService.updateCartQuantity(productId, nextQty);
    onCartUpdated();
  };

  const cartItems = storeService.getCart();
  const cartTotalBs = storeService.getCartTotalBs();

  const getProductCartQty = (productId: string) => {
    return cartItems.find((item) => item.product.id === productId)?.quantity || 0;
  };

  return (
    <section id="productos" className="py-20 bg-[#060810] relative border-t border-cyan-500/20">
      
      {/* Background Cyber Glow */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Barbería Masculina • Precios en Bolivianos (Bs)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase font-tech tracking-tight">
              PRODUCTOS PARA <span className="text-cyan-400 glow-text-cyan">HOMBRE & BARBERÍA</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-2">
              Cremas para cabello masculino, cremas y óleos de barba, crema corporal para hombre, crema de afeitar, after-shave, navajas, hojas, shampoos y máquinas profesionales en Bolivianos (Bs).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Currency Converter Quick Selector */}
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl text-xs">
              <Coins className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-400 font-mono text-[11px]">Divisa:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-slate-950 text-cyan-300 font-mono font-bold border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-cyan-400"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Floating Cart Trigger Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center space-x-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] active:scale-95 shrink-0"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-slate-950" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white font-mono text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Ver Carrito ({cartCount})</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar crema, navaja, barba, shampoo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group rounded-2xl bg-[#090e1a] border border-cyan-500/20 hover:border-cyan-400 p-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Product Image & Badges */}
                <div className="relative rounded-xl overflow-hidden aspect-square mb-3 bg-slate-950 border border-slate-800">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a]/80 via-transparent to-transparent"></div>

                  {product.badge && (
                    <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                      {product.badge}
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="font-bold">{product.rating}</span>
                    <span className="text-slate-400">({product.reviewsCount})</span>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                    {product.volumeOrSpecs}
                  </div>
                </div>

                {/* Category & Title */}
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  {product.categoryName}
                </div>
                <h3 className="text-base font-black text-white font-tech mt-1 group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Price Display in Bolivianos (Bs) + Converted Currency */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-white font-tech">
                      {product.priceBs} <span className="text-cyan-400 text-lg">Bs</span>
                    </span>
                    {(() => {
                      const formatted = formatPriceBs(product.priceBs, selectedCurrency);
                      return formatted.secondary ? (
                        <span className="text-[11px] text-amber-300 font-mono block font-bold">
                          {formatted.secondary}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono block">Precio en Bolivianos</span>
                      );
                    })()}
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Stock: {product.stock} unids.
                  </span>
                </div>
              </div>

              {/* Action Buttons & Inline Cart Controls */}
              <div className="mt-4 pt-2 flex items-center space-x-2">
                <button
                  onClick={() => setSelectedProductDetails(product)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors"
                  title="Ver ficha técnica del producto"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                </button>

                {getProductCartQty(product.id) > 0 ? (
                  <div className="flex-1 flex items-center justify-between bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-1">
                    <button
                      onClick={() => handleUpdateQty(product.id, getProductCartQty(product.id) - 1)}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Reducir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onOpenCart}
                      className="text-xs font-mono font-bold text-emerald-300 hover:text-white px-2"
                      title="Abrir carrito"
                    >
                      {getProductCartQty(product.id)} en carrito
                    </button>
                    <button
                      onClick={() => handleUpdateQty(product.id, getProductCartQty(product.id) + 1)}
                      className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                      title="Agregar otro"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
                      addedProductId === product.id
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    }`}
                  >
                    {addedProductId === product.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Añadido!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Agregar al Carrito</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Live Store Cart Summary Banner */}
        {cartCount > 0 && (
          <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-[#090e1a] to-blue-950/80 border-2 border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase font-bold">
                  Carrito Activo • {cartCount} {cartCount === 1 ? 'producto agregado' : 'productos agregados'}
                </div>
                <div className="text-lg font-black text-white font-tech">
                  Total Acumulado: <span className="text-cyan-400">{cartTotalBs} Bs</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center space-x-2"
            >
              <span>Ver Carrito & Pagar con QR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Product Quick Detail Modal */}
        {selectedProductDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#090d18] border-2 border-cyan-500/50 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    {selectedProductDetails.categoryName}
                  </span>
                  <h4 className="text-xl font-black text-white font-tech mt-0.5">
                    {selectedProductDetails.name}
                  </h4>
                </div>
                <button 
                  onClick={() => setSelectedProductDetails(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img 
                  src={selectedProductDetails.imageUrl} 
                  alt={selectedProductDetails.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Presentación / Especificación:</span>
                  <span className="font-mono text-cyan-300 font-bold">{selectedProductDetails.volumeOrSpecs}</span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {selectedProductDetails.description}
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase">Características Principales:</div>
                  <ul className="space-y-1 text-slate-300 font-sans">
                    {selectedProductDetails.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <div className="text-2xl font-black text-white font-tech">
                    {selectedProductDetails.priceBs} <span className="text-cyan-400">Bs</span>
                  </div>
                  {(() => {
                    const formatted = formatPriceBs(selectedProductDetails.priceBs, selectedCurrency);
                    return (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatted.secondary ? formatted.secondary : 'Moneda nacional de Bolivia'}
                      </div>
                    );
                  })()}
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedProductDetails);
                    setSelectedProductDetails(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir al Carrito</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
