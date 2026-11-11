import React from 'react';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import type { Book } from '../types.ts';

interface BookCardProps {
  book: Book;
  isLiked?: boolean;
  onLikeToggle: (bookId: string) => void;
  onSelectBook: (book: Book) => void;
  onAddToCart: (book: Book, format: 'digital' | 'physical') => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isLiked = false,
  onLikeToggle,
  onSelectBook,
  onAddToCart
}) => {
  return (
    <div className="group relative flex flex-col bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200/90 dark:border-stone-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      
      {/* Zone Image Couverture (Ratio 3:4) */}
      <div 
        onClick={() => onSelectBook(book)}
        className="relative w-full aspect-[3/4] bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer"
      >
        <img
          src={book.coverUrl}
          alt={`Couverture de ${book.title}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Indicateur subtil de collection */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {book.collection === 'classic' ? (
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-stone-900/90 backdrop-blur-sm text-amber-200 rounded">
              Classique RDC
            </span>
          ) : (
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-amber-800/90 backdrop-blur-sm text-white rounded">
              Auteur Indépendant
            </span>
          )}

          {book.format === 'digital' && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-stone-200 rounded self-start">
              E-Book (PDF/EPUB)
            </span>
          )}
          {book.format === 'physical' && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-stone-200 rounded self-start">
              Livre Relié
            </span>
          )}
        </div>

        {/* Bouton Like (Coup de cœur) décorrélé */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLikeToggle(book.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            isLiked
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 hover:text-red-500'
          }`}
          title={isLiked ? 'Retirer des coups de cœur' : 'Ajouter aux coups de cœur'}
          aria-label="Coup de cœur"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Overlay d'action rapide au survol */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectBook(book);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/95 text-stone-900 text-xs font-semibold hover:bg-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Feuilleter l'extrait</span>
          </button>
        </div>
      </div>

      {/* Métadonnées & Informations */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Métadonnées calmes sans boîtes de pilules */}
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>{book.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span>{book.pages} pages</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
              <Heart className="w-3 h-3 fill-current" />
              <span className="tabular-nums">{book.likesCount}</span>
            </span>
          </div>

          {/* Titre du livre */}
          <h3 
            onClick={() => onSelectBook(book)}
            className="font-serif-display text-base font-semibold text-stone-900 dark:text-stone-100 hover:text-amber-800 dark:hover:text-amber-400 cursor-pointer line-clamp-1 leading-snug"
          >
            {book.title}
          </h3>

          {/* Nom de l'auteur */}
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            de <span className="font-medium text-stone-800 dark:text-stone-200">{book.authorName}</span>
          </p>

          {/* Note par étoiles & nombre d'avis */}
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-1 font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                {book.ratingAvg.toFixed(1)}
              </span>
            </div>
            <span className="text-stone-400">({book.ratingCount} avis)</span>
          </div>
        </div>

        {/* Prix tabulaire & Action Panier */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-amber-900 dark:text-amber-400 font-mono tabular-nums">
              {book.priceCdf.toLocaleString('fr-FR')} CDF
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono tabular-nums">
              ≈ ${book.priceUsd.toFixed(1)} USD
            </div>
          </div>

          <button
            onClick={() => onAddToCart(book, book.format === 'digital' ? 'digital' : 'physical')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-amber-900 dark:bg-stone-800 dark:hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm active:scale-95"
            title="Ajouter au panier"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Acheter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
