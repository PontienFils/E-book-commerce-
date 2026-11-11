import React, { useState } from 'react';
import { 
  X, Trash2, ShoppingBag, ArrowRight, Smartphone, 
  CreditCard, ShieldCheck, Truck, AlertCircle, FileText
} from 'lucide-react';
import type { CartItem, PaymentMethod, User } from '../types.ts';
import { MobileMoneySimulatorModal } from './MobileMoneySimulatorModal.tsx';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalCdf: number;
  totalUsd: number;
  currentUser: User | null;
  onUpdateQuantity: (bookId: string, format: 'digital' | 'physical', quantity: number) => void;
  onRemoveItem: (bookId: string, format?: 'digital' | 'physical') => void;
  onCheckoutSuccess: (orderData: { paymentMethod: PaymentMethod; paymentPhone: string; shippingCity: string; shippingAddress: string }) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  totalCdf,
  totalUsd,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutSuccess,
  onOpenAuth
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '+243 81 234 5678');
  const [shippingCity, setShippingCity] = useState(currentUser?.city || 'Kinshasa (Gombe)');
  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || 'Boulevard du 30 Juin');
  const [showUssdModal, setShowUssdModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with currentUser changes
  React.useEffect(() => {
    if (currentUser?.phone) setPhoneNumber(currentUser.phone);
    if (currentUser?.city) setShippingCity(currentUser.city);
    if (currentUser?.address) setShippingAddress(currentUser.address);
  }, [currentUser]);

  if (!isOpen) return null;

  const hasPhysical = items.some(i => i.format === 'physical');
  const hasDigital = items.some(i => i.format === 'digital');

  const handleStartCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    setShowUssdModal(true);
  };

  const handleUssdConfirmed = () => {
    setShowUssdModal(false);
    onCheckoutSuccess({
      paymentMethod,
      paymentPhone: phoneNumber,
      shippingCity,
      shippingAddress
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 dark:border-stone-800 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête du tiroir panier */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-800 dark:text-amber-400" />
            <h2 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
              Votre Panier ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <ShoppingBag className="w-12 h-12 mx-auto stroke-1 mb-3 text-stone-300 dark:text-stone-600" />
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Votre panier est actuellement vide.</p>
              <p className="text-xs text-stone-400 mt-1">Découvrez les chefs-d'œuvre de notre catalogue congolais.</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-amber-900 text-white text-xs font-semibold rounded-lg hover:bg-amber-800 transition-colors"
              >
                Parcourir les livres
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div 
                  key={`${item.bookId}-${item.format}`}
                  className="flex gap-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-800"
                >
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-20 object-cover rounded-lg shadow-sm shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.bookId, item.format)}
                          className="text-stone-400 hover:text-red-500 p-0.5"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {item.authorName}
                      </p>
                      <div className="mt-1">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded">
                          {item.format === 'digital' ? 'Numérique (E-Book)' : 'Physique (Relié)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                      {/* Contrôle de quantité (1 seul pour numérique) */}
                      {item.format === 'digital' ? (
                        <span className="text-[11px] text-stone-400 italic">
                          1 licence numérique
                        </span>
                      ) : (
                        <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded bg-white dark:bg-stone-900 text-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.bookId, item.format, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.bookId, item.format, item.quantity + 1)}
                            className="px-2 py-0.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 font-bold"
                          >
                            +
                          </button>
                        </div>
                      )}

                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-900 dark:text-amber-400 font-mono tabular-nums">
                          {(item.priceCdf * item.quantity).toLocaleString('fr-FR')} CDF
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Formulaire de paiement congolais */}
              <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
                
                {/* Information livraison physique si applicable */}
                {hasPhysical && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                      <Truck className="w-4 h-4" />
                      <span>Adresse de livraison (Livres physiques)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-medium">Ville RDC</label>
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          className="w-full p-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-medium">Commune / Rue</label>
                        <input
                          type="text"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className="w-full p-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Information e-book immédiat */}
                {hasDigital && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Lien de téléchargement sécurisé généré instantanément après paiement.</span>
                  </div>
                )}

                {/* Choix de l'opérateur Mobile Money */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Mode de règlement en RDC :
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                        paymentMethod === 'mpesa'
                          ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 shadow-sm'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                      <span>M-Pesa (Vodacom)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('orange')}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                        paymentMethod === 'orange'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 shadow-sm'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                      <span>Orange Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('airtel')}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                        paymentMethod === 'airtel'
                          ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-sm'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                      <span>Airtel Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Carte Bancaire</span>
                    </button>
                  </div>
                </div>

                {/* Saisie numéro téléphone mobile money */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Numéro de compte {paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'orange' ? 'Orange' : paymentMethod === 'airtel' ? 'Airtel' : 'Client'} :
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+243 81 000 0000"
                    className="w-full p-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pied du panier avec Totaux et Bouton de validation */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90">
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>Sous-total ouvrages :</span>
                <span className="font-mono tabular-nums">{totalCdf.toLocaleString('fr-FR')} CDF</span>
              </div>
              <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>Frais de transaction Mobile Money :</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Gratuit (Inclus)</span>
              </div>
              <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Total à payer :</span>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-400 font-mono tabular-nums block">
                    {totalCdf.toLocaleString('fr-FR')} CDF
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono tabular-nums">
                    ≈ ${totalUsd.toFixed(1)} USD
                  </span>
                </div>
              </div>
            </div>

            {currentUser ? (
              <button
                onClick={handleStartCheckout}
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Valider & Déclencher le paiement Mobile Money</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="w-full py-3 bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Se connecter pour finaliser la commande</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="mt-2 text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Paiement crypté sécurisé · Répartition équitable 70% aux auteurs</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal interactif USSD Mobile Money */}
      {showUssdModal && (
        <MobileMoneySimulatorModal
          method={paymentMethod}
          phoneNumber={phoneNumber}
          amountCdf={totalCdf}
          amountUsd={totalUsd}
          onConfirmSuccess={handleUssdConfirmed}
          onCancel={() => setShowUssdModal(false)}
        />
      )}
    </div>
  );
};
