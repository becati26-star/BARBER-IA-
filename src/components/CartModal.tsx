import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  QrCode, 
  CreditCard, 
  Truck, 
  Store, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Coins,
  AlertCircle,
  ArrowLeftRight
} from 'lucide-react';
import { CartItem, ProductOrder, ClientProfile, CurrencyCode } from '../types';
import { storeService } from '../services/store';
import { CURRENCIES, convertFromBs, convertToBs } from '../services/currency';
import { PaymentQRCode } from './PaymentQRCode';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClient?: ClientProfile | null;
  onCartUpdated?: () => void;
  selectedCurrency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  activeClient,
  onCartUpdated,
  selectedCurrency: externalCurrency = 'BOB',
  onCurrencyChange,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [cartItems, setCartItems] = useState<CartItem[]>(storeService.getCart());
  const [currency, setCurrency] = useState<CurrencyCode>(externalCurrency);
  const [foreignInput, setForeignInput] = useState<string>('10');

  // Checkout inputs
  const [clientName, setClientName] = useState<string>(activeClient?.name || '');
  const [clientPhone, setClientPhone] = useState<string>(activeClient?.phone || '');
  const [clientEmail, setClientEmail] = useState<string>(activeClient?.email || '');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup_barberia' | 'delivery_express'>('pickup_barberia');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'qr_simple' | 'card' | 'cash_on_pickup'>('qr_simple');
  const [selectedBank, setSelectedBank] = useState<string>('SIMPLE');
  const [qrReference, setQrReference] = useState<string>(`BARBER-${Date.now().toString(36).toUpperCase().slice(-6)}`);
  const [qrConfirmed, setQrConfirmed] = useState<boolean>(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ProductOrder | null>(null);

  useEffect(() => {
    setCurrency(externalCurrency);
  }, [externalCurrency]);

  useEffect(() => {
    if (isOpen) {
      setCartItems(storeService.getCart());
      setFormError(null);
      setQrConfirmed(false);
      setQrReference(`BARBER-${Date.now().toString(36).toUpperCase().slice(-6)}`);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeClient) {
      setClientName(activeClient.name);
      setClientPhone(activeClient.phone);
      setClientEmail(activeClient.email);
    }
  }, [activeClient]);

  const refreshCart = () => {
    setCartItems(storeService.getCart());
    if (onCartUpdated) onCartUpdated();
  };

  const handleCurrencySelect = (next: CurrencyCode) => {
    setCurrency(next);
    if (onCurrencyChange) onCurrencyChange(next);
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    storeService.updateCartQuantity(productId, newQty);
    refreshCart();
  };

  const handleRemoveItem = (productId: string) => {
    storeService.removeFromCart(productId);
    refreshCart();
  };

  const handleClearCart = () => {
    storeService.clearCart();
    refreshCart();
  };

  const subtotalBs = cartItems.reduce((acc, item) => acc + item.product.priceBs * item.quantity, 0);
  const deliveryCostBs = deliveryMethod === 'delivery_express' ? 15 : 0;
  const totalBs = subtotalBs + deliveryCostBs;

  const activeCurrencyConfig = CURRENCIES[currency];
  const convertedTotal = convertFromBs(totalBs, currency);
  const convertedSubtotal = convertFromBs(subtotalBs, currency);
  const numericForeign = parseFloat(foreignInput) || 0;
  const convertedInputToBs = convertToBs(numericForeign, currency === 'BOB' ? 'USD' : currency);

  const handleProcessOrder = () => {
    setFormError(null);
    if (!clientName.trim() || !clientPhone.trim()) {
      setFormError('Por favor ingresa tu nombre completo y número de WhatsApp o celular.');
      return;
    }
    if (deliveryMethod === 'delivery_express' && !deliveryAddress.trim()) {
      setFormError('Por favor ingresa la dirección completa en Bolivia para el envío express.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const order = storeService.createProductOrder({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || 'cliente@barberia.bo',
        clientPhone: clientPhone.trim(),
        items: cartItems,
        totalBs,
        currencyUsed: currency,
        exchangeRate: activeCurrencyConfig.rateToBs,
        paymentMethod,
        qrReference: paymentMethod === 'qr_simple' ? qrReference : undefined,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery_express' ? deliveryAddress.trim() : undefined,
        status: 'confirmed',
      });

      setConfirmedOrder(order);
      setIsProcessing(false);
      setStep('confirmed');
      refreshCart();
    }, 1100);
  };

  const handleCloseAndReset = () => {
    setStep('cart');
    setConfirmedOrder(null);
    setFormError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090d18] border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white uppercase font-tech">
                  {step === 'cart' && 'Carrito de Compras Persistente'}
                  {step === 'checkout' && 'Finalizar Compra & Pago QR'}
                  {step === 'confirmed' && '¡Pedido Procesado con Éxito!'}
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded font-mono font-bold">
                  Bs (Bolivia)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {step === 'cart' && `${cartItems.reduce((s, i) => s + i.quantity, 0)} unidades guardadas • Conversor de divisas a Bs`}
                {step === 'checkout' && 'Genera tu código QR Simple Bolivia o elige método de pago'}
                {step === 'confirmed' && 'Comprobante y detalles de entrega generados'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseAndReset}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          
          {/* View 1: Cart Items & Currency Converter */}
          {step === 'cart' && (
            <div className="space-y-5">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">Tu carrito de productos está vacío</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Agrega shampoos, cremas para cabello y barba, peines o afeitadoras; tu selección queda guardada automáticamente.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-3 px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Explorar Productos en Bs
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-mono text-cyan-400">{item.product.categoryName}</div>
                          <h4 className="font-bold text-white text-xs truncate font-tech">{item.product.name}</h4>
                          <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                            {item.product.priceBs} Bs c/u • <span className="text-slate-500">{item.product.volumeOrSpecs}</span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-400 hover:text-white rounded"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold text-white px-1.5">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-400 hover:text-white rounded"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right shrink-0">
                          <div className="font-bold text-white font-tech text-sm">
                            {item.product.priceBs * item.quantity} <span className="text-cyan-400 text-xs">Bs</span>
                          </div>
                          {currency !== 'BOB' && (
                            <div className="text-[10px] font-mono text-amber-300">
                              ≈ {activeCurrencyConfig.symbol} {convertFromBs(item.product.priceBs * item.quantity, currency)}
                            </div>
                          )}
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="text-[10px] text-red-400 hover:text-red-300 mt-0.5 flex items-center gap-1 justify-end ml-auto"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Quitar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Currency Converter to Bolivianos (Bs) */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                        <Coins className="w-4 h-4" />
                        Conversor de Divisas a Bolivianos (Bs)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        1 {currency === 'BOB' ? 'USD' : currency} = {CURRENCIES[currency === 'BOB' ? 'USD' : currency].rateToBs} Bs
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {Object.values(CURRENCIES).map((cfg) => (
                        <button
                          key={cfg.code}
                          type="button"
                          onClick={() => handleCurrencySelect(cfg.code)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                            currency === cfg.code
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500/40'
                          }`}
                        >
                          {cfg.flag} {cfg.code} ({cfg.symbol})
                        </button>
                      ))}
                    </div>

                    {/* Quick Foreign Amount -> Bs Calculator */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
                      <div className="sm:col-span-5 flex items-center gap-2">
                        <span className="text-slate-400 shrink-0">
                          {currency === 'BOB' ? 'USD:' : `${currency}:`}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={foreignInput}
                          onChange={(e) => setForeignInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="sm:col-span-2 flex justify-center text-cyan-400">
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <div className="sm:col-span-5 flex items-center justify-between bg-cyan-950/40 border border-cyan-500/30 rounded px-2.5 py-1">
                        <span className="text-slate-400">Equivale a:</span>
                        <span className="text-cyan-300 font-bold">{convertedInputToBs} Bs</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary in Bs */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal Productos (Bs):</span>
                      <span className="text-white font-bold">{subtotalBs} Bs</span>
                    </div>
                    {currency !== 'BOB' && (
                      <div className="flex justify-between text-amber-300">
                        <span>Equivalente en {activeCurrencyConfig.name}:</span>
                        <span className="font-bold">
                          {activeCurrencyConfig.symbol} {convertedSubtotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })} {currency}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Moneda de Liquidación QR:</span>
                      <span className="text-cyan-400 font-bold">Bolivianos (BOB / Bs)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="text-white font-bold text-sm">Total a Pagar:</span>
                      <span className="text-2xl font-black text-cyan-400 font-tech">{subtotalBs} Bs</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={handleClearCart}
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Vaciar Carrito
                    </button>

                    <button
                      onClick={() => setStep('checkout')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center space-x-2"
                    >
                      <span>Pagar por QR o Tarjeta ({subtotalBs} Bs)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* View 2: Checkout Form & Real Scannable Bolivian QR */}
          {step === 'checkout' && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Delivery Method Choice */}
              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  1. Método de Entrega
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup_barberia')}
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs font-bold transition-all ${
                      deliveryMethod === 'pickup_barberia'
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Store className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="text-left">
                      <div>Recoger en Barbería</div>
                      <span className="text-[10px] text-emerald-400 font-mono">Gratis</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery_express')}
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs font-bold transition-all ${
                      deliveryMethod === 'delivery_express'
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="text-left">
                      <div>Envío Express a Domicilio</div>
                      <span className="text-[10px] text-cyan-300 font-mono">+15 Bs</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Delivery Address if Express chosen */}
              {deliveryMethod === 'delivery_express' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                    Dirección de Envío (Ciudad, Zona y Calle en Bolivia)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Zona Sopocachi, Av. 20 de Octubre #1420, La Paz"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Contact Data */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  2. Datos del Comprador
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tu Nombre Completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="tel"
                    placeholder="Celular / WhatsApp (+591)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Payment Methods in Bolivia */}
              <div>
                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  3. Método de Pago (Bolivia)
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr_simple')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                      paymentMethod === 'qr_simple'
                        ? 'bg-cyan-950 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-cyan-400 mb-1" />
                    <span>Pago QR Simple</span>
                    <span className="text-[9px] text-emerald-400 font-mono">QR Escaneable</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-cyan-950 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-slate-200 mb-1" />
                    <span>Tarjeta Débito/Crédito</span>
                    <span className="text-[9px] text-slate-400 font-mono">Visa / Mastercard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_pickup')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                      paymentMethod === 'cash_on_pickup'
                        ? 'bg-cyan-950 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Store className="w-5 h-5 text-amber-400 mb-1" />
                    <span>Efectivo al Recoger</span>
                    <span className="text-[9px] text-slate-400 font-mono">En caja Barbería</span>
                  </button>
                </div>
              </div>

              {/* Real Scannable QR Code Generator */}
              {paymentMethod === 'qr_simple' && (
                <PaymentQRCode
                  amountBs={totalBs}
                  concept="TIENDA BARBER IA"
                  reference={qrReference}
                  selectedBank={selectedBank}
                  onBankChange={setSelectedBank}
                  qrConfirmed={qrConfirmed}
                  onSimulateScanConfirm={() => setQrConfirmed(true)}
                />
              )}

              {/* Total Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400">Total a Pagar:</div>
                  <div className="text-[11px] text-cyan-400 font-mono">
                    {deliveryMethod === 'delivery_express' ? 'Productos + Envío Express' : 'Productos (Retiro en tienda)'}
                  </div>
                  {currency !== 'BOB' && (
                    <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                      Ref: {activeCurrencyConfig.symbol} {convertedTotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })} ({currency})
                    </div>
                  )}
                </div>
                <div className="text-2xl font-black text-white font-tech">
                  {totalBs} <span className="text-cyan-400">Bs</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold hover:text-white flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Carrito</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcessOrder}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando Orden...' : `Confirmar Pedido (${totalBs} Bs)`}
                </button>
              </div>

            </div>
          )}

          {/* View 3: Order Confirmation */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="p-6 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-3 py-1 rounded-full font-bold uppercase">
                  ¡Pedido Confirmado en BARBER IA!
                </span>
                <h3 className="text-2xl font-black text-white font-tech mt-3">
                  Orden #{confirmedOrder.id}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  Tu compra ha sido procesada y liquidada en Bolivianos (Bs).
                </p>
              </div>

              {/* Order Receipt Details */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-left font-mono text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Cliente:</span>
                  <span className="text-white font-bold">{confirmedOrder.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contacto:</span>
                  <span className="text-cyan-300">{confirmedOrder.clientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Método de Pago:</span>
                  <span className="text-emerald-400 font-bold">
                    {confirmedOrder.paymentMethod === 'qr_simple' ? 'QR Simple Bolivia' : confirmedOrder.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo al recoger'}
                  </span>
                </div>
                {confirmedOrder.qrReference && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Referencia QR:</span>
                    <span className="text-cyan-300">{confirmedOrder.qrReference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Entrega:</span>
                  <span className="text-white">
                    {confirmedOrder.deliveryMethod === 'pickup_barberia' ? 'Retiro en Barbería' : 'Envío Express a Domicilio'}
                  </span>
                </div>
                {confirmedOrder.deliveryAddress && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded">
                    <strong>Dirección:</strong> {confirmedOrder.deliveryAddress}
                  </div>
                )}
                
                {/* Items breakdown */}
                <div className="py-2 border-t border-b border-slate-800/80 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">Productos Comprados:</span>
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span className="text-cyan-400 font-bold">{item.product.priceBs * item.quantity} Bs</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-slate-400 font-bold">Total Pagado:</span>
                  <span className="text-xl font-black text-cyan-400 font-tech">{confirmedOrder.totalBs} Bs</span>
                </div>
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={handleCloseAndReset}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Volver a la Barbería
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
