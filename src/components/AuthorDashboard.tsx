import React, { useState, useEffect } from 'react';
import { 
  Feather, DollarSign, TrendingUp, BookOpen, Clock, 
  ArrowUpRight, CheckCircle2, AlertCircle, Plus, Smartphone, Heart, Star
} from 'lucide-react';
import type { AuthorDashboardStats, Category, Book, User } from '../types.ts';
import { PublishBookModal } from './PublishBookModal.tsx';
import { getAuthHeaders } from '../utils/auth.ts';

interface AuthorDashboardProps {
  currentUser: User;
  categories: Category[];
  onOpenBook: (book: Book) => void;
  onRefreshBooks: () => void;
}

export const AuthorDashboard: React.FC<AuthorDashboardProps> = ({
  currentUser,
  categories,
  onOpenBook,
  onRefreshBooks
}) => {
  const [stats, setStats] = useState<AuthorDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('10000');
  const [payoutMethod, setPayoutMethod] = useState<'mpesa' | 'orange' | 'airtel'>('mpesa');
  const [payoutPhone, setPayoutPhone] = useState(currentUser.phone || '+243 82 987 6543');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [payoutError, setPayoutError] = useState('');

  const isApproved = currentUser.isAuthorApproved !== false;

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/author/dashboard', {
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
    loadStats();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError('');
    try {
      const res = await fetch('/api/author/payouts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          amountCdf: Number(payoutAmount),
          paymentMethod: payoutMethod,
          phoneNumber: payoutPhone
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la demande');

      setPayoutSuccess(true);
      setTimeout(() => setPayoutSuccess(false), 4000);
      loadStats();
    } catch (err: any) {
      setPayoutError(err.message || 'Erreur de retrait');
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="py-20 text-center text-stone-400">
        Chargement de l'espace auteur...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* En-tête Espace Auteur */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <Feather className="w-4 h-4" />
            <span>Portail Auteur Indépendant · Répartition 70/30</span>
            {isApproved ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Validé par l'Administration
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                En attente d'approbation Admin
              </span>
            )}
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mt-1">
            Tableau de Bord de {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Suivi en temps réel de vos ventes littéraires, droits d'auteur nets (70%) et virements Mobile Money.
          </p>
        </div>

        <button
          onClick={() => {
            if (isApproved) {
              setShowPublishModal(true);
            }
          }}
          disabled={!isApproved}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shrink-0 ${
            isApproved
              ? 'bg-amber-900 hover:bg-amber-800 text-white active:scale-95 cursor-pointer'
              : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
          }`}
          title={!isApproved ? 'Validation par l\'administrateur requise pour publier' : 'Publier un livre'}
        >
          <Plus className="w-4 h-4" />
          <span>{isApproved ? 'Publier un nouveau livre' : 'Publication bloquée (En attente admin)'}</span>
        </button>
      </div>

      {/* Avertissement si auteur non encore validé */}
      {!isApproved && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <h4 className="font-bold text-sm">Compte auteur en attente d'approbation par la Direction</h4>
            <p className="mt-1 leading-relaxed">
              Votre inscription en tant qu'auteur a bien été enregistrée. Pour garantir l'authenticité et la qualité du catalogue littéraire congolais, l'administrateur de Mabele Livres examine chaque candidature avant d'activer la publication.
            </p>
            <p className="mt-2 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              Astuce Démo : Passez en rôle <strong>Administrateur</strong> (identifiant <code>admin</code>, mot de passe <code>admin</code>) pour valider votre compte auteur en un clic dans la section <em>« Validation des Auteurs »</em>.
            </p>
          </div>
        </div>
      )}

      {/* Cartes métriques financières */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Revenus Nets Gagnés (70%)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
            {(stats?.totalEarnedCdf || 0).toLocaleString('fr-FR')} CDF
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            ≈ ${((stats?.totalEarnedCdf || 0) / 2800).toFixed(1)} USD net versés
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Solde Disponible au Retrait</span>
            <Smartphone className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-800 dark:text-amber-300 tabular-nums">
            {(stats?.pendingPayoutCdf || 0).toLocaleString('fr-FR')} CDF
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
            Prêt pour transfert M-Pesa / Orange
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Exemplaires Écoulés</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
            {stats?.totalSalesCount || 0}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Ventes numériques & physiques
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Ouvrages au Catalogue</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
            {stats?.books.length || 0}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            En vente sur Mabele Livres
          </div>
        </div>
      </div>

      {/* Formulaire de Retrait Mobile Money & Liste des Ouvrages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Colonne Gauche : Demande de Virement Mobile Money (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>Demande de Retrait Mobile Money</span>
            </div>
            <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
              Virer vos royalties vers votre téléphone
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Les transferts sont traités directement vers votre compte Vodacom M-Pesa, Orange Money ou Airtel Money.
            </p>

            <form onSubmit={handleRequestPayout} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Opérateur Mobile Money RDC :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('mpesa')}
                    className={`py-2 px-1 rounded-xl text-center font-bold border transition-all ${
                      payoutMethod === 'mpesa'
                        ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('orange')}
                    className={`py-2 px-1 rounded-xl text-center font-bold border transition-all ${
                      payoutMethod === 'orange'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    Orange
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('airtel')}
                    className={`py-2 px-1 rounded-xl text-center font-bold border transition-all ${
                      payoutMethod === 'airtel'
                        ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    Airtel
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Numéro de téléphone récepteur :
                </label>
                <input
                  type="tel"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Montant à retirer (CDF) :
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  step="5000"
                  min="5000"
                  max={stats?.pendingPayoutCdf || 100000}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono font-bold"
                  required
                />
                <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                  <span>Minimum : 5 000 CDF</span>
                  <span>Solde max : {(stats?.pendingPayoutCdf || 0).toLocaleString('fr-FR')} CDF</span>
                </div>
              </div>

              {payoutError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                  {payoutError}
                </div>
              )}

              {payoutSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Demande de retrait transmise avec succès ! Traitement sous 24h.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={(stats?.pendingPayoutCdf || 0) < 5000}
                className="w-full py-3 bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Demander le versement</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500">
            Frais de réseau : 0% déduit par Mabele. Vous recevez l'intégralité des 70% de vos ventes.
          </div>
        </div>

        {/* Colonne Droite : Ouvrages de l'auteur & Historique des Ventes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Vos Ouvrages */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
              Vos Ouvrages Actifs au Catalogue ({stats?.books.length})
            </h3>
            
            <div className="space-y-3">
              {stats?.books.map((b) => (
                <div 
                  key={b.id}
                  onClick={() => onOpenBook(b)}
                  className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-800 hover:border-amber-700/50 cursor-pointer transition-colors"
                >
                  <img
                    src={b.coverUrl}
                    alt={b.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-16 object-cover rounded shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {b.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                      <span>{b.categoryName}</span>
                      <span>·</span>
                      <span className="font-mono text-amber-800 dark:text-amber-400 font-semibold">{b.priceCdf.toLocaleString('fr-FR')} CDF</span>
                      <span>·</span>
                      <span className="text-emerald-600 font-medium">Part auteur : {Math.round(b.priceCdf * 0.7).toLocaleString('fr-FR')} CDF</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-bold">{b.ratingAvg}</span> ({b.ratingCount})
                      </span>
                      <span className="flex items-center gap-0.5 text-red-500">
                        <Heart className="w-3 h-3 fill-current" />
                        <span>{b.likesCount}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dernières Transactions de Ventes */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
              Historique des Ventes & Royalties (70%)
            </h3>

            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase text-[10px]">
                      <th className="pb-2">Réf. Commande</th>
                      <th className="pb-2">Livre</th>
                      <th className="pb-2">Montant Brut</th>
                      <th className="pb-2">Votre Part (70%)</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {stats.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="text-stone-700 dark:text-stone-300">
                        <td className="py-2.5 font-mono text-[11px] font-semibold">{tx.orderNumber}</td>
                        <td className="py-2.5 font-medium truncate max-w-[150px]">{tx.bookTitle}</td>
                        <td className="py-2.5 font-mono tabular-nums">{tx.grossAmountCdf.toLocaleString('fr-FR')} CDF</td>
                        <td className="py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          +{tx.authorShareCdf.toLocaleString('fr-FR')} CDF
                        </td>
                        <td className="py-2.5 text-stone-400 text-[11px]">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">Aucune transaction enregistrée pour l'instant.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de publication de livre */}
      {showPublishModal && (
        <PublishBookModal
          categories={categories}
          userRole="author"
          onClose={() => setShowPublishModal(false)}
          onSuccess={() => {
            setShowPublishModal(false);
            loadStats();
            onRefreshBooks();
          }}
        />
      )}
    </div>
  );
};
