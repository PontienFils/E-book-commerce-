import React, { useState } from 'react';
import { 
  X, Star, Heart, ShoppingBag, BookOpen, Download, 
  Sparkles, ShieldCheck, CheckCircle2, User as UserIcon
} from 'lucide-react';
import type { Book, RatingReview } from '../types.ts';

interface BookDetailModalProps {
  book: Book;
  isLiked: boolean;
  onLikeToggle: (bookId: string) => void;
  reviews: RatingReview[];
  userRating: number | null;
  onSubmitRating: (bookId: string, stars: number, reviewText: string) => void;
  onAddToCart: (book: Book, format: 'digital' | 'physical', quantity?: number) => void;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isLiked,
  onLikeToggle,
  reviews,
  userRating,
  onSubmitRating,
  onAddToCart,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'excerpt' | 'reviews'>('details');
  const [selectedFormat, setSelectedFormat] = useState<'digital' | 'physical'>(
    book.format === 'digital' ? 'digital' : 'physical'
  );
  const [quantity, setQuantity] = useState(1);
  const [starInput, setStarInput] = useState(userRating || 5);
  const [reviewInput, setReviewInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    onSubmitRating(book.id, starInput, reviewInput);
    setIsSubmittingReview(false);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const handleAdd = () => {
    onAddToCart(book, selectedFormat, selectedFormat === 'digital' ? 1 : quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête modal avec bouton fermer */}
        <div className="p-4 sm:px-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              {book.collection === 'classic' ? 'Patrimoine Littéraire Congolais' : 'Nouvelle Vague Littéraire RDC'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du modal défilable */}
        <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Colonne Gauche : Couverture & Actions Rapides (5 colonnes) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-md bg-stone-100 dark:bg-stone-800">
              <img
                src={book.coverUrl}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              
              {/* Bouton Like décorrélé */}
              <button
                onClick={() => onLikeToggle(book.id)}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
                  isLiked
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 hover:text-red-500'
                }`}
                title={isLiked ? 'Coup de cœur actif' : 'Ajouter aux coups de cœur'}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Fiche technique littéraire */}
            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-3.5 text-xs text-stone-600 dark:text-stone-400 space-y-2">
              <div className="flex justify-between">
                <span>Catégorie :</span>
                <span className="font-semibold text-stone-900 dark:text-stone-200">{book.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span>Nombre de pages :</span>
                <span className="font-mono text-stone-900 dark:text-stone-200">{book.pages}</span>
              </div>
              <div className="flex justify-between">
                <span>Langue(s) :</span>
                <span className="font-semibold text-stone-900 dark:text-stone-200">{book.language}</span>
              </div>
              <div className="flex justify-between">
                <span>ISBN :</span>
                <span className="font-mono text-stone-900 dark:text-stone-200">{book.isbn}</span>
              </div>
              <div className="flex justify-between">
                <span>Répartition des droits :</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {book.collection === 'independent' ? '70% Auteur / 30% Mabele' : '100% Édition / Domaine Public'}
                </span>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Contenu, Onglets & Achat (7 colonnes) */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Titre & Auteur */}
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 leading-tight">
                {book.title}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                Auteur : <span className="font-semibold text-amber-900 dark:text-amber-300">{book.authorName}</span>
              </p>

              {/* Baromètre social (Likes décorrélés & Étoiles) */}
              <div className="flex items-center gap-4 mt-3 pb-4 border-b border-stone-200 dark:border-stone-800 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-mono">{book.ratingAvg.toFixed(1)} / 5</span>
                  <span className="text-stone-400 font-normal">({book.ratingCount} évaluations)</span>
                </div>
                <div className="text-stone-300">|</div>
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{book.likesCount} coups de cœur</span>
                </div>
              </div>

              {/* Onglets de contenu */}
              <div className="flex items-center gap-2 mt-4 border-b border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-amber-800 text-amber-800 dark:border-amber-400 dark:text-amber-400'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Présentation
                </button>
                <button
                  onClick={() => setActiveTab('excerpt')}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1 ${
                    activeTab === 'excerpt'
                      ? 'border-amber-800 text-amber-800 dark:border-amber-400 dark:text-amber-400'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lire un extrait</span>
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1 ${
                    activeTab === 'reviews'
                      ? 'border-amber-800 text-amber-800 dark:border-amber-400 dark:text-amber-400'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Avis lecteurs ({reviews.length})</span>
                </button>
              </div>

              {/* Contenu de l'onglet actif */}
              <div className="py-4 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                {activeTab === 'details' && (
                  <div className="space-y-3">
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      {book.synopsis}
                    </p>
                    <p className="text-stone-600 dark:text-stone-400">
                      {book.description}
                    </p>
                  </div>
                )}

                {activeTab === 'excerpt' && (
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 font-serif italic text-stone-800 dark:text-stone-200 leading-loose">
                    <div className="text-xs uppercase font-sans not-italic text-amber-800 dark:text-amber-400 font-bold mb-2">
                      Extrait du chapitre 1
                    </div>
                    « {book.sampleExcerpt || 'Extrait en cours de numérisation par les archives de Mabele.'} »
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Formulaire de notation */}
                    <form onSubmit={handleReviewSubmit} className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-200">
                          Votre évaluation :
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setStarInput(s)}
                              className="p-0.5 focus:outline-none"
                            >
                              <Star className={`w-4 h-4 ${s <= starInput ? 'text-amber-500 fill-current' : 'text-stone-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={reviewInput}
                        onChange={(e) => setReviewInput(e.target.value)}
                        placeholder="Partagez votre avis sur cet ouvrage..."
                        rows={2}
                        className="w-full p-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-3 py-1 bg-amber-900 hover:bg-amber-800 text-white rounded text-xs font-semibold transition-colors"
                        >
                          Publier mon avis
                        </button>
                      </div>
                      {reviewSubmitted && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                          Votre avis a été enregistré avec succès !
                        </div>
                      )}
                    </form>

                    {/* Liste des avis existants */}
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {reviews.length === 0 ? (
                        <p className="text-xs text-stone-400 italic">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                      ) : (
                        reviews.map((rev) => (
                          <div key={rev.id} className="p-2.5 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1">
                                <UserIcon className="w-3 h-3 text-stone-400" />
                                {rev.userName}
                              </span>
                              <div className="flex items-center text-amber-500">
                                {[...Array(rev.stars)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                              {rev.reviewText}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Module d'achat contigu (Conforme à 1_ecommerce_retail.md) */}
            <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 p-4 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Sélecteur de format */}
                <div className="flex items-center gap-2">
                  {(book.format === 'digital' || book.format === 'both') && (
                    <button
                      onClick={() => {
                        setSelectedFormat('digital');
                        setQuantity(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                        selectedFormat === 'digital'
                          ? 'bg-amber-900 text-white border-amber-900'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      Numérique (E-Book)
                    </button>
                  )}
                  {(book.format === 'physical' || book.format === 'both') && (
                    <button
                      onClick={() => setSelectedFormat('physical')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                        selectedFormat === 'physical'
                          ? 'bg-amber-900 text-white border-amber-900'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      Physique (Relié)
                    </button>
                  )}
                </div>

                {/* Quantité pour physique uniquement */}
                {selectedFormat === 'physical' && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-stone-500">Quantité :</span>
                    <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2 py-1 text-stone-600 hover:text-stone-900 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(book.stockPhysical, quantity + 1))}
                        className="px-2 py-1 text-stone-600 hover:text-stone-900 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Prix & Bouton d'achat */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-base sm:text-lg font-bold font-mono text-amber-900 dark:text-amber-400 tabular-nums">
                    {(book.priceCdf * (selectedFormat === 'digital' ? 1 : quantity)).toLocaleString('fr-FR')} CDF
                  </div>
                  <div className="text-xs text-stone-500 font-mono tabular-nums">
                    ≈ ${((book.priceUsd) * (selectedFormat === 'digital' ? 1 : quantity)).toFixed(1)} USD
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Ajouter au panier</span>
                  </button>
                </div>
              </div>

              {addedToast && (
                <div className="mt-2 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ajouté au panier avec succès !</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
