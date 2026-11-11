import React, { useState, useEffect } from 'react';
import { Download, Package, Clock, CheckCircle2, FileText, ShoppingBag } from 'lucide-react';
import type { Order } from '../types.ts';
import { getAuthHeaders } from '../utils/auth.ts';

interface MyOrdersViewProps {
  onGoToCatalog: () => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ onGoToCatalog }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDownload = (orderId: string, token: string, title: string) => {
    window.location.href = `/api/orders/${orderId}/download/${token}`;
    setDownloadSuccess(`Téléchargement de « ${title} » initié !`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-stone-400">
        Chargement de vos commandes et e-books...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-5 mb-6">
        <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50">
          Mes Achats & Bibliothèque Numérique
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          Retrouvez vos reçus de commande et téléchargez vos livres numériques (PDF & EPUB) sécurisés à tout moment.
        </p>
      </div>

      {downloadSuccess && (
        <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
          <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-stone-300 dark:text-stone-600 mb-3" />
          <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
            Vous n'avez pas encore passé de commande
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            Parcourez notre catalogue pour découvrir les chefs-d'œuvre de Zamenga, Sony Labou Tansi et des auteurs congolais indépendants.
          </p>
          <button
            onClick={onGoToCatalog}
            className="mt-5 px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            Découvrir le catalogue
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-sm"
            >
              {/* Entête commande */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100 dark:border-stone-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-amber-900 dark:text-amber-400">
                    Commande #{order.orderNumber}
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {order.status === 'paid' ? 'Payée' : order.status === 'shipped' ? 'Expédiée' : 'Livrée'}
                  </span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                    {order.totalCdf.toLocaleString('fr-FR')} CDF
                  </span>
                </div>
              </div>

              {/* Articles de la commande */}
              <div className="py-4 space-y-3">
                {order.items.map((item, idx) => {
                  const dlToken = order.digitalDownloadTokens?.find(t => t.bookId === item.bookId);
                  return (
                    <div 
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.coverUrl} 
                          alt={item.title} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-16 object-cover rounded shadow-sm shrink-0" 
                        />
                        <div>
                          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            {item.authorName} · {item.quantity}x {item.format === 'digital' ? 'E-Book (Numérique)' : 'Exemplaire Relié (Physique)'}
                          </p>
                          <p className="text-[11px] font-mono font-semibold text-amber-900 dark:text-amber-400 mt-0.5">
                            {(item.priceCdf * item.quantity).toLocaleString('fr-FR')} CDF
                          </p>
                        </div>
                      </div>

                      {/* Action : Téléchargement numérique sécurisé si digital */}
                      {item.format === 'digital' && dlToken && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDownload(order.id, dlToken.token, item.title)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Télécharger le livre ({dlToken.downloadCount}/{dlToken.maxDownloads})</span>
                          </button>
                        </div>
                      )}

                      {/* Info expédition physique si physique */}
                      {item.format === 'physical' && (
                        <div className="text-right text-xs">
                          <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300 font-medium">
                            <Package className="w-3.5 h-3.5 text-amber-700" />
                            <span>Livraison {order.shippingCity || 'Kinshasa'}</span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {order.shippingAddress}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pied de récapitulatif */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  Paiement effectué via : <strong className="uppercase">{order.paymentMethod}</strong> ({order.paymentPhone})
                </div>
                <div>
                  Client : {order.customerName} ({order.customerEmail})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
