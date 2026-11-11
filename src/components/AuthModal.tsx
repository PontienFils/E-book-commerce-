import React, { useState } from 'react';
import { 
  X, Lock, Mail, User as UserIcon, Feather, Shield, 
  CheckCircle2, AlertCircle, ArrowRight, Sparkles 
} from 'lucide-react';
import type { User, UserRole } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (user: User, token: string, message?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Champs Connexion
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Champs Inscription
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('reader');
  const [phone, setPhone] = useState('+243 ');
  const [authorBio, setAuthorBio] = useState('');

  // États
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessInfo('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');

      onAuthSuccess(data.user, data.token || '', data.message || `Bienvenue, ${data.user.name} !`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Identifiants invalides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessInfo('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: registerEmail,
          password: registerPassword,
          role: selectedRole,
          phone,
          authorBio: selectedRole === 'author' ? authorBio : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'inscription');

      if (data.pendingApproval) {
        setSuccessInfo(data.message);
        onAuthSuccess(data.user, data.token || '', data.message);
        setTimeout(() => onClose(), 2500);
      } else {
        onAuthSuccess(data.user, data.token || '', 'Compte client créé avec succès !');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur d\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setIdentifier('admin');
    setPassword('admin');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-900 text-amber-200 flex items-center justify-center font-serif font-bold text-base">
              M
            </div>
            <div>
              <h2 className="font-serif-display text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight">
                Mabele Livres RDC
              </h2>
              <span className="text-[11px] text-stone-500">
                Espace Authentification Sécurisée
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sélecteur d'onglets Connexion / Inscription */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessInfo(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'text-amber-900 dark:text-amber-400 border-b-2 border-amber-900 dark:border-amber-400 bg-white dark:bg-stone-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessInfo(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'register'
                ? 'text-amber-900 dark:text-amber-400 border-b-2 border-amber-900 dark:border-amber-400 bg-white dark:bg-stone-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Corps des formulaires */}
        <div className="p-5 sm:p-6 text-xs">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successInfo && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* ONGLET 1 : CONNEXION */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Email ou nom d'utilisateur :
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ex: admin ou kapinga.m@mabele.cd"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Mot de passe :
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                    required
                  />
                </div>
              </div>

              {/* Raccourci explicite pour l'administrateur demandé par l'utilisateur */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-[11px]">
                <div className="text-amber-900 dark:text-amber-300">
                  <span className="font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-red-600" />
                    Accès Administrateur par défaut :
                  </span>
                  <span>Utilisateur: <code>admin</code> · MDP: <code>admin</code></span>
                </div>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="px-2 py-1 bg-amber-800 text-white font-semibold rounded hover:bg-amber-700 transition-colors shrink-0"
                >
                  Remplir
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>{isLoading ? 'Connexion en cours...' : 'Se connecter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ONGLET 2 : INSCRIPTION */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Choix du rôle */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Type de compte souhaité :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('reader')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      selectedRole === 'reader'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lecteur (Client)</span>
                    </div>
                    <span className="text-[10px] text-stone-500">Accès immédiat aux achats</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('author')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      selectedRole === 'author'
                        ? 'border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Feather className="w-3.5 h-3.5 text-amber-700" />
                      <span>Auteur Indépendant</span>
                    </div>
                    <span className="text-[10px] text-stone-500">Validation admin requise</span>
                  </button>
                </div>

                {selectedRole === 'author' && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Règle de publication :</strong> Pour garantir la qualité littéraire congolaise, votre compte auteur sera examiné et validé par l'administration avant de débloquer la publication d'ouvrages.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nom et prénom (ou nom de plume) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Dieudonné Kabeya, Thérèse Lukusa..."
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Adresse email *
                </label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="nom@exemple.cd"
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Téléphone (RDC)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+243 81..."
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              {selectedRole === 'author' && (
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Présentation de l'auteur / Démarche littéraire *
                  </label>
                  <textarea
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    placeholder="Présentez brièvement vos écrits, thèmes de prédilection ou publications antérieures pour l'examen de l'admin..."
                    rows={2}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>{isLoading ? 'Inscription...' : selectedRole === 'author' ? 'Soumettre ma candidature auteur' : 'Créer mon compte lecteur'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
