import React, { useState, useEffect } from 'react';
import Button from './Button';
import { getApiKey, setStoredApiKey, removeStoredApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getApiKey();
      setApiKey(current);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKey);
    setSaveSuccess(true);
    if (onKeySaved) {
      onKeySaved();
    }
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleRemove = () => {
    removeStoredApiKey();
    setApiKey('');
    setSaveSuccess(false);
    if (onKeySaved) {
      onKeySaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg border border-gold-700/60 bg-onyx-900/95 p-8 shadow-[0_0_50px_rgba(212,165,35,0.15)] text-slate-200 font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Vintage decorative corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold-500/50 -translate-x-1 -translate-y-1 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-500/50 translate-x-1 -translate-y-1 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-500/50 -translate-x-1 translate-y-1 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold-500/50 translate-x-1 translate-y-1 pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-gold-400 text-xl font-mono p-1 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 border border-gold-600/50 rounded-full flex items-center justify-center bg-gold-900/30 text-gold-400 shadow-[0_0_15px_rgba(212,165,35,0.2)]">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-gold-100 tracking-wide">
            Pengaturan Gemini API Key
          </h2>
          <div className="w-12 h-0.5 bg-gold-600 mx-auto my-3"></div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Masukkan Google Gemini API Key Anda untuk mulai meng-generate poster & konsep geologi emas. Key disimpan langsung di browser Anda.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-gold-400 font-sans font-semibold mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setSaveSuccess(false);
                }}
                placeholder="AIzaSy..."
                className="w-full bg-onyx-800 border border-gold-800/80 rounded-none px-3 py-2.5 pr-20 text-slate-100 text-sm font-mono focus:outline-none focus:border-gold-500 transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-sans text-gold-500 hover:text-gold-300 px-2 py-1 uppercase tracking-wider"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="text-xs text-emerald-400 font-sans flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/50 p-2.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              API Key berhasil disimpan!
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-2.5 text-xs"
              disabled={!apiKey.trim()}
            >
              Simpan API Key
            </Button>
            {apiKey && (
              <Button
                type="button"
                variant="danger"
                onClick={handleRemove}
                className="w-full sm:w-auto justify-center py-2.5 text-xs whitespace-nowrap"
              >
                Hapus
              </Button>
            )}
          </div>
        </form>

        {/* Info & External Link */}
        <div className="mt-6 pt-4 border-t border-gold-900/60 text-center font-sans">
          <p className="text-xs text-slate-400 mb-2">
            Belum punya API Key Google Gemini?
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-200 underline font-medium transition-colors"
          >
            <span>Dapatkan API Key di Google AI Studio (Gratis)</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
