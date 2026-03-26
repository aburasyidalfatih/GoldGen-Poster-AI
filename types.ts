export interface PosterConcept {
  title: string;
  tagline: string;
  description: string;
  visualPrompt: string;
  colorPalette: string[];
  infographicTitle: string;
  infographicPoints: string[];
  socialCaption: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_CONCEPT = 'GENERATING_CONCEPT',
  REVIEW_CONCEPT = 'REVIEW_CONCEPT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}