import React, { useState, useEffect } from 'react';
import { 
  Shield, DollarSign, Package, Check, X, 
  ArrowUpRight, AlertCircle, Plus, CheckCircle2, RefreshCw
} from 'lucide-react';
import type { AdminDashboardStats, Category, Book } from '../types.ts';
import { PublishBookModal } from './PublishBookModal.tsx';
import { getAuthHeaders } from '../utils/auth.ts';

interface AdminDashboardProps {
  categories: Category[];
  onOpenBook: (book: Book) => void;
  onRefreshBooks: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  onOpenBook,
  onRefreshBooks
}) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprovePayout = async (payoutId: string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setActionSuccess('Virement Mobile Money validé et envoyé à l\'auteur.');
        setTimeout(() => setActionSuccess(''), 4000);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveAuthor = async (authorId: string) => {
    try {
      const res = await fetch(`/api/admin/authors/${authorId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message || 'Auteur validé avec succès ! Il peut désormais publier.');
        setTimeout(() => setActionSuccess(''), 4000);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectAuthor = async (authorId: string) => {
    try {
      const res = await fetch(`/api/admin/authors/${authorId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message || 'Candidature refusée.');
        setTimeout(() => setActionSuccess(''), 4000);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="py-20 text-center text-stone-400">
        Chargement de l'administration Mabele...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* En-tête Administration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
            <Shield className="w-4 h-4" />
            <span>Direction Générale Mabele Livres RDC</span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mt-1">
            Console d'Administration & Finances
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Supervision globale : 100% classiques, 30% commission indépendants, expédition des commandes et modération.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadAdminData}
            className="p-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl text-stone-700 dark:text-stone-300 transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-amber-900 dark:bg-stone-800 dark:hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un livre au catalogue</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Cartes métriques financières globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-stone-500 text-xs font-medium">Chiffre d'Affaires Brut Total</div>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
            {(stats?.totalGrossRevenueCdf || 0).toLocaleString('fr-FR')} CDF
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Volume d'affaires global en RDC
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-stone-500 text-xs font-medium">Part Plateforme Mabele</div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-800 dark:text-amber-400 tabular-nums">
            {(stats?.totalPlatformRevenueCdf || 0).toLocaleString('fr-FR')} CDF
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 font-medium">
            30% indépendants + 100% classiques
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-stone-500 text-xs font-medium">Royalties Reversées aux Auteurs</div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {(stats?.totalAuthorRoyaltiesCdf || 0).toLocaleString('fr-FR')} CDF
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            70% net reversé aux créateurs
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-stone-500 text-xs font-medium">Commandes & Ouvrages</div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
            {stats?.totalOrdersCount || 0} cmd · {stats?.totalBooksCount || 0} livres
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Actifs sur la plateforme
          </div>
        </div>
      </div>

      {/* SECTION VALIDATION DES CANDIDATURES D'AUTEURS (Condition requise pour publier) */}
      <div className="mt-8 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Shield className="w-4 h-4" />
              <span>Contrôle Éditorial Obligatoire</span>
            </div>
            <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
              Candidatures d'Auteurs en Attente d'Approbation ({stats?.pendingAuthors?.length || 0})
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Règle plateforme : Les auteurs indépendants inscrits doivent être formellement validés par l'administration avant de pouvoir publier leurs livres au catalogue.
            </p>
          </div>
        </div>

        {stats?.pendingAuthors && stats.pendingAuthors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.pendingAuthors.map((authorUser) => (
              <div 
                key={authorUser.id}
                className="p-4 bg-amber-50/50 dark:bg-stone-800/60 rounded-xl border border-amber-200/80 dark:border-amber-900/40 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {authorUser.name}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        {authorUser.email} · {authorUser.phone || 'Sans tél'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      En attente
                    </span>
                  </div>

                  {authorUser.authorBio && (
                    <div className="mt-2.5 p-2.5 bg-white dark:bg-stone-900/80 rounded-lg border border-stone-200/80 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 italic">
                      « {authorUser.authorBio} »
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-amber-200/60 dark:border-stone-700 flex justify-end gap-2">
                  <button
                    onClick={() => handleRejectAuthor(authorUser.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-red-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => handleApproveAuthor(authorUser.id)}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Valider l'Auteur (Autoriser la publication)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl text-center text-xs text-stone-500">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <span>Toutes les demandes d'auteurs ont été traitées. Aucun compte en attente de validation.</span>
          </div>
        )}
      </div>

      {/* Demandes de Retrait Auteurs (Payouts) */}
      <div className="mt-8 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
          Demandes de Virement Auteurs (Mobile Money M-Pesa / Orange / Airtel)
        </h3>
        
        {stats?.payoutRequests && stats.payoutRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase text-[10px]">
                  <th className="pb-2">Auteur</th>
                  <th className="pb-2">Montant (70%)</th>
                  <th className="pb-2">Opérateur</th>
                  <th className="pb-2">Numéro Téléphone</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2 text-right">Action Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {stats.payoutRequests.map((p) => (
                  <tr key={p.id} className="text-stone-700 dark:text-stone-300">
                    <td className="py-3 font-semibold">{p.authorName}</td>
                    <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {p.amountCdf.toLocaleString('fr-FR')} CDF
                    </td>
                    <td className="py-3 uppercase font-medium">{p.paymentMethod}</td>
                    <td className="py-3 font-mono">{p.phoneNumber}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {p.status === 'approved' ? 'Payé / Validé' : 'En attente'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {p.status === 'pending' ? (
                        <button
                          onClick={() => handleApprovePayout(p.id)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs transition-colors"
                        >
                          Approuver le virement
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px] italic">Traité avec succès</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic">Aucune demande de virement en attente.</p>
        )}
      </div>

      {/* Gestion des Commandes & Expéditions */}
      <div className="mt-8 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
          Toutes les Commandes Clients ({stats?.orders.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase text-[10px]">
                <th className="pb-2">Réf.</th>
                <th className="pb-2">Client</th>
                <th className="pb-2">Articles</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Paiement</th>
                <th className="pb-2">Statut Logistique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {stats?.orders.map((ord) => (
                <tr key={ord.id} className="text-stone-700 dark:text-stone-300">
                  <td className="py-3 font-mono font-bold text-amber-900 dark:text-amber-400">{ord.orderNumber}</td>
                  <td className="py-3">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">{ord.customerName}</div>
                    <div className="text-[11px] text-stone-400">{ord.shippingCity || 'Kinshasa'}</div>
                  </td>
                  <td className="py-3">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="truncate max-w-[200px]">
                        {it.quantity}x {it.title} ({it.format})
                      </div>
                    ))}
                  </td>
                  <td className="py-3 font-mono font-bold tabular-nums">
                    {ord.totalCdf.toLocaleString('fr-FR')} CDF
                  </td>
                  <td className="py-3 uppercase font-medium">
                    {ord.paymentMethod} ({ord.paymentPhone})
                  </td>
                  <td className="py-3">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      className="p-1 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-semibold text-stone-800 dark:text-stone-200"
                    >
                      <option value="paid">Payée (Paiement reçu)</option>
                      <option value="shipped">Expédiée / En cours de livraison</option>
                      <option value="delivered">Livrée au client</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <PublishBookModal
          categories={categories}
          userRole="admin"
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadAdminData();
            onRefreshBooks();
          }}
        />
      )}
    </div>
  );
};
