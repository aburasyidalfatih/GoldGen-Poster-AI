import React, { useState, useEffect } from 'react';
import { AppState, PosterConcept } from './types';
import * as GeminiService from './services/geminiService';
import Button from './components/Button';
import ConceptCard from './components/ConceptCard';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [concept, setConcept] = useState<PosterConcept | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // PWA & Notification State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Initialize PWA, Notifications, and API Key check
  useEffect(() => {
    // 0. Check for API Key
    const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // If not in the specific environment, assume key is present via env vars
        setHasApiKey(true);
      }
    };
    checkApiKey();

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
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setShowInstallBtn(false);
      }
      setInstallPrompt(null);
    });
  };

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/2534/2534204.png'
        });
      } catch (e) {
        console.log('Notification error', e);
      }
    }
  };

  const handleGenerateConcept = async () => {
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
      // Pass the entire concept object so text can be rendered
      const base64Image = await GeminiService.generatePosterImage(concept);
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
      sendNotification("GoldGen Poster Ready!", "Your professional infographic has been successfully generated.");
      
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
  };

  // If API Key is missing (and we are in the environment that supports selection), show selection screen
  if (!hasApiKey && typeof window !== 'undefined' && window.aistudio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-onyx-900 text-gold-100 font-serif p-4 bg-classic-vignette">
        <div className="text-center max-w-md border border-gold-800 p-8 bg-onyx-800/50 backdrop-blur-sm rounded-lg shadow-2xl relative overflow-hidden">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold-600/30 -translate-x-2 -translate-y-2"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold-600/30 translate-x-2 -translate-y-2"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold-600/30 -translate-x-2 translate-y-2"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold-600/30 translate-x-2 translate-y-2"></div>

          <div className="w-20 h-20 mx-auto mb-6 border border-gold-600/50 rounded-full flex items-center justify-center bg-gold-900/30 shadow-[0_0_15px_rgba(212,165,35,0.2)]">
            <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          
          <h1 className="text-3xl mb-2 font-serif text-gold-200 tracking-wide">Access Required</h1>
          <div className="w-12 h-0.5 bg-gold-600 mx-auto mb-4"></div>
          
          <p className="mb-8 text-slate-300 text-sm leading-relaxed font-sans font-light">
            To generate professional gold prospecting infographics with our advanced AI models, please connect your Google Cloud Project.
          </p>
          
          <Button onClick={handleSelectKey} className="w-full justify-center mb-6 py-3 text-sm">
            Connect Project
          </Button>
          
          <p className="text-xs text-slate-500 border-t border-gold-900/50 pt-4 font-sans">
            This uses a paid API key from your Google Cloud account. <br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:text-gold-300 underline transition-colors mt-1 inline-block">
              Learn more about billing
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      
      {/* PWA Install Button (Floating Top Right) */}
      {showInstallBtn && (
        <button
          onClick={handleInstallClick}
          className="fixed top-4 right-4 z-50 bg-gold-600 text-onyx-900 text-xs font-bold px-4 py-2 border border-gold-400 uppercase tracking-widest shadow-lg animate-pulse hover:animate-none"
        >
          Install App
        </button>
      )}

      {/* Header - Classic Style */}
      <div className="text-center max-w-2xl mx-auto mb-12 relative">
        <div className="w-24 h-1 bg-gold-600 mx-auto mb-6"></div>
        <h1 className="text-5xl md:text-7xl font-serif font-normal text-gold-100 mb-4 tracking-tight drop-shadow-lg">
          Gold<span className="text-gold-500 italic">Gen</span>
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
            {errorMsg}
            <button 
              onClick={() => setAppState(AppState.IDLE)} 
              className="block mx-auto mt-4 text-xs uppercase tracking-widest text-gold-500 hover:text-white border-b border-gold-500 pb-1"
            >
              Return Home
            </button>
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
            <ConceptCard concept={concept} />
            
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
                    link.download = `goldgen-classic-${Date.now()}.png`;
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
    </div>
  );
}

export default App;