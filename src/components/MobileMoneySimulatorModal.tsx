import React, { useState } from 'react';
import { Smartphone, CheckCircle, ShieldAlert, ArrowRight, X, Lock } from 'lucide-react';
import type { PaymentMethod } from '../types.ts';

interface MobileMoneySimulatorModalProps {
  method: PaymentMethod;
  phoneNumber: string;
  amountCdf: number;
  amountUsd: number;
  onConfirmSuccess: () => void;
  onCancel: () => void;
}

export const MobileMoneySimulatorModal: React.FC<MobileMoneySimulatorModalProps> = ({
  method,
  phoneNumber,
  amountCdf,
  amountUsd,
  onConfirmSuccess,
  onCancel
}) => {
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const operatorInfo: Record<string, { name: string; color: string; prefix: string; bg: string }> = {
    mpesa: { name: 'M-Pesa (Vodacom)', color: 'text-red-600', prefix: 'Vodacom RDC', bg: 'bg-red-600' },
    orange: { name: 'Orange Money', color: 'text-orange-500', prefix: 'Orange RDC', bg: 'bg-orange-500' },
    airtel: { name: 'Airtel Money', color: 'text-rose-600', prefix: 'Airtel RDC', bg: 'bg-rose-600' },
    card: { name: 'Carte Bancaire', color: 'text-blue-600', prefix: 'Passerelle 3D-Secure', bg: 'bg-blue-600' },
    cod: { name: 'Paiement Livraison', color: 'text-emerald-600', prefix: 'Paiement physique', bg: 'bg-emerald-600' }
  };

  const op = operatorInfo[method] || operatorInfo.mpesa;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method !== 'cod' && pin.length < 4) {
      setErrorMsg('Veuillez composer votre code PIN à 4 chiffres.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onConfirmSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
        
        {/* Simulateur écran de téléphone mobile */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Invite USSD Mobile Money
            </span>
          </div>
          <button 
            onClick={onCancel}
            className="p-1 text-stone-400 hover:text-white rounded-full hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bannière Opérateur */}
        <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 mb-4">
          <div className="text-[11px] text-stone-400 uppercase font-semibold">
            {op.prefix}
          </div>
          <div className={`text-base font-bold ${op.color} mt-0.5`}>
            {op.name}
          </div>
          <div className="text-xs text-stone-300 font-mono mt-1">
            Numéro client : <span className="text-white font-bold">{phoneNumber || '+243 81 234 5678'}</span>
          </div>
        </div>

        {/* Détail du prélèvement */}
        <div className="text-center py-2 mb-4 bg-stone-950/60 rounded-xl p-3 border border-stone-800">
          <div className="text-xs text-stone-400">Montant de la commande :</div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {amountCdf.toLocaleString('fr-FR')} CDF
          </div>
          <div className="text-[11px] text-stone-500 font-mono">
            (Équivalent ${amountUsd.toFixed(1)} USD)
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Bénéficiaire : <strong className="text-stone-200">Mabele Livres RDC SARL</strong>
          </div>
        </div>

        {/* Formulaire PIN USSD */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {method !== 'cod' && (
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Entrez votre code secret PIN ({op.name}) :</span>
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="•••• (ex: 1234)"
                className="w-full text-center text-lg tracking-widest font-mono py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                autoFocus
              />
              <div className="text-[11px] text-stone-500 mt-1 text-center">
                Simulation sécurisée : entrez n'importe quel code à 4 chiffres (ex: 1234)
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs text-rose-400 text-center font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 ${
                op.bg
              } ${isProcessing ? 'opacity-70 cursor-wait' : 'hover:brightness-110'}`}
            >
              {isProcessing ? (
                <span>Validation USSD...</span>
              ) : (
                <>
                  <span>Valider le paiement</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-[10px] text-stone-500 text-center">
          Protocole Push USSD sécurisé conforme aux normes Banque Centrale du Congo (BCC).
        </div>
      </div>
    </div>
  );
};
