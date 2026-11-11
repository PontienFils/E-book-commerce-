import React, { useState } from 'react';
import { 
  BookOpen, ShoppingBag, User as UserIcon, Moon, Sun, 
  Search, Shield, Feather, X, LogOut, LogIn, UserPlus
} from 'lucide-react';
import type { User, UserRole } from '../types.ts';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string, bookId?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onLogout,
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const roleBadges: Record<UserRole, { label: string; bg: string; text: string }> = {
    reader: { label: 'Client', bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-800 dark:text-emerald-300' },
    author: { label: 'Auteur (70%)', bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-800 dark:text-amber-300' },
    admin: { label: 'Admin Direction', bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-800 dark:text-red-300' }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121417]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      
      {/* Contrat Top Bar strict à 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 md:gap-8">
        
        {/* Zone 1: Marque (Wordmark en typographie littéraire) */}
        <button 
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-2.5 text-left shrink-0 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded bg-amber-900 dark:bg-amber-700 flex items-center justify-center text-amber-100 shadow-sm transition-transform group-hover:scale-105">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 block leading-tight">
              Mabele<span className="text-amber-700 dark:text-amber-500 font-serif">.</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 block -mt-0.5">
              Livres du Congo
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation principale (Réservée strictement aux droits réels de l'utilisateur) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => onNavigate('catalog')}
            className={`whitespace-nowrap transition-colors hover:text-amber-800 dark:hover:text-amber-400 ${
              currentView === 'catalog' ? 'text-amber-800 dark:text-amber-400 font-semibold' : ''
            }`}
          >
            Catalogue
          </button>

          <button
            onClick={() => onNavigate('classics')}
            className={`whitespace-nowrap transition-colors hover:text-amber-800 dark:hover:text-amber-400 ${
              currentView === 'classics' ? 'text-amber-800 dark:text-amber-400 font-semibold' : ''
            }`}
          >
            Classiques RDC
          </button>

          {/* Accessible uniquement si authentifié */}
          {currentUser && (
            <button
              onClick={() => onNavigate('my-orders')}
              className={`whitespace-nowrap transition-colors hover:text-amber-800 dark:hover:text-amber-400 ${
                currentView === 'my-orders' ? 'text-amber-800 dark:text-amber-400 font-semibold' : ''
              }`}
            >
              Mes Achats & E-Books
            </button>
          )}

          {/* Espace Auteur : accessible STRICTEMENT aux auteurs authentifiés */}
          {currentUser && currentUser.role === 'author' && (
            <button
              onClick={() => onNavigate('author-dashboard')}
              className={`whitespace-nowrap transition-colors hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-1.5 ${
                currentView === 'author-dashboard' ? 'text-amber-800 dark:text-amber-400 font-bold' : ''
              }`}
            >
              <Feather className="w-3.5 h-3.5 text-amber-600" />
              <span>Mon Espace Auteur</span>
            </button>
          )}

          {/* Console Admin : accessible STRICTEMENT à l'administrateur authentifié */}
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className={`whitespace-nowrap transition-colors hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1.5 ${
                currentView === 'admin-dashboard' ? 'text-red-700 dark:text-red-400 font-bold' : ''
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-red-600" />
              <span>Administration</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Recherche & Actions Utilisateur Authentifié */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Recherche bureau */}
          <div className="hidden lg:flex items-center relative w-44 xl:w-56">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un livre..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Recherche mobile bouton toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 rounded-lg"
            aria-label="Recherche"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Bouton Dark Mode */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg transition-colors"
            aria-label="Changer de thème"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Bouton Panier avec compteur */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 rounded-lg text-xs font-semibold tracking-wide transition-all active:scale-95"
            aria-label="Panier"
          >
            <ShoppingBag className="w-4 h-4 text-amber-800 dark:text-amber-400" />
            <span className="hidden sm:inline">Panier</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[11px] font-bold rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* BLOC AUTHENTIFICATION SÉCURISÉ */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-stone-200 dark:border-stone-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full self-end mt-0.5 ${roleBadges[currentUser.role].bg} ${roleBadges[currentUser.role].text}`}>
                  {roleBadges[currentUser.role].label}
                </span>
              </div>

              {/* Bouton Déconnexion sécurisé */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1 p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-medium transition-colors"
                title="Déconnexion de votre compte"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-stone-200 dark:border-stone-800">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Créer un compte</span>
                <span className="sm:hidden">Inscription</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Barre de recherche mobile dépliable */}
      {mobileSearchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-1 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par titre, auteur, genre..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-600"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Barre de navigation mobile pour petits écrans */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121417] text-xs font-medium text-stone-600 dark:text-stone-300">
        <button
          onClick={() => onNavigate('catalog')}
          className={`py-1 px-2 ${currentView === 'catalog' ? 'text-amber-800 dark:text-amber-400 font-bold' : ''}`}
        >
          Catalogue
        </button>
        <button
          onClick={() => onNavigate('classics')}
          className={`py-1 px-2 ${currentView === 'classics' ? 'text-amber-800 dark:text-amber-400 font-bold' : ''}`}
        >
          Classiques
        </button>
        {currentUser && (
          <button
            onClick={() => onNavigate('my-orders')}
            className={`py-1 px-2 ${currentView === 'my-orders' ? 'text-amber-800 dark:text-amber-400 font-bold' : ''}`}
          >
            Mes Achats
          </button>
        )}
        {currentUser && currentUser.role === 'author' && (
          <button
            onClick={() => onNavigate('author-dashboard')}
            className={`py-1 px-2 text-amber-700 font-bold ${currentView === 'author-dashboard' ? 'underline' : ''}`}
          >
            Espace Auteur
          </button>
        )}
        {currentUser && currentUser.role === 'admin' && (
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className={`py-1 px-2 text-red-700 font-bold ${currentView === 'admin-dashboard' ? 'underline' : ''}`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
