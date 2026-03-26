import React from 'react';
import { PosterConcept } from '../types';

interface ConceptCardProps {
  concept: PosterConcept;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ concept }) => {
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

              <div className="mt-8 p-6 bg-[#0a0a0a] border border-gold-900/30">
                 <h4 className="text-gold-600 text-[10px] font-bold uppercase mb-2 tracking-widest font-sans">Visual Art Direction</h4>
                 <p className="text-slate-400 text-sm font-serif italic leading-relaxed">
                   "{concept.visualPrompt}"
                 </p>
              </div>
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
               <div className="flex-1 bg-gold-900/10 border border-gold-800/30 p-5 flex flex-col">
                  <h4 className="text-gold-600 text-[10px] uppercase tracking-widest mb-2 font-sans border-b border-gold-900/30 pb-2">
                    Social Copy
                  </h4>
                  <p className="text-slate-300 text-xs font-mono leading-relaxed opacity-80 flex-1">
                    {concept.socialCaption}
                  </p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptCard;