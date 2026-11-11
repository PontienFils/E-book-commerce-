/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Feather, Sparkles, Filter, SlidersHorizontal, 
  ArrowRight, Heart, Star, CheckCircle, Shield, RefreshCw, LogIn, Lock
} from 'lucide-react';
import type { User, Book, Category, CartItem, UserRole, PaymentMethod } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { BookCard } from './components/BookCard.tsx';
import { BookDetailModal } from './components/BookDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { AuthorDashboard } from './components/AuthorDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { MyOrdersView } from './components/MyOrdersView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { getAuthHeaders, setAuthToken, clearAuthToken, getAuthToken } from './utils/auth.ts';

export default function App() {
  // Navigation & Vues : 'catalog' | 'classics' | 'my-orders' | 'author-dashboard' | 'admin-dashboard'
  const [currentView, setCurrentView] = useState<string>('catalog');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Données utilisateur authentifié (null = visiteur non connecté)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Catalogue & Filtres
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);

  // Panier & Likes
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotalCdf, setCartTotalCdf] = useState(0);
  const [cartTotalUsd, setCartTotalUsd] = useState(0);
  const [userLikedBookIds, setUserLikedBookIds] = useState<Set<string>>(new Set(['book_1', 'book_2']));

  // Notifications toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initialiser le mode sombre
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // 2. Charger les données d'authentification réelles depuis le token
  const loadAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
      } else {
        clearAuthToken();
        setCurrentUser(null);
      }
    } catch (e) {
      console.error('Erreur chargement session:', e);
      clearAuthToken();
      setCurrentUser(null);
    }
  };

  // 3. Charger les catégories
  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error('Erreur chargement catégories:', e);
    }
  };

  // 4. Charger les livres avec filtres
  const loadBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedCollection !== 'all') params.set('collection', selectedCollection);
      if (selectedFormat !== 'all') params.set('format', selectedFormat);
      if (sortOrder) params.set('sort', sortOrder);

      const res = await fetch(`/api/books?${params.toString()}`);
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      console.error('Erreur chargement catalogue:', e);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  // 5. Charger le panier
  const loadCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setCartItems(data.items || []);
      setCartTotalCdf(data.totalCdf || 0);
      setCartTotalUsd(data.totalUsd || 0);
    } catch (e) {
      console.error('Erreur chargement panier:', e);
    }
  };

  useEffect(() => {
    loadAuth();
    loadCategories();
    loadCart();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [searchQuery, selectedCategory, selectedCollection, selectedFormat, sortOrder]);

  // Déconnexion réelle et sécurisée
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {
      console.error('Erreur déconnexion:', e);
    } finally {
      clearAuthToken();
      setCurrentUser(null);
      setCurrentView('catalog');
      showToast('Vous avez été déconnecté avec succès.');
    }
  };

  // Gérer le toggle de like (Coup de cœur)
  const handleLikeToggle = async (bookId: string) => {
    try {
      const res = await fetch(`/api/books/${bookId}/like`, { method: 'POST' });
      const data = await res.json();

      setUserLikedBookIds((prev) => {
        const next = new Set(prev);
        if (data.liked) {
          next.add(bookId);
          showToast('Ajouté à vos coups de cœur littéraires !');
        } else {
          next.delete(bookId);
          showToast('Retiré de vos coups de cœur.');
        }
        return next;
      });

      // Mettre à jour localement le compteur de likes
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, likesCount: data.likesCount } : b))
      );
      if (selectedBook && selectedBook.id === bookId) {
        setSelectedBook((prev) => prev ? { ...prev, likesCount: data.likesCount } : null);
      }
    } catch (e) {
      console.error('Erreur like:', e);
    }
  };

  // Gérer la notation et avis
  const handleSubmitRating = async (bookId: string, stars: number, reviewText: string) => {
    try {
      const res = await fetch(`/api/books/${bookId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars, reviewText })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Votre note de ${stars} étoiles a été enregistrée !`);
        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookId
              ? { ...b, ratingAvg: data.ratingAvg, ratingCount: data.ratingCount }
              : b
          )
        );
        if (selectedBook && selectedBook.id === bookId) {
          setSelectedBook((prev) =>
            prev
              ? { ...prev, ratingAvg: data.ratingAvg, ratingCount: data.ratingCount }
              : null
          );
        }
      }
    } catch (e) {
      console.error('Erreur notation:', e);
    }
  };

  // Ajouter au panier (en respectant la contrainte 1 ex pour numérique)
  const handleAddToCart = async (
    book: Book,
    format: 'digital' | 'physical',
    quantity: number = 1
  ) => {
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, format, quantity })
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.items);
        setCartTotalCdf(data.totalCdf);
        setCartTotalUsd(Math.round((data.totalCdf / 2800) * 10) / 10);
        showToast(`« ${book.title} » (${format === 'digital' ? 'E-Book' : 'Physique'}) ajouté au panier !`);
      }
    } catch (e) {
      console.error('Erreur ajout panier:', e);
    }
  };

  // Mettre à jour quantité
  const handleUpdateQuantity = async (
    bookId: string,
    format: 'digital' | 'physical',
    quantity: number
  ) => {
    try {
      const res = await fetch(`/api/cart/items/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, quantity })
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.items);
        setCartTotalCdf(data.totalCdf);
        setCartTotalUsd(Math.round((data.totalCdf / 2800) * 10) / 10);
      }
    } catch (e) {
      console.error('Erreur mise à jour quantité:', e);
    }
  };

  // Supprimer du panier
  const handleRemoveItem = async (bookId: string, format?: 'digital' | 'physical') => {
    try {
      const query = format ? `?format=${format}` : '';
      const res = await fetch(`/api/cart/items/${bookId}${query}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.items);
        setCartTotalCdf(data.totalCdf);
        setCartTotalUsd(Math.round((data.totalCdf / 2800) * 10) / 10);
      }
    } catch (e) {
      console.error('Erreur suppression panier:', e);
    }
  };

  // Passer commande avec paiement Mobile Money validé
  const handleCheckoutSuccess = async (orderData: {
    paymentMethod: PaymentMethod;
    paymentPhone: string;
    shippingCity: string;
    shippingAddress: string;
  }) => {
    if (!currentUser) {
      setAuthInitialMode('login');
      setIsAuthOpen(true);
      showToast('Veuillez vous connecter pour valider votre commande.');
      return;
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success) {
        setIsCartOpen(false);
        loadCart();
        loadBooks(); // Rafraîchit les stocks physiques
        setCurrentView('my-orders');
        showToast(
          `Paiement ${orderData.paymentMethod.toUpperCase()} validé ! Commande #${data.order.orderNumber} enregistrée.`
        );
      }
    } catch (e) {
      console.error('Erreur checkout:', e);
    }
  };

  // Navigation sécurisée avec contrôle d'accès strict
  const handleNavigate = (view: string) => {
    if (view === 'classics') {
      setSelectedCollection('classic');
      setCurrentView('catalog');
    } else if (view === 'my-orders') {
      if (!currentUser) {
        setAuthInitialMode('login');
        setIsAuthOpen(true);
        showToast('Connectez-vous pour accéder à vos commandes et e-books.');
        return;
      }
      setCurrentView('my-orders');
    } else if (view === 'author-dashboard') {
      if (!currentUser) {
        setAuthInitialMode('login');
        setIsAuthOpen(true);
        showToast('Connectez-vous avec votre compte auteur pour accéder au portail.');
        return;
      }
      if (currentUser.role !== 'author' && currentUser.role !== 'admin') {
        showToast('Accès réservé aux auteurs indépendants enregistrés.');
        return;
      }
      setCurrentView('author-dashboard');
    } else if (view === 'admin-dashboard') {
      if (!currentUser || currentUser.role !== 'admin') {
        setAuthInitialMode('login');
        setIsAuthOpen(true);
        showToast('Accès strictement réservé à la direction générale.');
        return;
      }
      setCurrentView('admin-dashboard');
    } else {
      if (view === 'catalog' && selectedCollection === 'classic') {
        setSelectedCollection('all');
      }
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredBook = books.find((b) => b.id === 'book_1') || books[0];

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#121417] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors">
      
      {/* Toast de notification flottant */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white dark:bg-white dark:text-stone-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slideUp border border-stone-700">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barre de navigation globale */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* VUE 1 : CATALOGUE & RECHERCHE */}
      {currentView === 'catalog' && (
        <main className="flex-1 pb-16">
          
          {/* Hero Section Éditorial Congolais */}
          <section className="relative overflow-hidden bg-stone-900 text-white py-12 md:py-16 border-b border-stone-800">
            <div className="absolute inset-0 bg-radial from-amber-950/40 via-stone-950/70 to-stone-950 opacity-90" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-800/60 rounded-lg text-amber-300 text-xs font-medium">
                  <Feather className="w-3.5 h-3.5" />
                  <span>Librairie Numérique & Physique · République Démocratique du Congo</span>
                </div>

                <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  La splendeur des lettres congolaises à portée de main.
                </h1>

                <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
                  Des chefs-d'œuvre patrimoniaux de Zamenga et Sony Labou Tansi aux voix émergentes de Kinshasa et Lubumbashi. Réglez en toute simplicité avec <strong className="text-amber-400">M-Pesa</strong>, <strong className="text-amber-400">Orange Money</strong> ou <strong className="text-amber-400">Airtel Money</strong>, et soutenez directement les écrivains indépendants (70% de royalties nettes).
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedCollection('classic');
                      const el = document.getElementById('catalog-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <span>Explorer les Classiques RDC</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCollection('independent');
                      const el = document.getElementById('catalog-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition-all"
                  >
                    Découvrir les Auteurs Indépendants (70%)
                  </button>
                </div>
              </div>

              {/* Vedette du mois */}
              {featuredBook && (
                <div className="lg:col-span-5 flex justify-center">
                  <div 
                    onClick={() => setSelectedBook(featuredBook)}
                    className="group relative max-w-xs w-full bg-stone-800/80 rounded-2xl p-4 border border-stone-700 hover:border-amber-700 cursor-pointer transition-all hover:scale-102 shadow-2xl"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center justify-between">
                      <span>Coup de Cœur Éditorial</span>
                      <span className="text-stone-400 font-mono">Nouveauté RDC</span>
                    </div>

                    <div className="aspect-[3/4] w-full rounded-xl overflow-hidden shadow-lg bg-stone-900">
                      <img 
                        src={featuredBook.coverUrl} 
                        alt={featuredBook.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>

                    <div className="mt-3">
                      <h3 className="font-serif-display text-base font-bold text-white group-hover:text-amber-400 truncate">
                        {featuredBook.title}
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {featuredBook.authorName} · {featuredBook.categoryName}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold font-mono text-amber-400">
                          {featuredBook.priceCdf.toLocaleString('fr-FR')} CDF
                        </span>
                        <span className="text-xs text-stone-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          <span>Voir la fiche</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Filtres & Recherche Dynamique */}
          <section id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
              
              {/* Ligne 1 : Catégories (Filtres avec click handlers conformes à frontend-design) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Genres :
                </span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-amber-900 text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  Tous les genres
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-amber-900 text-white shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Ligne 2 : Collections, Formats & Tri */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                
                {/* Collection filter */}
                <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl">
                  <span className="text-stone-400 px-2 font-medium">Collection :</span>
                  <button
                    onClick={() => setSelectedCollection('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedCollection === 'all'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => setSelectedCollection('classic')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedCollection === 'classic'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Classiques RDC
                  </button>
                  <button
                    onClick={() => setSelectedCollection('independent')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedCollection === 'independent'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Indépendants (70%)
                  </button>
                </div>

                {/* Format filter */}
                <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl">
                  <span className="text-stone-400 px-2 font-medium">Format :</span>
                  <button
                    onClick={() => setSelectedFormat('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedFormat === 'all'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setSelectedFormat('digital')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedFormat === 'digital'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    E-Book
                  </button>
                  <button
                    onClick={() => setSelectedFormat('physical')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedFormat === 'physical'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Relié
                  </button>
                </div>

                {/* Tri */}
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-medium">Trier par :</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="p-1.5 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:border-amber-600"
                  >
                    <option value="newest">Plus récents</option>
                    <option value="popularity">Coups de cœur (Likes)</option>
                    <option value="rating">Meilleures notes (★)</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grille des Livres (Conforme à 1_ecommerce_retail.md : 3-4 colonnes, ratio 3:4) */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif-display text-xl font-bold text-stone-900 dark:text-stone-100">
                  {selectedCollection === 'classic'
                    ? 'Classiques de la Littérature Congolaise'
                    : selectedCollection === 'independent'
                    ? 'Ouvrages des Auteurs Indépendants (70/30)'
                    : 'Tous les Ouvrages du Catalogue'}{' '}
                  <span className="text-xs font-normal text-stone-500 font-mono">
                    ({books.length} titres)
                  </span>
                </h2>

                {(selectedCategory !== 'all' || selectedCollection !== 'all' || selectedFormat !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedCollection('all');
                      setSelectedFormat('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-amber-800 dark:text-amber-400 hover:underline font-semibold"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>

              {isLoadingBooks ? (
                <div className="py-20 text-center text-stone-400">
                  Recherche dans la bibliothèque congolaise...
                </div>
              ) : books.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                  <BookOpen className="w-12 h-12 mx-auto stroke-1 text-stone-400 mb-3" />
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    Aucun livre ne correspond à ces critères.
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Essayez de modifier vos filtres ou de chercher un autre mot-clé.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      isLiked={userLikedBookIds.has(book.id)}
                      onLikeToggle={handleLikeToggle}
                      onSelectBook={(b) => setSelectedBook(b)}
                      onAddToCart={(b, format) => handleAddToCart(b, format)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {/* VUE 2 : MES ACHATS & E-BOOKS */}
      {currentView === 'my-orders' && (
        <main className="flex-1">
          <MyOrdersView onGoToCatalog={() => setCurrentView('catalog')} />
        </main>
      )}

      {/* VUE 3 : ESPACE AUTEUR INDÉPENDANT */}
      {currentView === 'author-dashboard' && (
        currentUser && (currentUser.role === 'author' || currentUser.role === 'admin') ? (
          <main className="flex-1">
            <AuthorDashboard
              currentUser={currentUser}
              categories={categories}
              onOpenBook={(b) => setSelectedBook(b)}
              onRefreshBooks={loadBooks}
            />
          </main>
        ) : (
          <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto">
                <Feather className="w-6 h-6" />
              </div>
              <h2 className="font-serif-display text-xl font-bold">Portail Réservé aux Auteurs Indépendants</h2>
              <p className="text-xs text-stone-500">
                Vous devez être connecté à un compte auteur pour gérer vos publications et vos royalties (70%).
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => { setAuthInitialMode('login'); setIsAuthOpen(true); }}
                  className="px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-800"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => { setAuthInitialMode('register'); setIsAuthOpen(true); }}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  Postuler comme Auteur
                </button>
              </div>
            </div>
          </main>
        )
      )}

      {/* VUE 4 : ESPACE ADMINISTRATION */}
      {currentView === 'admin-dashboard' && (
        currentUser && currentUser.role === 'admin' ? (
          <main className="flex-1">
            <AdminDashboard
              categories={categories}
              onOpenBook={(b) => setSelectedBook(b)}
              onRefreshBooks={loadBooks}
            />
          </main>
        ) : (
          <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="font-serif-display text-xl font-bold">Administration Mabele Livres</h2>
              <p className="text-xs text-stone-500">
                Accès strictement réservé à la direction générale. Connectez-vous avec vos identifiants administrateur.
              </p>
              <button
                onClick={() => { setAuthInitialMode('login'); setIsAuthOpen(true); }}
                className="px-5 py-2.5 bg-red-700 text-white rounded-xl text-xs font-bold hover:bg-red-800"
              >
                Connexion Administrateur
              </button>
            </div>
          </main>
        )
      )}

      {/* Modal Fiche Détaillée Livre & Extrait */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          isLiked={userLikedBookIds.has(selectedBook.id)}
          onLikeToggle={handleLikeToggle}
          reviews={[]}
          userRating={null}
          onSubmitRating={handleSubmitRating}
          onAddToCart={(b, format, qty) => handleAddToCart(b, format, qty)}
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* Tiroir Panier & Checkout Mobile Money */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        totalCdf={cartTotalCdf}
        totalUsd={cartTotalUsd}
        currentUser={currentUser}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckoutSuccess={handleCheckoutSuccess}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode || 'login');
          setIsAuthOpen(true);
        }}
      />

      {/* Modal d'Authentification Sécurisée (Connexion & Inscription) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user, token, message) => {
          if (token) setAuthToken(token);
          setCurrentUser(user);
          loadCart();
          loadBooks();
          if (message) showToast(message);
          if (user.role === 'author') {
            setCurrentView('author-dashboard');
          } else if (user.role === 'admin') {
            setCurrentView('admin-dashboard');
          } else {
            setCurrentView('catalog');
          }
        }}
      />

      {/* Pied de page éditorial sobre (anti-slop) */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121417] py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-display font-bold text-stone-900 dark:text-stone-200">
              Mabele Livres
            </span>
            <span>·</span>
            <span>Édition, diffusion et valorisation des lettres congolaises</span>
          </div>
          <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400">
            <span>Paiements : M-Pesa · Orange Money · Airtel Money</span>
            <span>·</span>
            <span>Kinshasa · RDC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
