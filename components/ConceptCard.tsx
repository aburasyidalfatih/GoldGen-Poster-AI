import React, { useState } from 'react';
import { PosterConcept } from '../types';
import { buildImagePrompt } from '../services/geminiService';

interface ConceptCardProps {
  concept: PosterConcept;
  imagePrompt?: string;
  onPromptChange?: (prompt: string) => void;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ 
  concept, 
  imagePrompt, 
  onPromptChange 
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'json'>('prompt');
  const [copiedType, setCopiedType] = useState<'prompt' | 'json' | 'social' | null>(null);

  const defaultPrompt = buildImagePrompt(concept);
  const currentPrompt = imagePrompt !== undefined ? imagePrompt : defaultPrompt;
  const jsonString = JSON.stringify(concept, null, 2);

  const handleCopy = (text: string, type: 'prompt' | 'json' | 'social') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleResetPrompt = () => {
    if (onPromptChange) {
      onPromptChange(defaultPrompt);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gold-600/10 blur-[100px] pointer-events-none"></div>

      {/* CLASSIC FRAME CONTAINER */}
      <div className="relative bg-[#050505] border-4 border-double border-gold-700/60 p-1">
        <div className="border border-gold-900/50 p-6 md:p-10 relative">
          
          {/* CORNER ORNAMENTS */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-500"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-500"></div>

          {/* HEADER: Centered & Elegant */}
          <div className="text-center space-y-4 mb-8">
            <div className="inline-block border-b border-gold-800 pb-1 mb-2">
              <span className="text-gold-500 text-[10px] uppercase tracking-[0.3em] font-sans">Premium Concept</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-gold-100 leading-tight">
              {concept.title}
            </h2>
            <div className="w-16 h-[1px] bg-gold-600 mx-auto"></div>
            <p className="text-lg text-slate-400 font-serif italic tracking-wide">
              "{concept.tagline}"
            </p>
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8 border-t border-gold-900/50 pt-8">
            
            {/* LEFT: Infographic Data (Classic List) */}
            <div className="md:col-span-7 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] flex-1 bg-gold-900"></div>
                <h4 className="text-gold-400 font-serif text-sm uppercase tracking-widest text-center min-w-max px-2">
                  {concept.infographicTitle}
                </h4>
                <div className="h-[1px] flex-1 bg-gold-900"></div>
              </div>
              
              <ul className="space-y-4">
                {concept.infographicPoints.map((point, idx) => (
                  <li key={idx} className="flex gap-4 group">
                    <span className="font-serif text-2xl text-gold-700 group-hover:text-gold-500 transition-colors">
                      {idx + 1}.
                    </span>
                    <span className="text-slate-300 font-serif leading-relaxed text-lg border-b border-dashed border-slate-800 pb-2 w-full">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT: Details & Social */}
            <div className="md:col-span-5 flex flex-col gap-6">
               
               {/* Color Palette as 'Gems' */}
               <div>
                  <h4 className="text-gold-600 text-[10px] uppercase tracking-widest mb-3 text-center font-sans">Palette</h4>
                  <div className="flex justify-center gap-3">
                    {concept.colorPalette.map((color, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div 
                          className="w-10 h-10 rounded-sm border border-gold-900 shadow-md rotate-45 transform transition-transform hover:rotate-0" 
                          style={{ backgroundColor: color }} 
                        />
                      </div>
                    ))}
                  </div>
               </div>

               {/* Social Caption Frame */}
               <div className="flex-1 bg-gold-900/10 border border-gold-800/30 p-5 flex flex-col relative">
                  <div className="flex items-center justify-between border-b border-gold-900/30 pb-2 mb-2">
                    <h4 className="text-gold-600 text-[10px] uppercase tracking-widest font-sans font-semibold">
                      Social Copy
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy(concept.socialCaption, 'social')}
                      className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold-400 hover:text-white px-2 py-0.5 border border-gold-800/50 bg-gold-950/40 hover:border-gold-500 hover:bg-gold-900/40 transition-all cursor-pointer font-sans"
                      title="Copy Social Copy"
                    >
                      {copiedType === 'social' ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-400 font-semibold">COPIED</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-300 text-xs font-mono leading-relaxed opacity-80 flex-1 select-all">
                    {concept.socialCaption}
                  </p>
               </div>
            </div>

          </div>

          {/* PROMPT & JSON TO IMAGE INSPECTOR */}
          <div className="mt-8 border-t border-gold-900/60 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
                <h4 className="text-gold-400 font-serif text-xs uppercase tracking-[0.2em]">
                  Image Generator Payload
                </h4>
              </div>

              {/* Tab Switcher */}
              <div className="inline-flex bg-onyx-900 border border-gold-900/80 p-0.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('prompt')}
                  className={`px-3 py-1 text-[11px] font-sans tracking-wider uppercase transition-colors ${
                    activeTab === 'prompt'
                      ? 'bg-gold-600 text-onyx-900 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-gold-300'
                  }`}
                >
                  Prompt to Image
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1 text-[11px] font-sans tracking-wider uppercase transition-colors ${
                    activeTab === 'json'
                      ? 'bg-gold-600 text-onyx-900 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-gold-300'
                  }`}
                >
                  Concept JSON
                </button>
              </div>
            </div>

            {/* TAB CONTENT: PROMPT TO IMAGE */}
            {activeTab === 'prompt' && (
              <div className="bg-[#070707] border border-gold-900/60 p-4 relative">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gold-900/40 text-[11px] font-sans">
                  <span className="text-gold-500 font-mono flex items-center gap-1.5">
                    <span>Model:</span>
                    <span className="text-slate-300">gemini-3-pro-image-preview</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {onPromptChange && currentPrompt !== defaultPrompt && (
                      <button
                        type="button"
                        onClick={handleResetPrompt}
                        className="text-amber-400 hover:text-amber-200 text-[10px] uppercase tracking-wider underline transition-colors mr-2 font-mono"
                      >
                        Reset Prompt
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopy(currentPrompt, 'prompt')}
                      className="text-[10px] uppercase tracking-widest text-gold-400 hover:text-white border border-gold-800/60 px-2.5 py-1 bg-gold-950/30 transition-colors"
                    >
                      {copiedType === 'prompt' ? '✓ COPIED' : 'COPY PROMPT'}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-sans italic mb-2">
                  Prompt lengkap yang dikirim ke generator gambar. Anda dapat mengedit teks ini jika ingin menyesuaikan hasil sebelum menekan "Render Final Plate":
                </p>

                {onPromptChange ? (
                  <textarea
                    value={currentPrompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    rows={8}
                    className="w-full bg-[#030303] border border-gold-900/60 p-3 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-gold-500 transition-colors resize-y selection:bg-gold-700 selection:text-white"
                    placeholder="Enter prompt for image generation..."
                  />
                ) : (
                  <pre className="bg-[#030303] border border-gold-900/60 p-3 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto selection:bg-gold-700 selection:text-white">
                    {currentPrompt}
                  </pre>
                )}
              </div>
            )}

            {/* TAB CONTENT: CONCEPT JSON */}
            {activeTab === 'json' && (
              <div className="bg-[#070707] border border-gold-900/60 p-4 relative">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gold-900/40 text-[11px] font-sans">
                  <span className="text-gold-500 font-mono flex items-center gap-1.5">
                    <span>Format:</span>
                    <span className="text-slate-300">application/json</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(jsonString, 'json')}
                    className="text-[10px] uppercase tracking-widest text-gold-400 hover:text-white border border-gold-800/60 px-2.5 py-1 bg-gold-950/30 transition-colors"
                  >
                    {copiedType === 'json' ? '✓ COPIED' : 'COPY JSON'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 font-sans italic mb-2">
                  Struktur data JSON konsep poster yang dihasilkan AI:
                </p>

                <pre className="bg-[#030303] border border-gold-900/60 p-3 text-xs font-mono text-amber-300/90 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-gold-700 selection:text-white">
                  {jsonString}
                </pre>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConceptCard;