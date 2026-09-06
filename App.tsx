import React, { useState, useEffect, useCallback } from 'react';
import { AppState, PosterConcept } from './types';
import * as GeminiService from './services/geminiService';
import Button from './components/Button';
import ConceptCard from './components/ConceptCard';
import ApiKeyModal from './components/ApiKeyModal';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [concept, setConcept] = useState<PosterConcept | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // PWA, Notification & API Key State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState<string>('');

  const refreshApiKeyStatus = useCallback(() => {
    const key = GeminiService.getApiKey();
    setHasApiKey(Boolean(key && key.trim()));
  }, []);

  // Initialize PWA, Notifications, and API Key check
  useEffect(() => {
    refreshApiKeyStatus();

    // 1. Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Request Notification Permission silently on load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [refreshApiKeyStatus]);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert("Aplikasi dapat diinstal langsung melalui menu browser (klik ikon Install di ujung kanan address bar atau menu Titik Tiga > 'Install Erna Gold').");
      return;
    }
    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult?.outcome === 'accepted') {
        setShowInstallBtn(false);
      }
      setInstallPrompt(null);
    } catch (err) {
      console.warn("PWA install error:", err);
    }
  };

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon-192.png'
        });
      } catch (e) {
        console.log('Notification error', e);
      }
    }
  };

  const handleGenerateConcept = async () => {
    const currentKey = GeminiService.getApiKey();
    if (!currentKey) {
      setIsKeyModalOpen(true);
      return;
    }

    // Request permission explicitly if not granted yet
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    setAppState(AppState.GENERATING_CONCEPT);
    setErrorMsg(null);
    setConcept(null);
    setImageUrl(null);
    
    try {
      const result = await GeminiService.generatePosterConcept();
      setConcept(result);
      setImagePrompt(GeminiService.buildImagePrompt(result));
      setAppState(AppState.REVIEW_CONCEPT);
    } catch (err: any) {
      console.error(err);
      // Display the actual error message
      setErrorMsg(err.message || "Failed to generate concept. Please check your internet connection.");
      setAppState(AppState.ERROR);
    }
  };

  const handleGenerateImage = async () => {
    if (!concept) return;
    
    setAppState(AppState.GENERATING_IMAGE);
    setErrorMsg(null);

    try {
      // Pass the entire concept object and custom prompt so text can be rendered
      const base64Image = await GeminiService.generatePosterImage(concept, imagePrompt);
      setImageUrl(base64Image);
      
      // --- SAVE TO LOCALSTORAGE HISTORY ---
      try {
        const historyKey = 'goldgen_history';
        const rawHistory = localStorage.getItem(historyKey);
        const history = rawHistory ? JSON.parse(rawHistory) : [];
        
        // Save minimal metadata to avoid quota limits (Title & Theme)
        const newEntry = {
          title: concept.title,
          tagline: concept.tagline,
          timestamp: Date.now()
        };
        
        // Keep only last 20 items to be safe
        const updatedHistory = [newEntry, ...history].slice(0, 20);
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn("Failed to save history to localStorage", e);
      }
      // ------------------------------------

      setAppState(AppState.FINISHED);
      
      // Trigger Notification
      sendNotification("Erna Gold Poster Ready!", "Your professional infographic has been successfully generated.");
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate image. Please try again.");
      setAppState(AppState.REVIEW_CONCEPT); 
    }
  };

  const handleCopyCaption = () => {
    if (concept?.socialCaption) {
      navigator.clipboard.writeText(concept.socialCaption);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!concept || !imageUrl) return;

    // Try Web Share API first (Mobile/Modern Browsers)
    if (navigator.share) {
      try {
        // Convert base64 to blob for sharing
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "gold-poster.png", { type: "image/png" });

        await navigator.share({
          title: concept.title,
          text: concept.socialCaption,
          files: [file],
        });
        sendNotification("Shared Successfully", "Your poster has been shared.");
        return;
      } catch (err) {
        console.log("Web Share API failed or cancelled", err);
        // Fallback to manual flow below if share fails/cancelled
      }
    }

    // Fallback: Open Facebook in new tab (User must paste caption & upload image)
    // We copy caption to clipboard automatically for convenience
    handleCopyCaption();
    window.open('https://www.facebook.com/sharer/sharer.php', '_blank');
    alert("Caption copied! Please upload the downloaded image manually to Facebook.");
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setConcept(null);
    setImageUrl(null);
    setErrorMsg(null);
    setImagePrompt('');
  };

  return (
    <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      
      {/* Top Floating Action Bar */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 sm:gap-3">
        {/* API Key Status / Configuration Button */}
        <button
          onClick={() => setIsKeyModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-2 border text-xs font-sans font-medium uppercase tracking-wider transition-all backdrop-blur-md shadow-lg ${
            hasApiKey
              ? 'border-gold-700/80 bg-onyx-900/90 text-gold-300 hover:border-gold-400 hover:text-gold-100 hover:bg-gold-950/40'
              : 'border-amber-500 bg-amber-950/85 text-amber-200 hover:bg-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse hover:animate-none'
          }`}
          title="Pengaturan Gemini API Key"
        >
          <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span className="hidden sm:inline">{hasApiKey ? 'API Key: Terpasang' : 'Input API Key'}</span>
          <span className="sm:hidden">{hasApiKey ? 'API Key' : 'Input Key'}</span>
          <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-amber-400'}`}></span>
        </button>

        {/* PWA Install Button */}
        {showInstallBtn && (
          <button
            onClick={handleInstallClick}
            className="bg-gold-600 text-onyx-900 text-xs font-bold px-3 py-2 border border-gold-400 uppercase tracking-widest shadow-lg hover:bg-gold-500 transition-colors"
          >
            Install App
          </button>
        )}
      </div>

      {/* Header - Classic Style */}
      <div className="text-center max-w-2xl mx-auto mb-12 relative">
        <div className="w-24 h-1 bg-gold-600 mx-auto mb-6"></div>
        <h1 className="text-5xl md:text-7xl font-serif font-normal text-gold-100 mb-4 tracking-tight drop-shadow-lg">
          Erna<span className="text-gold-500 italic">Gold</span>
        </h1>
        <p className="text-gold-400/80 font-serif text-lg tracking-widest uppercase text-xs border-y border-gold-900 py-2 inline-block px-8">
          The Professional Infographic Atelier
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl z-10">
        
        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-6 bg-red-950/40 border border-red-900 text-red-200 text-center font-serif">
            <div className="font-bold mb-2 uppercase tracking-widest text-red-500">System Error</div>
            <p className="mb-4">{errorMsg}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                onClick={() => setIsKeyModalOpen(true)}
                className="text-xs uppercase tracking-widest text-gold-300 hover:text-white border border-gold-600/70 bg-gold-950/50 px-4 py-2 transition-colors font-sans"
              >
                Atur API Key
              </button>
              <button 
                onClick={() => setAppState(AppState.IDLE)} 
                className="text-xs uppercase tracking-widest text-slate-400 hover:text-white border-b border-slate-600 pb-1 font-sans"
              >
                Return Home
              </button>
            </div>
          </div>
        )}

        {/* State: Idle */}
        {appState === AppState.IDLE && (
          <div className="border border-gold-900 bg-onyx-800/50 p-1">
             <div className="border border-gold-800/30 p-12 text-center backdrop-blur-sm">
                <div className="w-24 h-24 mx-auto mb-8 border-2 border-double border-gold-700 rounded-full flex items-center justify-center bg-gold-900/20">
                  <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-3xl font-serif text-gold-100 mb-4">Commission a Masterpiece</h2>
                <p className="text-slate-400 font-serif italic mb-10 max-w-lg mx-auto leading-relaxed">
                  "Allow our Artificial Intelligence to craft a bespoke, high-value visual analysis of the gold market for your discerning audience."
                </p>
                <Button onClick={handleGenerateConcept} className="mx-auto">
                  Begin Draft
                </Button>
                {!hasApiKey && (
                  <div className="mt-6 pt-4 border-t border-gold-950 flex items-center justify-center gap-2 text-xs font-sans text-amber-300/90">
                    <span>⚠️ API Key Gemini belum diatur.</span>
                    <button 
                      onClick={() => setIsKeyModalOpen(true)}
                      className="text-gold-400 underline hover:text-gold-200 font-medium"
                    >
                      Klik di sini untuk mengatur API Key
                    </button>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* State: Loading Concept */}
        {appState === AppState.GENERATING_CONCEPT && (
          <div className="text-center py-24">
            <div className="w-16 h-16 border-4 border-gold-900 border-t-gold-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gold-300 font-serif italic text-lg animate-pulse">Consulting the archives...</p>
          </div>
        )}

        {/* State: Review Concept */}
        {(appState === AppState.REVIEW_CONCEPT || appState === AppState.GENERATING_IMAGE) && concept && (
          <div className="space-y-12 animate-fade-in-up">
            <ConceptCard 
              concept={concept} 
              imagePrompt={imagePrompt}
              onPromptChange={setImagePrompt}
            />
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                variant="secondary" 
                onClick={handleGenerateConcept}
                disabled={appState === AppState.GENERATING_IMAGE}
              >
                Discard & Retry
              </Button>
              <div className="w-px h-8 bg-gold-900 hidden sm:block"></div>
              <Button 
                onClick={handleGenerateImage}
                isLoading={appState === AppState.GENERATING_IMAGE}
                className="min-w-[240px]"
              >
                Render Final Plate
              </Button>
            </div>
          </div>
        )}

        {/* State: Finished (Digital Poster Result) */}
        {appState === AppState.FINISHED && imageUrl && concept && (
          <div className="flex flex-col items-center space-y-10 animate-fade-in-up">
            
            {/* THE POSTER CONTAINER - Framed */}
            <div className="relative p-2 bg-gradient-to-br from-gold-600 via-gold-400 to-gold-700 shadow-2xl">
              <div className="bg-black p-1">
                 <img 
                  src={imageUrl} 
                  alt="Generated Professional Infographic" 
                  className="w-full h-auto max-w-md object-cover block"
                />
              </div>
            </div>

            {/* Final Action Card */}
            <div className="bg-onyx-800 border border-gold-900 p-8 w-full max-w-2xl text-center">
              <h3 className="text-2xl font-serif text-gold-100 mb-2">Acquisition Complete</h3>
              <p className="text-slate-500 font-serif italic text-sm mb-8">
                 Your visual asset has been successfully rendered.
              </p>

               {/* Caption Box */}
              <div className="bg-[#050505] border border-gold-900 p-6 mb-8 relative text-left">
                  <div className="flex justify-between items-center mb-4 border-b border-gold-900/50 pb-2">
                      <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Manifesto / Caption</span>
                      <button 
                        onClick={handleCopyCaption}
                        className="text-[10px] uppercase tracking-widest text-gold-400 hover:text-white transition-colors"
                      >
                         {isCopied ? "COPIED TO CLIPBOARD" : "COPY TEXT"}
                      </button>
                  </div>
                  <p className="text-slate-300 text-sm font-mono whitespace-pre-wrap leading-relaxed select-all opacity-80">
                      {concept.socialCaption}
                  </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = `erna-gold-${Date.now()}.png`;
                    link.click();
                  }}
                  variant="primary"
                >
                  Download Asset
                </Button>
                <Button 
                  onClick={handleShare}
                  className="bg-[#1877F2] hover:bg-[#166fe5] text-white border-transparent"
                >
                  Share to Facebook
                </Button>
                <Button variant="secondary" onClick={reset}>
                  Start New
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={refreshApiKeyStatus}
      />
    </div>
  );
}

export default App;