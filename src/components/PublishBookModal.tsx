import React, { useState, useRef } from 'react';
import { X, BookPlus, Upload, Sparkles, CheckCircle2, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { Category, BookFormat } from '../types.ts';
import { getAuthHeaders } from '../utils/auth.ts';

interface PublishBookModalProps {
  categories: Category[];
  userRole: 'author' | 'admin';
  onClose: () => void;
  onSuccess: (newBook: any) => void;
}

export const PublishBookModal: React.FC<PublishBookModalProps> = ({
  categories,
  userRole,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_romans');
  const [collection, setCollection] = useState<'classic' | 'independent'>('independent');
  const [format, setFormat] = useState<BookFormat>('both');
  const [priceCdf, setPriceCdf] = useState('20000');
  const [sampleExcerpt, setSampleExcerpt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Upload depuis les fichiers de l'appareil
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customCover, setCustomCover] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  const coversAvailable = [
    { label: 'Souffles du Fleuve (Indigo)', url: '/src/assets/images/book_sony_labou_1794418421377.jpg' },
    { label: 'Au Fil du Congo (Ocre)', url: '/src/assets/images/book_zamenga_fleuve_1794418420056.jpg' },
    { label: 'Silent Migration (Ébène)', url: '/src/assets/images/book_mudimbe_ode_1794418421719.jpg' },
    { label: 'Contes du Baobab (Terre)', url: '/src/assets/images/book_conte_kongo_1794418422862.jpg' },
  ];
  const [selectedCover, setSelectedCover] = useState(coversAvailable[0].url);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('La taille de l\'image ne doit pas dépasser 10 Mo.');
      return;
    }

    setCustomFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomCover(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomCover = () => {
    setCustomCover(null);
    setCustomFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !priceCdf) {
      setErrorMsg('Veuillez renseigner au moins le titre et le prix.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    const finalCoverUrl = customCover || selectedCover;

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          title,
          synopsis,
          description,
          categoryId,
          collection: userRole === 'admin' ? collection : 'independent',
          format,
          priceCdf: Number(priceCdf),
          coverUrl: finalCoverUrl,
          sampleExcerpt
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la publication');

      onSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-amber-800 dark:text-amber-400" />
            <h2 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
              {userRole === 'author' ? 'Publier un Nouvel Ouvrage Indépendant (70%)' : 'Ajouter un Livre au Catalogue'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Titre de l'ouvrage *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Échos de la Tshangu, Les Lueurs du Katanga..."
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Catégorie littéraire
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Format de parution
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BookFormat)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
              >
                <option value="both">Numérique + Physique (Relié)</option>
                <option value="digital">Numérique uniquement (E-Book)</option>
                <option value="physical">Physique uniquement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Prix de vente (Francs Congolais - CDF) *
              </label>
              <input
                type="number"
                value={priceCdf}
                onChange={(e) => setPriceCdf(e.target.value)}
                step="1000"
                min="2000"
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono font-bold text-amber-900 dark:text-amber-400 focus:outline-none focus:border-amber-600"
                required
              />
              <div className="text-[11px] text-stone-400 mt-1">
                {userRole === 'author' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Votre revenu net (70%) : {Math.round(Number(priceCdf) * 0.70).toLocaleString('fr-FR')} CDF / vente
                  </span>
                )}
              </div>
            </div>

            {userRole === 'admin' && (
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Collection
                </label>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                >
                  <option value="classic">Classique RDC (100% Plateforme)</option>
                  <option value="independent">Auteur Indépendant (70/30)</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Synopsis court
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Une phrase accrocheuse résumant l'intrigue..."
              rows={2}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Extrait du premier chapitre (Feuilletable par les lecteurs)
            </label>
            <textarea
              value={sampleExcerpt}
              onChange={(e) => setSampleExcerpt(e.target.value)}
              placeholder="Les premières lignes de votre texte pour donner envie au lecteur..."
              rows={3}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-serif focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* SECTION PHOTO DE COUVERTURE : DEPUIS LES FICHIERS DE L'APPAREIL */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-700" />
                <span>Photo de couverture de votre livre</span>
              </label>
              <span className="text-[11px] text-stone-400">Ratio recommandé 3:4</span>
            </div>

            {/* Input fichier caché avec déclencheur visuel */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {/* Zone de prévisualisation ou de sélection depuis l'appareil */}
            {customCover ? (
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-300 dark:border-amber-800 flex items-center gap-4">
                <div className="w-16 h-22 aspect-[3/4] rounded-lg overflow-hidden border border-amber-400 shadow-sm shrink-0 bg-stone-900">
                  <img src={customCover} alt="Aperçu couverture" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Photo sélectionnée depuis votre appareil !</span>
                  </div>
                  <div className="text-stone-600 dark:text-stone-400 text-[11px] truncate mt-0.5 font-mono">
                    {customFileName}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded font-semibold text-[11px] hover:bg-stone-100"
                    >
                      Changer la photo
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCustomCover}
                      className="px-2.5 py-1 text-red-600 hover:text-red-700 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Retirer</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-amber-700/40 hover:border-amber-700 bg-amber-50/30 dark:bg-stone-800/50 hover:bg-amber-50/60 dark:hover:bg-stone-800 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-stone-700 flex items-center justify-center text-amber-800 dark:text-amber-300 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-200">
                  Choisir une photo depuis vos fichiers (Appareil / Téléphone)
                </div>
                <p className="text-[11px] text-stone-500 max-w-sm">
                  Cliquez ici pour parcourir vos dossiers et téléverser votre propre illustration (JPG, PNG ou WEBP jusqu'à 10 Mo).
                </p>
              </div>
            )}

            {/* Alternative : modèles artistiques */}
            <div className="mt-3">
              <span className="text-[11px] font-medium text-stone-500 block mb-1.5">
                Ou choisir l'une des couvertures d'art pré-générées :
              </span>
              <div className="grid grid-cols-4 gap-2">
                {coversAvailable.map((c) => (
                  <div
                    key={c.url}
                    onClick={() => {
                      setSelectedCover(c.url);
                      handleRemoveCustomCover();
                    }}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] ${
                      !customCover && selectedCover === c.url
                        ? 'border-amber-800 ring-2 ring-amber-700/50 scale-102'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={c.url} alt={c.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-900 hover:bg-amber-800 text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Publication en cours...' : 'Publier immédiatement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
